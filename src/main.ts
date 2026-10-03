import './style.css'
import { SpaceAttackGame } from './game'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Missing #app root element')
}

new SpaceAttackGame(root)
