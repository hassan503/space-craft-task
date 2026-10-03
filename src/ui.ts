import { spriteDataUrl } from './sprites'

export interface GameUI {
  canvas: HTMLCanvasElement
  startScreen: HTMLElement
  resultScreen: HTMLElement
  resultEyebrow: HTMLElement
  finalScore: HTMLElement
  announcement: HTMLElement
  rewardToast: HTMLElement
  powerups: HTMLElement
  tutorial: HTMLElement
  score: HTMLElement
  highScore: HTMLElement
  wave: HTMLElement
  lives: HTMLElement
  bottomHud: HTMLElement
  playButton: HTMLButtonElement
  replayButton: HTMLButtonElement
  muteButton: HTMLButtonElement
}

const scoreLabel = (value: number) => value.toString().padStart(6, '0')

export function createUI(root: HTMLElement): GameUI {
  root.innerHTML = `
    <main class="arcade-shell" aria-label="Space Attack game">
      <header class="game-hud game-hud--top" aria-live="polite">
        <div><span class="hud-label">SCORE</span><strong id="score">000000</strong></div>
        <button id="mute" class="icon-button" type="button" aria-pressed="false" aria-label="Mute sound">SOUND ON</button>
        <div class="hud-right"><span class="hud-label">HIGH SCORE</span><strong id="high-score">000000</strong></div>
      </header>

      <section class="playfield">
        <canvas id="game-canvas" width="640" height="720" aria-label="Space Attack playfield" tabindex="0"></canvas>

        <div id="start-screen" class="screen-panel">
          <p class="eyebrow">INSERT COURAGE</p>
          <h1>SPACE<br><span>ATTACK</span></h1>
          <div class="enemy-values" aria-label="Enemy point values">
            <div><img src="${spriteDataUrl('enemy30')}" alt="Top enemy"><strong>30</strong></div>
            <div><img src="${spriteDataUrl('enemy20')}" alt="Middle enemy"><strong>20</strong></div>
            <div><img src="${spriteDataUrl('enemy10')}" alt="Bottom enemy"><strong>10</strong></div>
          </div>
          <section class="menu-rewards" aria-label="Rewards">
            <p class="menu-section-label">REWARDS</p>
            <div class="menu-reward-list">
              <span>RAPID FIRE <strong>— 8s</strong></span>
              <span>SHIELD <strong>— 8s</strong></span>
              <span>BONUS <strong>— +500</strong></span>
            </div>
          </section>
          <button id="play" class="pixel-button" type="button">PLAY</button>
        </div>

        <div id="tutorial" class="tutorial" hidden>
          <p><kbd>←</kbd> <kbd>→</kbd> MOVE</p>
          <p><kbd>SPACE</kbd> FIRE</p>
        </div>

        <div id="announcement" class="announcement" hidden></div>
        <div id="reward-toast" class="reward-toast" role="status" aria-live="polite" hidden></div>
        <div id="powerups" class="powerups" aria-live="polite" hidden></div>

        <div id="result-screen" class="screen-panel" hidden>
          <p id="result-eyebrow" class="eyebrow">FINAL SCORE</p>
          <h2>GAME OVER</h2>
          <strong id="final-score" class="final-score">000000</strong>
          <button id="replay" class="pixel-button" type="button">PLAY AGAIN</button>
        </div>
      </section>

      <footer class="game-hud game-hud--bottom" hidden>
        <div><span class="hud-label">LIVES</span><span id="lives" class="lives"></span></div>
        <div class="hud-right"><span class="hud-label">WAVE</span><strong id="wave">01</strong></div>
      </footer>
    </main>
  `

  const get = <T extends Element>(selector: string) => {
    const element = root.querySelector<T>(selector)
    if (!element) throw new Error(`Missing UI element: ${selector}`)
    return element
  }

  return {
    canvas: get<HTMLCanvasElement>('#game-canvas'),
    startScreen: get('#start-screen'),
    resultScreen: get('#result-screen'),
    resultEyebrow: get('#result-eyebrow'),
    finalScore: get('#final-score'),
    announcement: get('#announcement'),
    rewardToast: get('#reward-toast'),
    powerups: get('#powerups'),
    tutorial: get('#tutorial'),
    score: get('#score'),
    highScore: get('#high-score'),
    wave: get('#wave'),
    lives: get('#lives'),
    bottomHud: get('.game-hud--bottom'),
    playButton: get<HTMLButtonElement>('#play'),
    replayButton: get<HTMLButtonElement>('#replay'),
    muteButton: get<HTMLButtonElement>('#mute'),
  }
}

export function updateScores(ui: GameUI, score: number, highScore: number) {
  const scoreText = scoreLabel(score)
  const highScoreText = scoreLabel(highScore)
  if (ui.score.textContent !== scoreText) ui.score.textContent = scoreText
  if (ui.highScore.textContent !== highScoreText) ui.highScore.textContent = highScoreText
}

export function updateWave(ui: GameUI, wave: number) {
  ui.wave.textContent = wave.toString().padStart(2, '0')
}

export function updateLives(ui: GameUI, lives: number) {
  ui.lives.innerHTML = Array.from({ length: lives }, () =>
    `<img src="${spriteDataUrl('player')}" alt="" aria-hidden="true">`,
  ).join('')
  ui.lives.setAttribute('aria-label', `${lives} lives`)
}

export function showAnnouncement(ui: GameUI, message: string) {
  ui.announcement.hidden = false
  ui.announcement.textContent = message
}

export function hideAnnouncement(ui: GameUI) {
  ui.announcement.hidden = true
  ui.announcement.textContent = ''
}

export function updateRewards(
  ui: GameUI,
  rewardName: string | undefined,
  rapidFireRemaining: number,
  shieldRemaining: number,
) {
  const rewardText = rewardName ?? ''
  if (ui.rewardToast.textContent !== rewardText) ui.rewardToast.textContent = rewardText
  ui.rewardToast.hidden = !rewardName

  const activeRewards = [
    rapidFireRemaining > 0 ? `RAPID FIRE ${Math.ceil(rapidFireRemaining)}s` : '',
    shieldRemaining > 0 ? `SHIELD ${Math.ceil(shieldRemaining)}s` : '',
  ].filter(Boolean)
  const powerupText = activeRewards.join('  |  ')
  ui.powerups.hidden = activeRewards.length === 0
  if (ui.powerups.textContent !== powerupText) ui.powerups.textContent = powerupText
}

export function showGameOver(ui: GameUI, score: number, isNewHighScore: boolean) {
  ui.resultEyebrow.textContent = isNewHighScore ? 'NEW HIGH SCORE' : 'FINAL SCORE'
  ui.finalScore.textContent = scoreLabel(score)
  ui.resultScreen.hidden = false
}

export function updateMuteButton(button: HTMLButtonElement, muted: boolean) {
  button.textContent = muted ? 'SOUND OFF' : 'SOUND ON'
  button.setAttribute('aria-pressed', muted.toString())
  button.setAttribute('aria-label', muted ? 'Turn sound on' : 'Mute sound')
}
