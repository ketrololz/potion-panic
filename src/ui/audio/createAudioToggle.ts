import { AUDIO_BUTTON_LABEL } from '../../audio/constants/audio.constants'
import { Assets, Circle, Container, Sprite } from 'pixi.js'
import type { GameAudio } from '../../audio/createAudio'
import { createButtonEffects } from '../button/createButtonEffects'
import { AUDIO_TOGGLE_LAYOUT as LAYOUT } from './constants/layout.constants'

export async function createAudioToggle(audio: GameAudio, kind: 'music' | 'effects') {
    const view = new Container()
    view.label = AUDIO_BUTTON_LABEL
    const iconName = kind === 'music' ? 'music' : 'sound'
    const [backgroundTexture, enabledTexture, disabledTexture] = await Promise.all([
        Assets.load('/assets/ui/buttons/button-round.webp'),
        Assets.load(`/assets/ui/icons/${iconName}.webp`),
        Assets.load(`/assets/ui/icons/${iconName}_off.webp`)
    ])
    const background = new Sprite(backgroundTexture)
    background.anchor.set(0.5)
    background.scale.set(LAYOUT.size / background.texture.width)
    const icon = new Sprite(enabledTexture)
    icon.anchor.set(0.5)
    const content = new Container()
    content.eventMode = 'none'
    content.addChild(background, icon)
    view.addChild(content)
    createButtonEffects({ view, content, background, sheenEnabled: false })
    view.hitArea = new Circle(0, 0, LAYOUT.size / 2)
    view.eventMode = 'static'
    view.cursor = 'pointer'
    function refresh() {
        const muted = kind === 'music' ? audio.isMusicMuted() : audio.isEffectsMuted()
        icon.texture = muted ? disabledTexture : enabledTexture
        icon.scale.set(LAYOUT.iconSize / Math.max(icon.texture.width, icon.texture.height))
    }
    view.on('pointertap', () => {
        if (kind === 'music') audio.toggleMusic()
        else audio.toggleEffects()
        refresh()
    })
    refresh()
    return view
}
