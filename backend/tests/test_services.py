import base64
import unittest

import cv2
import numpy as np
from fastapi import HTTPException

from app.schemas import RankingWeights
from app.services import analyze_csv, calculate_ranking, search_catalog
from app.ml import detect_anomalies, train_random_forest
from app.image_analysis import analyze_image


class CsvAnalysisTests(unittest.TestCase):
    def test_analysis_reports_numeric_summary_and_correlation(self) -> None:
        result = analyze_csv("time,temp\n0,10\n1,20\n2,30\n")
        self.assertEqual(result["row_count"], 3)
        self.assertEqual(result["numeric_summaries"][1]["mean"], 20)
        self.assertAlmostEqual(result["pairwise_correlations"][0]["pearson_r"], 1.0)
        self.assertIn("NASA provenance not verified", result["provenance"])

    def test_analysis_rejects_malformed_rows_and_duplicate_headers(self) -> None:
        with self.assertRaises(HTTPException):
            analyze_csv("a,b\n1\n")
        with self.assertRaises(HTTPException):
            analyze_csv("a,a\n1,2\n")


class CatalogServiceTests(unittest.TestCase):
    def test_search_returns_citations_and_retrieval_only_notice(self) -> None:
        result = search_catalog("smoke aerosol")
        self.assertEqual(result["mode"], "metadata_search")
        self.assertTrue(result["results"])
        self.assertTrue(all(item["url"].startswith("https://") for item in result["results"]))
        self.assertIn("not an LLM", result["message"])

    def test_ranking_normalizes_supported_evidence(self) -> None:
        weights = RankingWeights(
            fireSafety=30,
            microgravity=25,
            datasetAvailability=20,
            mlSuitability=15,
            missionApplicability=10,
        )
        result = calculate_ranking(weights)
        self.assertTrue(result)
        self.assertEqual(result[0]["evidence_coverage"], 65)
        self.assertIsNone(result[0]["criterion_scores"]["datasetAvailability"])

    def test_invalid_weight_total_is_rejected(self) -> None:
        weights = RankingWeights(
            fireSafety=10,
            microgravity=10,
            datasetAvailability=10,
            mlSuitability=10,
            missionApplicability=10,
        )
        with self.assertRaises(HTTPException):
            calculate_ranking(weights)


class ExploratoryModelTests(unittest.TestCase):
    def test_random_forest_uses_grouped_split_when_requested(self) -> None:
        rows = ["signal,label,run"]
        rows.extend(
            f"{index},{'high' if index >= 20 else 'low'},run-{index // 10}"
            for index in range(40)
        )
        result = train_random_forest(
            "\n".join(rows),
            target_column="label",
            problem_type="classification",
            group_column="run",
            test_size=0.25,
        )
        self.assertEqual(result["split_method"], "GroupShuffleSplit")
        self.assertTrue(result["feature_importance"])
        self.assertIn("not established", result["limitation"])

    def test_random_forest_regression_returns_error_metrics(self) -> None:
        rows = ["input,target"]
        rows.extend(f"{index},{index * 2}" for index in range(20))
        result = train_random_forest(
            "\n".join(rows),
            target_column="target",
            problem_type="regression",
            group_column=None,
            test_size=0.2,
        )
        self.assertIn("mae", result["metrics"])
        self.assertIn("rmse", result["metrics"])

    def test_isolation_forest_returns_flagged_rows(self) -> None:
        rows = ["x,y"]
        rows.extend(f"{index},{index}" for index in range(19))
        rows.append("1000,1000")
        result = detect_anomalies("\n".join(rows), contamination=0.05)
        self.assertEqual(result["row_count"], 20)
        self.assertGreater(result["anomaly_count"], 0)


class ImageAnalysisTests(unittest.TestCase):
    def test_opencv_detects_and_annotates_warm_image_regions(self) -> None:
        image = np.zeros((80, 80, 3), dtype=np.uint8)
        image[20:55, 25:50] = (0, 150, 255)
        encoded, buffer = cv2.imencode(".png", image)
        self.assertTrue(encoded)

        result = analyze_image(base64.b64encode(buffer).decode("ascii"), "local-test.png")

        self.assertEqual(result["file_name"], "local-test.png")
        self.assertGreater(result["candidate_pixels"], 0)
        self.assertIsNotNone(result["bounds"])
        self.assertTrue(result["annotated_image_base64"])
        self.assertIn("not a trained AI model", result["limitation"])

    def test_opencv_rejects_invalid_image_payloads(self) -> None:
        with self.assertRaises(HTTPException) as error:
            analyze_image("bm90LWltYWdl", "invalid.png")
        self.assertEqual(error.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
