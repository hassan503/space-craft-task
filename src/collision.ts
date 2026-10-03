import { ENEMY_SCORES, type Enemy, type FlybyEnemy } from './enemy'
import type { Player } from './player'
import type { Bomb, Projectile } from './projectile'

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface DestructionEffect {
  x: number
  y: number
  remaining: number
}

const intersects = (first: Rectangle, second: Rectangle) =>
  first.x < second.x + second.width
  && first.x + first.width > second.x
  && first.y < second.y + second.height
  && first.y + first.height > second.y

export function resolveProjectileHits(
  projectiles: Projectile[],
  enemies: Enemy[],
  effects: DestructionEffect[],
): number {
  let awardedScore = 0

  for (const projectile of projectiles) {
    if (!projectile.active) continue

    const enemy = enemies.find((candidate) => candidate.alive && intersects(projectile, candidate))
    if (!enemy) continue

    enemy.alive = false
    projectile.active = false
    awardedScore += ENEMY_SCORES[enemy.kind]
    effects.push({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      remaining: 0.14,
    })
  }

  return awardedScore
}

export const bombHitsPlayer = (bombs: Bomb[], player: Player) =>
  bombs.some((bomb) => bomb.active && intersects(bomb, player))

export const enemyHitsPlayer = (enemies: Enemy[], player: Player) =>
  enemies.some((enemy) => enemy.alive && intersects(enemy, player))

export function projectileHitsFlyby(projectiles: Projectile[], flyby: FlybyEnemy) {
  const projectile = projectiles.find((candidate) => candidate.active && intersects(candidate, flyby))
  if (!projectile) return false

  projectile.active = false
  return true
}
