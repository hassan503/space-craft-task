const svg = (body: string, color: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" shape-rendering="crispEdges">
    <g fill="${color}">${body}</g>
  </svg>
`

const SPRITE_SVGS = {
  player: svg(`
    <rect x="14" y="2" width="4" height="4"/>
    <rect x="10" y="6" width="12" height="4"/>
    <rect x="6" y="10" width="20" height="8"/>
    <rect x="2" y="14" width="6" height="6"/>
    <rect x="24" y="14" width="6" height="6"/>
    <rect x="10" y="18" width="4" height="4"/>
    <rect x="18" y="18" width="4" height="4"/>
  `, '#f4f7ff'),
  enemy30: svg(`
    <rect x="8" y="4" width="16" height="4"/>
    <rect x="4" y="8" width="24" height="8"/>
    <rect x="2" y="12" width="4" height="8"/>
    <rect x="26" y="12" width="4" height="8"/>
    <rect x="8" y="16" width="4" height="4"/>
    <rect x="20" y="16" width="4" height="4"/>
    <rect x="10" y="10" width="4" height="4" fill="#05070d"/>
    <rect x="18" y="10" width="4" height="4" fill="#05070d"/>
  `, '#ff5cd6'),
  enemy20: svg(`
    <rect x="6" y="4" width="4" height="4"/>
    <rect x="22" y="4" width="4" height="4"/>
    <rect x="4" y="8" width="24" height="8"/>
    <rect x="8" y="16" width="4" height="6"/>
    <rect x="20" y="16" width="4" height="6"/>
    <rect x="10" y="10" width="4" height="4" fill="#05070d"/>
    <rect x="18" y="10" width="4" height="4" fill="#05070d"/>
  `, '#5ce1ff'),
  enemy10: svg(`
    <rect x="10" y="4" width="12" height="4"/>
    <rect x="6" y="8" width="20" height="4"/>
    <rect x="2" y="12" width="28" height="4"/>
    <rect x="6" y="16" width="6" height="4"/>
    <rect x="20" y="16" width="6" height="4"/>
    <rect x="10" y="10" width="4" height="4" fill="#05070d"/>
    <rect x="18" y="10" width="4" height="4" fill="#05070d"/>
  `, '#8cff66'),
  flyby: svg(`
    <rect x="10" y="4" width="12" height="4"/>
    <rect x="4" y="8" width="24" height="8"/>
    <rect x="0" y="12" width="32" height="4"/>
    <rect x="8" y="16" width="16" height="4"/>
    <rect x="14" y="20" width="4" height="4"/>
    <rect x="8" y="10" width="4" height="4" fill="#05070d"/>
    <rect x="20" y="10" width="4" height="4" fill="#05070d"/>
  `, '#fff36b'),
}

export type SpriteName = keyof typeof SPRITE_SVGS

const SPRITE_DATA_URLS = Object.fromEntries(
  (Object.keys(SPRITE_SVGS) as SpriteName[]).map((name) => [
    name,
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SPRITE_SVGS[name])}`,
  ]),
) as Record<SpriteName, string>

export const spriteDataUrl = (name: SpriteName) => SPRITE_DATA_URLS[name]

export async function loadSpriteImages(): Promise<Record<SpriteName, HTMLImageElement>> {
  const names = Object.keys(SPRITE_SVGS) as SpriteName[]
  const entries = await Promise.all(names.map(async (name) => {
    const image = new Image()
    image.src = spriteDataUrl(name)
    await image.decode()
    return [name, image] as const
  }))

  return Object.fromEntries(entries) as Record<SpriteName, HTMLImageElement>
}
