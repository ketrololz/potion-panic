import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { createImageButton } from '../button/createImageButton'
import { PAUSE_PANEL_LAYOUT as LAYOUT } from './constants/layout.constants'
import type { PausePanelOptions } from './types/pausePanel.types'

export async function createPausePanel({ screenWidth, screenHeight, onResume, onRestart, onExit }: PausePanelOptions) {
    const view = new Container()

    view.visible = false
    view.eventMode = 'static'

    view.hitArea = new Rectangle(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight)

    const backdrop = new Graphics().rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight).fill({ color: 0x000000, alpha: LAYOUT.backdropAlpha })

    const panel = new Graphics()
        .roundRect(-LAYOUT.width / 2, -LAYOUT.height / 2, LAYOUT.width, LAYOUT.height, LAYOUT.radius)
        .fill(LAYOUT.backgroundColor)
        .stroke({
            color: LAYOUT.borderColor,
            width: LAYOUT.borderWidth
        })

    const title = new Text({
        text: 'ПАУЗА',
        style: {
            fontFamily: LAYOUT.fontFamily,
            fontSize: LAYOUT.titleFontSize,
            fill: LAYOUT.textColor
        }
    })

    title.anchor.set(0.5)
    title.position.set(0, LAYOUT.titleY)

    const actions = [
        {
            text: 'ПРОДОЛЖИТЬ',
            textureUrl: '/assets/menu/button-action.webp',
            y: LAYOUT.resumeY,
            onPress: onResume
        },
        {
            text: 'ЗАНОВО',
            textureUrl: '/assets/menu/button-base.webp',
            y: LAYOUT.restartY,
            onPress: onRestart
        },
        {
            text: 'В МЕНЮ',
            textureUrl: '/assets/menu/button-cancel.webp',
            y: LAYOUT.exitY,
            onPress: onExit
        }
    ]

    const buttons = await Promise.all(
        actions.map(async ({ y, ...action }) => {
            const button = await createImageButton({
                ...action,
                width: LAYOUT.buttonWidth,
                fontSize: LAYOUT.buttonFontSize,
                stopPropagation: true
            })

            button.position.set(0, y)

            return button
        })
    )

    view.addChild(backdrop, panel, title, ...buttons)

    function setVisible(visible: boolean) {
        view.visible = visible
    }

    return { view, setVisible }
}
