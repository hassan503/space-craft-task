import type { Player } from './player'

export interface Projectile {
  x: number
  y: number
  width: number
  height: number
  speed: number
  active: boolean
}

export interface Bomb extends Projectile {
  horizontalSpeed: number
}

export function fireProjectile(player: Player): Projectile {
  return {
    x: player.x + player.width / 2 - 2,
    y: player.y - 10,
    width: 4,
    height: 12,
    speed: 480,
    active: true,
  }
}

export function updateProjectiles(projectiles: Projectile[], deltaSeconds: number) {
  projectiles.forEach((projectile) => {
    projectile.y -= projectile.speed * deltaSeconds
    if (projectile.y + projectile.height < 0) projectile.active = false
  })
}

export function dropBomb(x: number, y: number, targetX = x): Bomb {
  return {
    x,
    y,
    width: 6,
    height: 14,
    speed: 210,
    horizontalSpeed: Math.max(-72, Math.min(72, (targetX - x) * 0.35)),
    active: true,
  }
}

export function updateBombs(
  bombs: Bomb[],
  deltaSeconds: number,
  playfieldWidth: number,
  playfieldHeight: number,
) {
  bombs.forEach((bomb) => {
    bomb.x += bomb.horizontalSpeed * deltaSeconds
    bomb.y += bomb.speed * deltaSeconds
    if (bomb.y > playfieldHeight || bomb.x + bomb.width < 0 || bomb.x > playfieldWidth) {
      bomb.active = false
    }
  })
}
