import { AUDIO_BUTTON_LABEL } from '../../audio/constants/audio.constants'
import { Assets, Circle, Container, Sprite } from 'pixi.js'
import { PAUSE_BUTTON_STYLE as STYLE } from './constants/layout.constants'
import { createButtonEffects } from '../button/createButtonEffects'

export async function createPauseButton(onPress: () => void) {
    const view = new Container()
    view.label = AUDIO_BUTTON_LABEL

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

    const content = new Container()
    content.eventMode = 'none'
    content.addChild(background, icon)
    view.addChild(content)

    const effects = createButtonEffects({ view, content, background, sheenEnabled: false })

    view.hitArea = new Circle(0, 0, STYLE.width / 2)
    view.eventMode = 'static'
    view.cursor = 'pointer'

    view.on('pointertap', onPress)

    function setEnabled(enabled: boolean) {
        effects.setEnabled(enabled)
        view.eventMode = enabled ? 'static' : 'none'
        view.cursor = enabled ? 'pointer' : 'default'
        view.alpha = enabled ? 1 : STYLE.disabledAlpha
    }

    return { view, setEnabled }
}
