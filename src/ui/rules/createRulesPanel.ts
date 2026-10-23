import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { createImageButton } from '../button/createImageButton'
import { RULES_LAYOUT as LAYOUT, RULES_TEXT } from './constants/layout.constants'

interface RulesPanelOptions {
    screenWidth: number
    screenHeight: number
    buttonTextureUrl: string
}

export async function createRulesPanel({ screenWidth, screenHeight, buttonTextureUrl }: RulesPanelOptions) {
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
        text: 'КАК ИГРАТЬ',
        style: {
            fontFamily: LAYOUT.fontFamily,
            fontSize: LAYOUT.titleFontSize,
            fill: LAYOUT.textColor
        }
    })

    title.anchor.set(0.5)
    title.position.set(0, LAYOUT.titleY)

    const body = new Text({
        text: RULES_TEXT,
        style: {
            fontFamily: LAYOUT.fontFamily,
            fontSize: LAYOUT.bodyFontSize,
            fill: LAYOUT.textColor,
            wordWrap: true,
            wordWrapWidth: LAYOUT.bodyWidth,
            lineHeight: LAYOUT.bodyLineHeight,
            align: 'center'
        }
    })

    body.anchor.set(0.5)
    body.position.set(0, LAYOUT.bodyY)

    const closeButton = await createImageButton({
        text: 'ПОНЯТНО',
        textureUrl: buttonTextureUrl,
        width: LAYOUT.closeButtonWidth,
        fontSize: LAYOUT.closeButtonFontSize,
        onPress: hide
    })

    closeButton.position.set(0, LAYOUT.closeButtonY)

    view.addChild(backdrop, panel, title, body, closeButton)

    function show() {
        view.visible = true
    }

    function hide() {
        view.visible = false
    }

    return { view, show, hide }
}
