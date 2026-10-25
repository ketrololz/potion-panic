import { Assets, Container, Sprite, Text } from 'pixi.js'
import { createComboBarEffects } from './createComboBarEffects'
import { createComboEffects } from './createComboEffects'
import { COMBO_LAYOUT, COMBO_STYLE } from './constants/layout.constants'

export async function createComboPanel(initialCombo: number, maxCombo: number) {
    if (maxCombo <= 0) {
        throw new Error('Максимальное комбо должно быть больше нуля')
    }

    const view = new Container()

    view.eventMode = 'none'

    const [trackTexture, flameTexture] = await Promise.all([Assets.load('/assets/ui/combo/combo-frame.webp'), Assets.load('/assets/ui/combo/combo-icon.webp')])

    const track = new Sprite(trackTexture)
    track.anchor.set(0.5)
    track.width = COMBO_LAYOUT.trackWidth
    track.height = COMBO_LAYOUT.trackHeight

    const fill = new Container()
    fill.position.x = -COMBO_LAYOUT.fillWidth / 2

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

    const effects = createComboEffects(view, title, flame)

    const barEffects = createComboBarEffects(view, fill, title, flame)
    let currentCombo: number | undefined

    function setCombo(combo: number) {
        if (currentCombo === combo) return
        const increased = currentCombo !== undefined && combo > currentCombo
        const lost = currentCombo !== undefined && currentCombo > 0 && combo === 0
        effects.clear()
        currentCombo = combo
        if (lost) {
            barEffects.burn()
            return
        }
        title.text = `КОМБО ×${combo}`
        title.visible = combo > 0
        flame.visible = combo > 0
        barEffects.setProgress(Math.max(0, Math.min(combo / maxCombo, 1)), increased)
        if (increased) effects.play(combo >= maxCombo)
    }

    setCombo(initialCombo)

    return {
        view,
        setCombo,
        setPaused(value: boolean) {
            effects.setPaused(value)
            barEffects.setPaused(value)
        },
        clearEffects() {
            effects.clear()
            barEffects.setProgress(0)
            currentCombo = undefined
        }
    }
}
