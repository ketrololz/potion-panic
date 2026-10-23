import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import type { Scene } from './types/gameScene.types'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config/config.constants'
import { MENU_LAYOUT } from './menu/constants/layout.constants'
import { applyMenuLayout } from '../layout/applyMenuLayout'
import { createImageButton } from '../../ui/button/createImageButton'

export async function createMenuScene(onStart: () => void): Promise<Scene> {
    const view = new Container()

    const [backgroundTexture, logoTexture] = await Promise.all([Assets.load('/assets/backgrounds/lab.webp'), Assets.load('/assets/menu/logo.webp')])

    const background = new Sprite(backgroundTexture)
    background.label = 'debug_hide'
    background.eventMode = 'none'

    const logo = new Sprite(logoTexture)
    logo.eventMode = 'none'

    const startButton = await createImageButton({
        text: 'СТАРТ',
        textureUrl: '/assets/menu/button-action.webp',
        width: MENU_LAYOUT.startButton.width,
        fontSize: MENU_LAYOUT.startButton.fontSize,
        onPress: onStart
    })

    const bounds = new Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0xffffff)

    bounds.label = 'debug_hide'

    view.addChild(background, logo, startButton, bounds)
    view.mask = bounds

    applyMenuLayout({
        background,
        logo,
        startButton
    })

    return {
        view,
        destroy() {
            view.destroy({ children: true })
        }
    }
}
