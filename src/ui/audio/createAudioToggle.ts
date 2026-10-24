import { AUDIO_BUTTON_LABEL } from '../../audio/constants/audio.constants'
import { Assets, Circle, Container, Graphics, Sprite, Text } from 'pixi.js'
import type { GameAudio } from '../../audio/createAudio'
import { createButtonEffects } from '../button/createButtonEffects'
import { AUDIO_TOGGLE_LAYOUT as LAYOUT } from './constants/layout.constants'

export async function createAudioToggle(audio: GameAudio, kind: 'music' | 'effects') {
    const view = new Container()
    view.label = AUDIO_BUTTON_LABEL
    const background = new Sprite(await Assets.load('/assets/ui/buttons/button-round.webp'))
    background.anchor.set(0.5)
    background.scale.set(LAYOUT.size / background.texture.width)
    // Temporary labels until the separate music/sound icons are supplied.
    const label = new Text({ text: kind === 'music' ? 'М' : 'З', style: { fontFamily: 'Georgia', fontSize: LAYOUT.fontSize, fill: 0xfff3dc } })
    label.anchor.set(0.5)
    const slash = new Graphics()
        .moveTo(-LAYOUT.slashSize, LAYOUT.slashSize)
        .lineTo(LAYOUT.slashSize, -LAYOUT.slashSize)
        .stroke({ color: 0xff657b, width: LAYOUT.slashWidth, cap: 'round' })
    const content = new Container()
    content.eventMode = 'none'
    content.addChild(background, label, slash)
    view.addChild(content)
    createButtonEffects({ view, content, background, sheenEnabled: false })
    view.hitArea = new Circle(0, 0, LAYOUT.size / 2)
    view.eventMode = 'static'
    view.cursor = 'pointer'
    function refresh() {
        const muted = kind === 'music' ? audio.isMusicMuted() : audio.isEffectsMuted()
        slash.visible = muted
        label.alpha = muted ? LAYOUT.disabledAlpha : LAYOUT.enabledAlpha
    }
    view.on('pointertap', () => {
        if (kind === 'music') audio.toggleMusic()
        else audio.toggleEffects()
        refresh()
    })
    refresh()
    return view
}
