import { AUDIO_BUTTON_LABEL } from '../../audio/constants/audio.constants'
import { Assets, Container, Rectangle, Sprite, Text } from 'pixi.js'
import { createButtonEffects } from './createButtonEffects'

interface ImageButtonOptions {
    text: string
    textureUrl: string
    width: number
    fontSize: number
    onPress: () => void
    stopPropagation?: boolean
}

export async function createImageButton({ text, textureUrl, width, fontSize, onPress, stopPropagation = false }: ImageButtonOptions) {
    const view = new Container()
    view.label = AUDIO_BUTTON_LABEL

    const texture = await Assets.load(textureUrl)
    const background = new Sprite(texture)

    background.anchor.set(0.5)
    background.scale.set(width / texture.width)

    const label = new Text({
        text,
        style: {
            fontFamily: 'Georgia',
            fontSize,
            fill: 0xfff3dc
        }
    })

    label.anchor.set(0.5)

    const content = new Container()
    content.eventMode = 'none'
    content.addChild(background, label)
    view.addChild(content)

    createButtonEffects({ view, content, background })

    view.hitArea = new Rectangle(-background.width / 2, -background.height / 2, background.width, background.height)

    view.eventMode = 'static'
    view.cursor = 'pointer'

    view.on('pointertap', (event) => {
        if (stopPropagation) {
            event.stopPropagation()
        }

        onPress()
    })

    return view
}
