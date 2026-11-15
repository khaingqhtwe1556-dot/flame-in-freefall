import type { GravityMode } from '../types/flame'

export function getGravityExplanation(gravity: GravityMode, oxygen: number, airflow: number): string {
  const settingNote = `The ${oxygen}% oxygen and ${airflow}% airflow controls change the illustration only; they are not experimental inputs.`
  const gravityNote = gravity === 'microgravity'
    ? 'This low-gravity concept is drawn rounder to suggest reduced buoyancy and a greater relative role for transport such as diffusion.'
    : 'This Earth-gravity concept is drawn as an upward plume to suggest buoyancy-driven flow.'
  return `${gravityNote} Actual flame behavior depends on experimental conditions. ${settingNote}`
}
