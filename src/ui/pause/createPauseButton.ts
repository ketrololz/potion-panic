import { Assets, Circle, Container, Sprite } from 'pixi.js'
import { PAUSE_BUTTON_STYLE as STYLE } from './constants/layout.constants'

export async function createPauseButton(onPress: () => void) {
    const view = new Container()

    const [backgroundTexture, iconTexture] = await Promise.all([
        Assets.load('/assets/ui/buttons/button-round.webp'),
        Assets.load('/assets/ui/icons/pause.webp')
    ])

    const background = new Sprite(backgroundTexture)
    background.anchor.set(0.5)
    background.scale.set(STYLE.width / backgroundTexture.width)

    const icon = new Sprite(iconTexture)
    icon.anchor.set(0.5)
    icon.scale.set(STYLE.iconSize / Math.max(iconTexture.width, iconTexture.height))

    view.addChild(background, icon)

    view.hitArea = new Circle(0, 0, STYLE.width / 2)
    view.eventMode = 'static'
    view.cursor = 'pointer'

    view.on('pointertap', onPress)

    function setEnabled(enabled: boolean) {
        view.eventMode = enabled ? 'static' : 'none'
        view.cursor = enabled ? 'pointer' : 'default'
        view.alpha = enabled ? 1 : STYLE.disabledAlpha
    }

    return { view, setEnabled }
}
