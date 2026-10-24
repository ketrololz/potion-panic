import { Assets, Container, Sprite } from 'pixi.js'
import { CAULDRON_LAYOUT } from './constants/cauldron.constants'

export async function createCauldron(): Promise<Container> {
    const cauldron = new Container()

    const texture = await Assets.load('/assets/cauldron/cauldron.webp')
    const liquidTexture = await Assets.load('/assets/cauldron/liquid-turquoise.webp')

    const body = new Sprite(texture)
    const liquid = new Sprite(liquidTexture)

    body.anchor.set(0.5, 1)

    liquid.label = 'liquid'
    liquid.anchor.set(0.5)

    liquid.width = body.width * CAULDRON_LAYOUT.liquid.widthRatio
    liquid.height = body.height * CAULDRON_LAYOUT.liquid.heightRatio
    liquid.position.set(0, -body.height * CAULDRON_LAYOUT.liquid.centerFromBottomRatio)

    cauldron.addChild(body, liquid)

    return cauldron
}
