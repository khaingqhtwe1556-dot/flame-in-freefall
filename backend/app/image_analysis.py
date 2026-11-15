import base64
import binascii
from typing import Any

import cv2
import numpy as np
from fastapi import HTTPException

MAX_IMAGE_BYTES = 12 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000


def analyze_image(image_base64: str, file_name: str) -> dict[str, Any]:
    try:
        image_bytes = base64.b64decode(image_base64, validate=True)
    except (binascii.Error, ValueError) as error:
        raise HTTPException(status_code=422, detail="Image data must be valid base64.") from error

    if not image_bytes or len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image size must be between 1 byte and 12 MB.")

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="The uploaded content is not a supported image.")

    height, width = image.shape[:2]
    if width * height > MAX_IMAGE_PIXELS:
        raise HTTPException(status_code=413, detail="Image dimensions exceed the 25 megapixel processing limit.")

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    warm_pixels = cv2.inRange(hsv, np.array([0, 55, 80]), np.array([38, 255, 255]))
    red_wraparound = cv2.inRange(hsv, np.array([170, 55, 80]), np.array([179, 255, 255]))
    mask = cv2.bitwise_or(warm_pixels, red_wraparound)
    kernel = np.ones((3, 3), dtype=np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    candidate_pixels = int(cv2.countNonZero(mask))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bounds = None
    centroid = None
    if contours:
        largest = max(contours, key=cv2.contourArea)
        x, y, box_width, box_height = cv2.boundingRect(largest)
        moments = cv2.moments(largest)
        bounds = {"x": x, "y": y, "width": box_width, "height": box_height}
        if moments["m00"]:
            centroid = {"x": round(moments["m10"] / moments["m00"], 2), "y": round(moments["m01"] / moments["m00"], 2)}

    annotated = image.copy()
    overlay = image.copy()
    overlay[mask > 0] = (48, 122, 255)
    annotated = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)
    if bounds:
        cv2.rectangle(
            annotated,
            (bounds["x"], bounds["y"]),
            (bounds["x"] + bounds["width"] - 1, bounds["y"] + bounds["height"] - 1),
            (235, 211, 76),
            max(1, round(width / 500)),
        )

    success, encoded = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 88])
    if not success:
        raise HTTPException(status_code=500, detail="Could not encode the annotated image.")

    return {
        "file_name": file_name,
        "width": width,
        "height": height,
        "candidate_pixels": candidate_pixels,
        "area_percent": round(candidate_pixels / (width * height) * 100, 4),
        "bounds": bounds,
        "centroid": centroid,
        "annotated_image_base64": base64.b64encode(encoded).decode("ascii"),
        "algorithm": "OpenCV HSV warm-color threshold with morphological cleanup",
        "limitation": "Color heuristic only; not a trained AI model or fire-risk estimate. Lighting, background, and camera conditions can create false matches.",
    }
