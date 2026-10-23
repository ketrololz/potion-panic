import { Container, Graphics, Text } from 'pixi.js'
import { PAUSE_BUTTON_STYLE } from './constants/layout.constants'

export function createPauseButton(onPress: () => void) {
    const view = new Container()

    const background = new Graphics().circle(0, 0, PAUSE_BUTTON_STYLE.radius).fill(PAUSE_BUTTON_STYLE.backgroundColor).stroke({
        color: PAUSE_BUTTON_STYLE.borderColor,
        width: PAUSE_BUTTON_STYLE.borderWidth
    })

    const label = new Text({
        text: 'II',
        style: {
            fontFamily: PAUSE_BUTTON_STYLE.fontFamily,
            fontSize: PAUSE_BUTTON_STYLE.fontSize,
            fill: PAUSE_BUTTON_STYLE.textColor
        }
    })

    label.anchor.set(0.5)

    view.addChild(background, label)

    view.eventMode = 'static'
    view.cursor = 'pointer'

    view.on('pointertap', onPress)

    function setPaused(paused: boolean) {
        label.text = paused ? '▶' : 'II'
    }

    function setEnabled(enabled: boolean) {
        view.eventMode = enabled ? 'static' : 'none'
        view.cursor = enabled ? 'pointer' : 'default'
        view.alpha = enabled ? 1 : PAUSE_BUTTON_STYLE.disabledAlpha
    }

    return {
        view,
        setPaused,
        setEnabled
    }
}
