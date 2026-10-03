import { ArcadeAudio } from "./audio";
import {
  bombHitsPlayer,
  enemyHitsPlayer,
  projectileHitsFlyby,
  resolveProjectileHits,
  type DestructionEffect,
} from "./collision";
import {
  startAttack,
  updateAttackers,
  updateFormation,
  type EnemyFormation,
  type FlybyEnemy,
} from "./enemy";
import { createPlayer, movePlayer, type Player } from "./player";
import {
  dropBomb,
  fireProjectile,
  updateBombs,
  updateProjectiles,
  type Bomb,
  type Projectile,
} from "./projectile";
import { loadSpriteImages, type SpriteName } from "./sprites";
import {
  createUI,
  hideAnnouncement,
  showAnnouncement,
  showGameOver,
  updateMuteButton,
  updateScores,
  updateRewards,
  updateLives,
  updateWave,
  type GameUI,
} from "./ui";
import {
  attackIntervalForWave,
  attackSpeedForWave,
  bombRateForWave,
  createFormation,
} from "./waves";

const WIDTH = 640;
const HEIGHT = 720;
const STARTING_LIVES = 3;
const RECOVERY_SECONDS = 1;
const INVULNERABILITY_SECONDS = 1.5;
const WAVE_TRANSITION_SECONDS = 1.1;
const POWERUP_SECONDS = 8;
const MAX_SCORE = 999999;
const HIGH_SCORE_STORAGE_KEY = "space-attack-high-score";
const GAME_KEYS = new Set(["ArrowLeft", "ArrowRight", "Space"]);

type RewardName = "RAPID FIRE" | "SHIELD" | "BONUS +500";

function loadHighScore() {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (stored === null) return 0;
    const value = Number(stored);
    return Number.isInteger(value) && value >= 0 && value <= MAX_SCORE
      ? value
      : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(value: number) {
  try {
    localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(value));
  } catch {
    // Persistence is optional; gameplay continues with the in-memory value.
  }
}

type GameState =
  | "start"
  | "playing"
  | "recovering"
  | "waveTransition"
  | "gameOver";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

export class SpaceAttackGame {
  private readonly ui: GameUI;
  private readonly context: CanvasRenderingContext2D;
  private readonly audio = new ArcadeAudio();
  private readonly pressedKeys = new Set<string>();
  private readonly stars: Star[];
  private sprites?: Record<SpriteName, HTMLImageElement>;
  private player: Player = createPlayer(WIDTH, HEIGHT);
  private formation: EnemyFormation = createFormation();
  private projectiles: Projectile[] = [];
  private bombs: Bomb[] = [];
  private effects: DestructionEffect[] = [];
  private state: GameState = "start";
  private score = 0;
  private highScore = loadHighScore();
  private lives = STARTING_LIVES;
  private wave = 1;
  private fireCooldown = 0;
  private bombCountdown = 0;
  private bombSequence = 0;
  private attackCountdown = 0;
  private recoveryRemaining = 0;
  private invulnerabilityRemaining = 0;
  private transitionRemaining = 0;
  private flyby?: FlybyEnemy;
  private flybyCountdown = 0;
  private rapidFireRemaining = 0;
  private shieldRemaining = 0;
  private rewardName?: RewardName;
  private rewardMessageRemaining = 0;
  private achievedHighScore = false;
  private previousTime = performance.now();
  private animationFrame?: number;

  constructor(root: HTMLElement) {
    this.ui = createUI(root);
    const context = this.ui.canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is unavailable");
    this.context = context;
    this.context.imageSmoothingEnabled = false;
    this.stars = this.createStars();

    this.ui.playButton.addEventListener("click", () => this.start());
    this.ui.replayButton.addEventListener("click", () => this.start());
    this.ui.muteButton.addEventListener("click", () => {
      updateMuteButton(this.ui.muteButton, this.audio.toggle());
    });
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
    window.addEventListener("keyup", (event) =>
      this.pressedKeys.delete(event.code),
    );
    window.addEventListener("blur", () => this.pressedKeys.clear());

    updateWave(this.ui, this.wave);
    updateLives(this.ui, this.lives);
    updateScores(this.ui, this.score, this.highScore);
    updateMuteButton(this.ui.muteButton, this.audio.isMuted);
    updateRewards(this.ui, undefined, 0, 0);
    void loadSpriteImages().then((sprites) => {
      this.sprites = sprites;
    });
    this.scheduleFrame();
  }

  private start() {
    this.state = "playing";
    this.player = createPlayer(WIDTH, HEIGHT);
    this.formation = createFormation();
    this.projectiles = [];
    this.bombs = [];
    this.effects = [];
    this.flyby = undefined;
    this.score = 0;
    this.lives = STARTING_LIVES;
    this.wave = 1;
    this.fireCooldown = 0;
    this.bombSequence = 0;
    this.bombCountdown = this.bombInterval();
    this.attackCountdown = this.nextAttackDelay();
    this.recoveryRemaining = 0;
    this.invulnerabilityRemaining = 0;
    this.transitionRemaining = 0;
    this.flybyCountdown = this.nextFlybyDelay();
    this.rapidFireRemaining = 0;
    this.shieldRemaining = 0;
    this.rewardName = undefined;
    this.rewardMessageRemaining = 0;
    this.achievedHighScore = false;
    this.pressedKeys.clear();
    this.ui.startScreen.hidden = true;
    this.ui.resultScreen.hidden = true;
    this.ui.bottomHud.hidden = false;
    this.ui.tutorial.hidden = false;
    hideAnnouncement(this.ui);
    updateWave(this.ui, this.wave);
    updateLives(this.ui, this.lives);
    updateScores(this.ui, this.score, this.highScore);
    updateRewards(this.ui, undefined, 0, 0);
    this.ui.canvas.focus();
    this.scheduleFrame();
  }

  private onKeyDown(event: KeyboardEvent) {
    if (!GAME_KEYS.has(event.code) || this.state !== "playing") return;
    event.preventDefault();

    if (!this.ui.tutorial.hidden) this.ui.tutorial.hidden = true;

    this.pressedKeys.add(event.code);
    if (event.code === "Space" && !event.repeat) this.fire();
  }

  private fire() {
    if (this.fireCooldown > 0) return;
    this.projectiles.push(fireProjectile(this.player));
    this.fireCooldown = this.rapidFireRemaining > 0 ? 0.15 : 0.24;
    this.audio.shoot();
  }

  private loop(time: number) {
    this.animationFrame = undefined;
    const deltaSeconds = Math.min((time - this.previousTime) / 1000, 0.033);
    this.previousTime = time;

    if (this.state === "playing") this.updateCombat(deltaSeconds);
    else if (this.state === "recovering") this.updateRecovery(deltaSeconds);
    else if (this.state === "waveTransition")
      this.updateWaveTransition(deltaSeconds);
    this.render();
    if (this.isSimulationActive()) this.scheduleFrame();
  }

  private scheduleFrame() {
    this.animationFrame ??= requestAnimationFrame((time) => this.loop(time));
  }

  private isSimulationActive() {
    return (
      this.state === "playing" ||
      this.state === "recovering" ||
      this.state === "waveTransition"
    );
  }

  private updateCombat(deltaSeconds: number) {
    this.updateRewardTimers(deltaSeconds);
    this.updateFlyby(deltaSeconds);
    this.invulnerabilityRemaining = Math.max(
      0,
      this.invulnerabilityRemaining - deltaSeconds,
    );
    const direction =
      Number(this.pressedKeys.has("ArrowRight")) -
      Number(this.pressedKeys.has("ArrowLeft"));
    movePlayer(this.player, direction, deltaSeconds, WIDTH);
    updateFormation(this.formation, deltaSeconds, WIDTH);
    updateAttackers(
      this.formation.enemies,
      this.player.x,
      this.player.width,
      deltaSeconds,
      HEIGHT,
    );
    updateProjectiles(this.projectiles, deltaSeconds);
    updateBombs(this.bombs, deltaSeconds, WIDTH, HEIGHT);
    this.updateBombSpawner(deltaSeconds);
    this.updateAttackerSpawner(deltaSeconds);
    this.fireCooldown = Math.max(0, this.fireCooldown - deltaSeconds);

    if (enemyHitsPlayer(this.formation.enemies, this.player)) {
      this.endGame();
      return;
    }

    const earned = resolveProjectileHits(
      this.projectiles,
      this.formation.enemies,
      this.effects,
    );
    if (earned > 0) {
      this.addScore(earned);
      this.audio.enemyDestroyed();
    }

    if (this.flyby && projectileHitsFlyby(this.projectiles, this.flyby)) {
      this.effects.push({
        x: this.flyby.x + this.flyby.width / 2,
        y: this.flyby.y + this.flyby.height / 2,
        remaining: 0.14,
      });
      this.flyby = undefined;
      this.flybyCountdown = this.nextFlybyDelay();
      this.audio.enemyDestroyed();
      this.grantReward();
    }

    this.projectiles = this.projectiles.filter(
      (projectile) => projectile.active,
    );
    this.bombs = this.bombs.filter((bomb) => bomb.active);
    this.effects.forEach((effect) => {
      effect.remaining -= deltaSeconds;
    });
    this.effects = this.effects.filter((effect) => effect.remaining > 0);

    if (
      this.invulnerabilityRemaining === 0 &&
      this.shieldRemaining === 0 &&
      bombHitsPlayer(this.bombs, this.player)
    ) {
      this.takeDamage();
      return;
    }

    if (this.formation.enemies.every((enemy) => !enemy.alive))
      this.beginWaveTransition();
  }

  private updateRewardTimers(deltaSeconds: number) {
    this.rapidFireRemaining = Math.max(
      0,
      this.rapidFireRemaining - deltaSeconds,
    );
    this.shieldRemaining = Math.max(0, this.shieldRemaining - deltaSeconds);
    this.rewardMessageRemaining = Math.max(
      0,
      this.rewardMessageRemaining - deltaSeconds,
    );
    if (this.rewardMessageRemaining === 0) this.rewardName = undefined;
    updateRewards(
      this.ui,
      this.rewardName,
      this.rapidFireRemaining,
      this.shieldRemaining,
    );
  }

  private updateFlyby(deltaSeconds: number) {
    if (!this.flyby) {
      this.flybyCountdown -= deltaSeconds;
      if (this.flybyCountdown <= 0) this.spawnFlyby();
      return;
    }

    this.flyby.x += this.flyby.direction * this.flyby.speed * deltaSeconds;
    const leftPlayfield =
      this.flyby.direction === 1
        ? this.flyby.x > WIDTH + this.flyby.width
        : this.flyby.x + this.flyby.width < 0;
    if (leftPlayfield) {
      this.flyby = undefined;
      this.flybyCountdown = this.nextFlybyDelay();
    }
  }

  private spawnFlyby() {
    const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const width = 52;
    this.flyby = {
      x: direction === 1 ? -width : WIDTH,
      y: 58,
      width,
      height: 30,
      speed: 105,
      direction,
    };
  }

  private nextFlybyDelay() {
    return 10 + Math.random() * 8;
  }

  private grantReward() {
    let reward = 1;
    if (reward === 0) {
      this.rapidFireRemaining = POWERUP_SECONDS;
      this.rewardName = "RAPID FIRE";
    } else if (reward === 1) {
      this.shieldRemaining = POWERUP_SECONDS;
      this.rewardName = "SHIELD";
    } else {
      this.addScore(500);
      this.rewardName = "BONUS +500";
    }
    this.rewardMessageRemaining = 1.8;
    this.audio.reward();
    updateRewards(
      this.ui,
      this.rewardName,
      this.rapidFireRemaining,
      this.shieldRemaining,
    );
  }

  private addScore(points: number) {
    this.score = Math.min(
      MAX_SCORE,
      Math.max(0, Math.floor(this.score + points)),
    );
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.achievedHighScore = true;
      saveHighScore(this.highScore);
    }
    updateScores(this.ui, this.score, this.highScore);
  }

  private updateBombSpawner(deltaSeconds: number) {
    this.bombCountdown -= deltaSeconds;
    const interval = this.bombInterval();

    while (this.bombCountdown <= 0) {
      this.spawnBomb();
      this.bombCountdown += interval;
    }
  }

  private spawnBomb() {
    const attackers = this.formation.enemies.filter(
      (enemy) => enemy.alive && enemy.attacking,
    );
    const livingEnemies =
      attackers.length > 0
        ? attackers
        : this.formation.enemies.filter(
            (enemy) => enemy.alive && !enemy.attacking,
          );
    if (livingEnemies.length === 0) return;

    const shooter = livingEnemies[this.bombSequence % livingEnemies.length];
    this.bombSequence += 1;
    this.bombs.push(
      dropBomb(
        shooter.x + shooter.width / 2 - 3,
        shooter.y + shooter.height,
        this.player.x + this.player.width / 2,
      ),
    );
    this.audio.bombDrop();
  }

  private updateAttackerSpawner(deltaSeconds: number) {
    this.attackCountdown -= deltaSeconds;
    if (this.attackCountdown > 0) return;

    const eligibleEnemies = this.formation.enemies.filter(
      (enemy) => enemy.alive && !enemy.attacking,
    );
    if (eligibleEnemies.length > 0) {
      const selected =
        eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
      startAttack(selected, attackSpeedForWave(this.wave));
    }
    this.attackCountdown = this.nextAttackDelay();
  }

  private nextAttackDelay() {
    const interval = attackIntervalForWave(this.wave);
    return interval * (0.8 + Math.random() * 0.4);
  }

  private bombInterval() {
    return 1 / bombRateForWave(this.wave);
  }

  private takeDamage() {
    this.lives -= 1;
    this.audio.playerDeath();
    updateLives(this.ui, this.lives);

    if (this.lives === 0) {
      this.endGame(false);
      return;
    }

    this.state = "recovering";
    this.recoveryRemaining = RECOVERY_SECONDS;
    this.invulnerabilityRemaining = INVULNERABILITY_SECONDS;
    this.player = createPlayer(WIDTH, HEIGHT);
    this.projectiles = [];
    this.bombs = [];
    this.pressedKeys.clear();
    showAnnouncement(this.ui, "READY");
  }

  private updateRecovery(deltaSeconds: number) {
    this.recoveryRemaining -= deltaSeconds;
    if (this.recoveryRemaining > 0) return;

    this.state = "playing";
    this.bombCountdown = this.bombInterval();
    this.attackCountdown = this.nextAttackDelay();
    hideAnnouncement(this.ui);
  }

  private beginWaveTransition() {
    this.state = "waveTransition";
    this.transitionRemaining = WAVE_TRANSITION_SECONDS;
    this.projectiles = [];
    this.bombs = [];
    this.effects = [];
    this.pressedKeys.clear();
    showAnnouncement(
      this.ui,
      `WAVE ${this.wave.toString().padStart(2, "0")} CLEAR`,
    );
  }

  private updateWaveTransition(deltaSeconds: number) {
    this.transitionRemaining -= deltaSeconds;
    if (this.transitionRemaining > 0) return;

    this.wave += 1;
    this.formation = createFormation(this.wave);
    this.bombCountdown = this.bombInterval();
    this.attackCountdown = this.nextAttackDelay();
    this.state = "playing";
    updateWave(this.ui, this.wave);
    hideAnnouncement(this.ui);
  }

  private endGame(playDeathSound = true) {
    if (playDeathSound) this.audio.playerDeath();
    this.state = "gameOver";
    this.projectiles = [];
    this.bombs = [];
    this.flyby = undefined;
    this.pressedKeys.clear();
    this.ui.tutorial.hidden = true;
    hideAnnouncement(this.ui);
    updateRewards(this.ui, undefined, 0, 0);
    showGameOver(this.ui, this.score, this.achievedHighScore);
  }

  private render() {
    const context = this.context;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#05070d";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    this.stars.forEach((star) => {
      context.globalAlpha = star.brightness;
      context.fillStyle = "#d9e6ff";
      context.fillRect(star.x, star.y, star.size, star.size);
    });
    context.globalAlpha = 1;

    if (this.state === "start" || !this.sprites) return;

    for (const enemy of this.formation.enemies) {
      if (!enemy.alive) continue;
      context.drawImage(
        this.sprites[enemy.kind],
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height,
      );
    }

    if (this.flyby) {
      context.drawImage(
        this.sprites.flyby,
        this.flyby.x,
        this.flyby.y,
        this.flyby.width,
        this.flyby.height,
      );
    }

    context.fillStyle = "#fff36b";
    this.projectiles.forEach((projectile) => {
      context.fillRect(
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height,
      );
    });

    context.fillStyle = "#ff5cd6";
    this.bombs.forEach((bomb) => {
      context.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
      context.fillRect(bomb.x - 2, bomb.y + 4, bomb.width + 4, 4);
    });

    this.effects.forEach((effect) => {
      context.fillStyle = effect.remaining > 0.07 ? "#ffffff" : "#ff5cd6";
      context.fillRect(effect.x - 14, effect.y - 2, 28, 4);
      context.fillRect(effect.x - 2, effect.y - 14, 4, 28);
      context.fillRect(effect.x - 8, effect.y - 8, 4, 4);
      context.fillRect(effect.x + 4, effect.y + 4, 4, 4);
    });

    this.renderPlayer(context);
  }

  private renderPlayer(context: CanvasRenderingContext2D) {
    if (!this.sprites) return;
    const invulnerable = this.invulnerabilityRemaining > 0;
    const playerVisible =
      !invulnerable || Math.floor(this.invulnerabilityRemaining * 10) % 2 === 0;

    if (this.shieldRemaining > 0) {
      context.save();
      context.globalAlpha = 0.72;
      context.strokeStyle = "#5ce1ff";
      context.lineWidth = 3;
      context.shadowColor = "#5ce1ff";
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        Math.max(this.player.width, this.player.height) / 2 + 10,
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.restore();
    }

    if (invulnerable) {
      context.strokeStyle = "#5ce1ff";
      context.lineWidth = 3;
      context.strokeRect(
        this.player.x - 7,
        this.player.y - 7,
        this.player.width + 14,
        this.player.height + 14,
      );
    }
    if (playerVisible) {
      context.drawImage(
        this.sprites.player,
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height,
      );
    }
  }

  private createStars(): Star[] {
    let seed = 1936;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    return Array.from({ length: 64 }, () => ({
      x: Math.floor(random() * WIDTH),
      y: Math.floor(random() * HEIGHT),
      size: random() > 0.86 ? 2 : 1,
      brightness: 0.25 + random() * 0.45,
    }));
  }
}
