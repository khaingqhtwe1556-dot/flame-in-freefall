export type GravityMode = 'earth' | 'microgravity'

export interface FlameSettings {
  oxygen: number
  airflow: number
  temperature: number
  fuel: string
  gravity: GravityMode
  playing: boolean
}

export const initialFlameSettings: FlameSettings = {
  oxygen: 21,
  airflow: 18,
  temperature: 850,
  fuel: 'Gaseous fuel',
  gravity: 'microgravity',
  playing: true,
}
