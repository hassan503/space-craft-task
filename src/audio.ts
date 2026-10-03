const MUTE_STORAGE_KEY = 'space-attack-muted'

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export class ArcadeAudio {
  private context?: AudioContext
  private output?: GainNode
  private muted = loadMuted()

  get isMuted() {
    return this.muted
  }

  toggle() {
    this.muted = !this.muted
    if (this.output && this.context) {
      this.output.gain.setValueAtTime(this.muted ? 0 : 1, this.context.currentTime)
    }
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this.muted))
    } catch {
      // Storage is optional; sound state still changes for this session.
    }
    return this.muted
  }

  shoot() {
    this.tone(360, 0.045, 'square', 0.025)
  }

  bombDrop() {
    this.tone(145, 0.065, 'triangle', 0.03)
  }

  enemyDestroyed() {
    this.tone(90, 0.07, 'sawtooth', 0.035)
  }

  playerDeath() {
    this.tone(48, 0.22, 'sawtooth', 0.06)
  }

  reward() {
    this.tone(620, 0.11, 'square', 0.035)
  }

  private tone(frequency: number, duration: number, type: OscillatorType, volume: number) {
    if (this.muted) return
    this.context ??= new AudioContext()
    this.output ??= this.createOutput(this.context)

    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const now = this.context.currentTime

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    oscillator.connect(gain).connect(this.output)
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect()
      gain.disconnect()
    }, { once: true })
    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  private createOutput(context: AudioContext) {
    const output = context.createGain()
    output.gain.value = this.muted ? 0 : 1
    output.connect(context.destination)
    return output
  }
}
