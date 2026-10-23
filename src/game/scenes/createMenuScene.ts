import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import type { Scene } from './types/gameScene.types'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config/config.constants'
import { MENU_LAYOUT } from './menu/constants/layout.constants'
import { applyMenuLayout } from '../layout/applyMenuLayout'
import { createImageButton } from '../../ui/button/createImageButton'
import { createRulesPanel } from '../../ui/rules/createRulesPanel'

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

    const rulesPanel = await createRulesPanel({
        screenWidth: GAME_WIDTH,
        screenHeight: GAME_HEIGHT,
        buttonTextureUrl: '/assets/menu/button-cancel.webp'
    })

    const rulesButton = await createImageButton({
        text: 'КАК ИГРАТЬ',
        textureUrl: '/assets/menu/button-base.webp',
        width: MENU_LAYOUT.rulesButton.width,
        fontSize: MENU_LAYOUT.rulesButton.fontSize,
        onPress: rulesPanel.show
    })

    const bounds = new Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0xffffff)

    bounds.label = 'debug_hide'

    view.addChild(background, logo, startButton, bounds, rulesButton, rulesPanel.view)
    view.mask = bounds

    applyMenuLayout({
        background,
        logo,
        startButton,
        rulesButton,
        rulesPanel: rulesPanel.view
    })

    return {
        view,
        destroy() {
            view.destroy({ children: true })
        }
    }
}
