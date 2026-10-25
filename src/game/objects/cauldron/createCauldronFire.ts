import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import { Container, Sprite } from 'pixi.js'
import { FIRE_FX as FX } from './constants/fire.constants'
import { createFireTexture } from './createFireTexture'

export function createCauldronFire(cauldron: Container) {
    const body = cauldron.getChildAt(0)
    const width = body.width
    const height = body.height
    const reducedMotion = prefersReducedMotion()
    let elapsed = 0
    const flameTexture = createFireTexture(true)
    const glowTexture = createFireTexture(false)

    const view = new Container()
    view.eventMode = 'none'
    view.alpha = FX.opacity
    view.position.y = -height * FX.baseFromBottomRatio
    cauldron.addChildAt(view, 1)

    function particle(texture = flameTexture) {
        const sprite = new Sprite(texture)
        sprite.anchor.set(0.5)
        sprite.blendMode = 'add'
        view.addChild(sprite)
        return sprite
    }

    const glow = particle(glowTexture)
    glow.tint = FX.outerColor
    glow.width = width * 0.72
    glow.height = height * 0.16
    const bed = particle(glowTexture)
    bed.tint = FX.middleColor
    bed.width = width * 0.48
    bed.height = height * 0.045

    // Stable seeds avoid synchronized columns and random jumps on each frame.
    const seed = (index: number) => {
        const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
        return value - Math.floor(value)
    }
    const flames = Array.from({ length: FX.flameCount }, (_, index) => ({
        sprite: particle(),
        spread: seed(index) * 2 - 1,
        offset: seed(index + 100),
        duration: FX.flameDuration * (0.75 + seed(index + 200) * 0.65),
        size: 0.7 + seed(index + 300) * 0.7
    }))
    const embers = Array.from({ length: FX.emberCount }, () => particle(glowTexture))

    function render() {
        const flicker = Math.sin(elapsed * FX.flickerSpeed) * 0.07 + Math.sin(elapsed * 13.7) * 0.03
        glow.alpha = 0.55 + flicker
        bed.alpha = 0.65 + flicker
        flames.forEach(({ sprite, spread, offset, duration, size }) => {
            const phase = (elapsed / duration + offset) % 1
            const lift = phase * height * FX.heightRatio * (1 - Math.abs(spread) * 0.25)
            const turbulence = Math.sin(phase * 8 + offset * 12) * phase
            sprite.position.set(((spread * width * FX.widthRatio) / 2) * (1 - phase * 0.15) + turbulence * width * 0.035, -lift)
            sprite.width = width * FX.flameWidthRatio * size * (1 - phase * 0.65)
            sprite.height = height * FX.heightRatio * size * (0.45 + Math.sin(phase * Math.PI) * 0.35)
            sprite.rotation = turbulence * 0.22
            sprite.alpha = Math.sin(phase * Math.PI) ** 0.7 * FX.flameAlpha
            // Hot gold near the source, cooling to orange/red as each wisp rises.
            const heat = Math.min(1, phase * 1.5)
            const red = 255
            const green = Math.round(210 - heat * 150)
            const blue = Math.round(95 - heat * 85)
            sprite.tint = (red << 16) | (green << 8) | blue
        })
        embers.forEach((ember, index) => {
            const phase = (elapsed / FX.emberDuration + index / embers.length) % 1
            const spread = seed(index + 400) * 2 - 1
            ember.position.set((spread * width * FX.widthRatio) / 2 + Math.sin(phase * 5 + index) * width * 0.035, -phase * height * FX.emberRiseRatio)
            ember.tint = FX.coreColor
            ember.width = width * 0.006 * (1 - phase * 0.5)
            ember.height = ember.width * (1.5 + phase)
            ember.alpha = reducedMotion ? 0 : Math.sin(phase * Math.PI) * 0.9
        })
    }

    function reset() {
        elapsed = 0
        render()
    }
    function update(deltaMs: number) {
        if (reducedMotion) return
        elapsed += (Math.max(0, Math.min(deltaMs, FX.maxDeltaMs)) / 1000) * FX.animationSpeed
        render()
    }
    view.once('destroyed', () => {
        flameTexture.destroy(true)
        glowTexture.destroy(true)
    })
    reset()
    return { update, reset }
}
