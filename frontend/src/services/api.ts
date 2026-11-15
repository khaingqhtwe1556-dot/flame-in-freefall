export async function readApiResponse<T>(response: Response): Promise<T> {
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Local FastAPI response was unavailable or invalid. Start the backend and try again.')
  }

  if (!response.ok) {
    const detail =
      typeof payload === 'object' &&
      payload !== null &&
      'detail' in payload &&
      typeof payload.detail === 'string'
        ? payload.detail
        : `Local API request failed (${response.status}).`
    throw new Error(detail)
  }
  return payload as T
}
