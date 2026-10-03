export const ENEMY_SCORES = {
  enemy30: 30,
  enemy20: 20,
  enemy10: 10,
} as const

export type EnemyKind = keyof typeof ENEMY_SCORES

export interface Enemy {
  x: number
  y: number
  width: number
  height: number
  kind: EnemyKind
  alive: boolean
  attacking: boolean
  attackSpeed: number
}

export interface EnemyFormation {
  enemies: Enemy[]
  direction: 1 | -1
  speed: number
}

export interface FlybyEnemy {
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: 1 | -1
}

export function updateFormation(
  formation: EnemyFormation,
  deltaSeconds: number,
  playfieldWidth: number,
) {
  let movement = formation.direction * formation.speed * deltaSeconds
  const formationEnemies = formation.enemies.filter((enemy) => enemy.alive && !enemy.attacking)
  const hitsEdge = formationEnemies.some((enemy) => (
    enemy.x + movement < 18 || enemy.x + enemy.width + movement > playfieldWidth - 18
  ))

  if (hitsEdge) {
    formation.direction = formation.direction === 1 ? -1 : 1
    movement = formation.direction * formation.speed * deltaSeconds
  }

  formationEnemies.forEach((enemy) => {
    enemy.x += movement
  })
}

export function updateAttackers(
  enemies: Enemy[],
  playerX: number,
  playerWidth: number,
  deltaSeconds: number,
  playfieldHeight: number,
) {
  const playerCenter = playerX + playerWidth / 2

  enemies.forEach((enemy) => {
    if (!enemy.alive || !enemy.attacking) return

    const enemyCenter = enemy.x + enemy.width / 2
    const horizontalDirection = Math.sign(playerCenter - enemyCenter)
    enemy.x += horizontalDirection * Math.min(72 * deltaSeconds, Math.abs(playerCenter - enemyCenter))
    enemy.y += enemy.attackSpeed * deltaSeconds
    if (enemy.y > playfieldHeight) enemy.alive = false
  })
}

export function startAttack(enemy: Enemy, speed: number) {
  enemy.attacking = true
  enemy.attackSpeed = speed
}
