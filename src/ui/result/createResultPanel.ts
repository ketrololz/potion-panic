import { createResultAnimation } from './createResultAnimation'
import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { ResultData, ResultPanelOptions } from './types/result.types'
import { RESULT_LAYOUT as LAYOUT } from './constants/layout.constants'
import { createImageButton } from '../button/createImageButton'

export async function createResultPanel({ screenWidth, screenHeight, onRestart, onExit, onCountingChange, onNewRecord }: ResultPanelOptions) {
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

    const title = createLabel('ИТОГИ РАУНДА', LAYOUT.titleY, LAYOUT.titleFontSize)

    const scoreLabel = createLabel('', LAYOUT.scoreY, LAYOUT.scoreFontSize)
    const bestScoreLabel = createLabel('', LAYOUT.bestScoreY, LAYOUT.bestScoreFontSize)

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

    const content = new Container()
    content.addChild(panel, title, scoreLabel, bestScoreLabel, restartButton, menuButton)
    view.addChild(backdrop, content)
    const animation = createResultAnimation({
        screenWidth,
        screenHeight,
        view,
        backdrop,
        content,
        scoreLabel,
        resultTitle: title,
        bestScoreLabel,
        onCountingChange,
        onNewRecord,
        buttons: [restartButton, menuButton]
    })

    function show(result: ResultData) {
        if (view.visible) return

        view.visible = true
        animation.play(result)
    }

    function hide() {
        if (!view.visible) return
        animation.clear()
        view.visible = false
    }

    return { view, show, hide }
}
