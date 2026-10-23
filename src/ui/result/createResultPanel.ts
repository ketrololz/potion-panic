import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { ResultPanelOptions } from './types/result.types'
import { RESULT_LAYOUT as LAYOUT } from './constants/layout.constants'

export function createResultPanel({ screenWidth, screenHeight, onRestart, onExit }: ResultPanelOptions) {
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

    function createActionButton(text: string, y: number, onPress: () => void) {
        const button = new Container()

        const background = new Graphics()
            .roundRect(-LAYOUT.buttonWidth / 2, -LAYOUT.buttonHeight / 2, LAYOUT.buttonWidth, LAYOUT.buttonHeight, LAYOUT.buttonRadius)
            .fill(LAYOUT.buttonColor)

        const label = createLabel(text, 0, LAYOUT.buttonFontSize)

        button.addChild(background, label)
        button.position.set(0, y)
        button.eventMode = 'static'
        button.cursor = 'pointer'

        button.on('pointertap', (event) => {
            event.stopPropagation()
            onPress()
        })

        return button
    }

    const restartButton = createActionButton('ЗАНОВО', LAYOUT.restartButtonY, onRestart)

    const menuButton = createActionButton('В МЕНЮ', LAYOUT.menuButtonY, onExit)

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
