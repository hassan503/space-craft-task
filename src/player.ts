export interface Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export function createPlayer(playfieldWidth: number, playfieldHeight: number): Player {
  const width = 44
  const height = 33

  return {
    x: (playfieldWidth - width) / 2,
    y: playfieldHeight - 78,
    width,
    height,
    speed: 270,
  }
}

export function movePlayer(player: Player, direction: number, deltaSeconds: number, playfieldWidth: number) {
  player.x += direction * player.speed * deltaSeconds
  player.x = Math.max(8, Math.min(playfieldWidth - player.width - 8, player.x))
}
