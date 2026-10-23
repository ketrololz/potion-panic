import type { Container, Sprite } from 'pixi.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config/config.constants'
import { MENU_LAYOUT } from '../scenes/menu/constants/layout.constants'

interface MenuLayoutTargets {
    background: Sprite
    logo: Sprite
    startButton: Container
}

export function applyMenuLayout({ background, logo, startButton }: MenuLayoutTargets) {
    const centerX = GAME_WIDTH / 2

    background.anchor.set(0.5)
    background.scale.set(Math.max(GAME_WIDTH / background.texture.width, GAME_HEIGHT / background.texture.height))
    background.position.set(centerX, GAME_HEIGHT / 2)

    logo.anchor.set(0.5)
    logo.scale.set(MENU_LAYOUT.logo.width / logo.texture.width)
    logo.position.set(centerX, MENU_LAYOUT.logo.centerY)

    startButton.position.set(centerX, MENU_LAYOUT.startButton.centerY)
}
