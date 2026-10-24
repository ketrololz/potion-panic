import { Assets, Container, Rectangle, Sprite, Text, Texture } from 'pixi.js'
import { COMBO_LAYOUT, COMBO_STYLE } from './constants/layout.constants'

export async function createComboPanel(initialCombo: number, maxCombo: number) {
    if (maxCombo <= 0) {
        throw new Error('Максимальное комбо должно быть больше нуля')
    }

    const view = new Container()

    view.eventMode = 'none'

    const [trackTexture, fillTexture, flameTexture] = await Promise.all([
        Assets.load('/assets/ui/combo/combo-frame.webp'),
        Assets.load('/assets/ui/combo/combo-section.webp'),
        Assets.load('/assets/ui/combo/combo-icon.webp')
    ])

    const track = new Sprite(trackTexture)
    track.anchor.set(0.5)
    track.width = COMBO_LAYOUT.trackWidth
    track.height = COMBO_LAYOUT.trackHeight

    const fillScale = COMBO_LAYOUT.fillWidth / fillTexture.width
    const fillScaleY = fillScale * COMBO_LAYOUT.fillHeightScale
    const cropHeight = Math.min(fillTexture.height, COMBO_LAYOUT.fillHeight / fillScaleY)
    const croppedTexture = new Texture({
        source: fillTexture.source,
        frame: new Rectangle(fillTexture.frame.x, fillTexture.frame.y + (fillTexture.height - cropHeight) / 2, fillTexture.width, cropHeight),
        dynamic: true
    })

    const fill = new Sprite(croppedTexture)
    fill.anchor.set(0, 0.5)
    fill.position.x = -COMBO_LAYOUT.fillWidth / 2
    fill.scale.set(fillScale, fillScaleY)
    fill.on('destroyed', () => croppedTexture.destroy(false))

    const flame = new Sprite(flameTexture)
    flame.anchor.set(0.5)
    flame.scale.set(COMBO_LAYOUT.flameSize / Math.max(flameTexture.width, flameTexture.height))
    flame.position.set(COMBO_LAYOUT.flameX, COMBO_LAYOUT.flameY)

    const title = new Text({
        text: '',
        style: COMBO_STYLE
    })

    title.anchor.set(0.5)
    title.position.set(COMBO_LAYOUT.titleX, COMBO_LAYOUT.titleY)

    view.addChild(track, fill, flame, title)

    let currentCombo: number | undefined

    function setCombo(combo: number) {
        if (currentCombo === combo) return
        currentCombo = combo

        const progress = Math.max(0, Math.min(combo / maxCombo, 1))

        title.text = `КОМБО ×${combo}`
        title.visible = combo > 0
        flame.visible = combo > 0
        fill.visible = progress > 0

        if (progress > 0) {
            croppedTexture.frame.width = fillTexture.width * progress
            croppedTexture.orig.width = croppedTexture.frame.width
            croppedTexture.update()
        }
    }

    setCombo(initialCombo)

    return {
        view,
        setCombo
    }
}
