import type { GameAudio } from '../../../audio/createAudio'
import type { Container } from 'pixi.js'

export interface Scene {
    view: Container
    update?: (deltaMs: number) => void
    destroy: () => void
}

export interface GameSceneOptions {
    audio: GameAudio
    onExit: () => void
    recordScore: (score: number) => number
}
