import { Assets, Container, Rectangle, Sprite, Text } from 'pixi.js'

interface ImageButtonOptions {
    text: string
    textureUrl: string
    width: number
    fontSize: number
    onPress: () => void
}

export async function createImageButton({ text, textureUrl, width, fontSize, onPress }: ImageButtonOptions) {
    const view = new Container()

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

    view.addChild(background, label)

    view.hitArea = new Rectangle(-background.width / 2, -background.height / 2, background.width, background.height)

    view.eventMode = 'static'
    view.cursor = 'pointer'

    view.on('pointertap', onPress)

    return view
}
