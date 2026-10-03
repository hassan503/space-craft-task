import type { Enemy, EnemyFormation, EnemyKind } from './enemy'

const ROW_TYPES: EnemyKind[] = ['enemy30', 'enemy20', 'enemy20', 'enemy10', 'enemy10']

export const swarmSpeedForWave = (wave: number) => Math.min(42 + (wave - 1) * 8, 106)

export const bombRateForWave = (wave: number) => Math.min(0.45 + (wave - 1) * 0.12, 1.5)

export const attackSpeedForWave = (wave: number) => Math.min(92 + (wave - 1) * 14, 210)

export const attackIntervalForWave = (wave: number) => Math.max(1.8, 3.6 - (wave - 1) * 0.18)

export function createFormation(wave = 1): EnemyFormation {
  const enemies: Enemy[] = []

  ROW_TYPES.forEach((row, rowIndex) => {
    for (let column = 0; column < 8; column += 1) {
      enemies.push({
        x: 104 + column * 56,
        y: 92 + rowIndex * 42,
        width: 38,
        height: 29,
        kind: row,
        alive: true,
        attacking: false,
        attackSpeed: 0,
      })
    }
  })

  return { enemies, direction: 1, speed: swarmSpeedForWave(wave) }
}
