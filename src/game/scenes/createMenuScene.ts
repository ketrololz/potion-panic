import type { GameAudio } from '../../audio/createAudio'
import { createAudioToggle } from '../../ui/audio/createAudioToggle'
import { createLogoEffects } from './menu/createLogoEffects'
import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import type { Scene } from './types/gameScene.types'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config/config.constants'
import { MENU_LAYOUT } from './menu/constants/layout.constants'
import { applyMenuLayout } from '../layout/applyMenuLayout'
import { createImageButton } from '../../ui/button/createImageButton'
import { createRulesPanel } from '../../ui/rules/createRulesPanel'

export async function createMenuScene(onStart: () => void, audio: GameAudio): Promise<Scene> {
    audio.setMusic('menu')
    const view = new Container()

    const [backgroundTexture, logoTexture] = await Promise.all([Assets.load('/assets/backgrounds/lab.webp'), Assets.load('/assets/menu/logo.webp')])

    const background = new Sprite(backgroundTexture)
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

    view.addChild(background, logo, startButton, bounds, rulesButton, rulesPanel.view)
    view.mask = bounds

    applyMenuLayout({
        background,
        logo,
        startButton,
        rulesButton,
        rulesPanel: rulesPanel.view
    })

    const [musicToggle, effectsToggle] = await Promise.all([createAudioToggle(audio, 'music'), createAudioToggle(audio, 'effects')])
    musicToggle.position.set(MENU_LAYOUT.audio.musicX, MENU_LAYOUT.audio.centerY)
    effectsToggle.position.set(MENU_LAYOUT.audio.effectsX, MENU_LAYOUT.audio.centerY)
    view.addChild(musicToggle, effectsToggle)
    // Modals must remain above the sound control.
    view.setChildIndex(rulesPanel.view, view.children.length - 1)
    const logoEffects = createLogoEffects(logo)

    return {
        view,
        update: logoEffects.update,
        destroy() {
            view.destroy({ children: true })
        }
    }
}
