export const missionBriefingSteps = [
  { id: 'question', label: 'The question' },
  { id: 'evidence', label: 'NASA context' },
  { id: 'explore', label: 'Explore a concept' },
  { id: 'limits', label: 'What remains unknown' },
] as const

export function moveBriefingStep(current: number, direction: -1 | 1): number {
  return Math.max(0, Math.min(missionBriefingSteps.length - 1, current + direction))
}
