import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { ResultPanelOptions } from './types/result.types'
import { RESULT_LAYOUT as LAYOUT } from './constants/layout.constants'
import { createImageButton } from '../button/createImageButton'

export async function createResultPanel({ screenWidth, screenHeight, onRestart, onExit }: ResultPanelOptions) {
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

    function createLabel(text: string, y: number, fontSize: number) {
        const label = new Text({
            text,
            style: {
                fontFamily: LAYOUT.fontFamily,
                fontSize,
                fill: LAYOUT.textColor
            }
        })

        label.anchor.set(0.5)
        label.position.set(0, y)

        return label
    }

    const title = createLabel('ВРЕМЯ ВЫШЛО', LAYOUT.titleY, LAYOUT.titleFontSize)

    const scoreLabel = createLabel('', LAYOUT.scoreY, LAYOUT.scoreFontSize)

    const restartButton = await createImageButton({
        text: 'ЗАНОВО',
        textureUrl: '/assets/menu/button-action.webp',
        width: LAYOUT.buttonWidth,
        fontSize: LAYOUT.buttonFontSize,
        onPress: onRestart,
        stopPropagation: true
    })

    restartButton.position.set(0, LAYOUT.restartButtonY)

    const menuButton = await createImageButton({
        text: 'В МЕНЮ',
        textureUrl: '/assets/menu/button-cancel.webp',
        width: LAYOUT.buttonWidth,
        fontSize: LAYOUT.buttonFontSize,
        onPress: onExit,
        stopPropagation: true
    })

    menuButton.position.set(0, LAYOUT.menuButtonY)

    view.addChild(backdrop, panel, title, scoreLabel, restartButton, menuButton)

    function show(score: number) {
        if (view.visible) return

        scoreLabel.text = `Очки: ${score}`
        view.visible = true
    }

    function hide() {
        view.visible = false
    }

    return { view, show, hide }
}
