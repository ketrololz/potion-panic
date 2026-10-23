import type { Container } from 'pixi.js'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/config/config.constants'

export function fitScene(scene: Container, width: number, height: number) {
    const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT)

    scene.scale.set(scale)

    scene.position.set((width - GAME_WIDTH * scale) / 2, (height - GAME_HEIGHT * scale) / 2)
}
