import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js'
import { LOGO_FX as FX } from './constants/logoEffects.constants'

export function createLogoEffects(logo: Sprite) {
    const parent = logo.parent
    if (!parent) throw new Error('Логотип должен быть добавлен в сцену перед созданием эффектов')
    const reducedMotion = prefersReducedMotion()
    const basePosition = logo.position.clone()
    const baseScale = logo.scale.clone()
    const width = logo.width
    const height = logo.height
    let elapsed = 0

    const glow = new Sprite(logo.texture)
    glow.anchor.copyFrom(logo.anchor)
    glow.tint = FX.glowColor
    glow.blendMode = 'add'
    glow.eventMode = 'none'
    const blur = new BlurFilter({ strength: FX.glowBlur, quality: 3 })
    glow.filters = [blur]
    parent.addChildAt(glow, parent.getChildIndex(logo))

    const sparkLayer = new Container()
    sparkLayer.eventMode = 'none'
    parent.addChildAt(sparkLayer, parent.getChildIndex(logo) + 1)
    const sparks = Array.from({ length: FX.sparkCount }, (_, index) => {
        const size = FX.sparkSize * (0.6 + (index % 3) * 0.25)
        const star = new Graphics()
            .circle(0, 0, size * 1.6)
            .fill({ color: FX.glowColor, alpha: 0.08 })
            .poly([0, -size, size * 0.2, -size * 0.2, size, 0, size * 0.2, size * 0.2, 0, size, -size * 0.2, size * 0.2, -size, 0, -size * 0.2, -size * 0.2])
            .fill(FX.sparkColor)
        star.blendMode = 'add'
        sparkLayer.addChild(star)
        const angle = index * 2.399963
        return { star, x: Math.cos(angle) * width * (0.3 + (index % 3) * 0.045), y: Math.sin(angle) * height * 0.37 }
    })

    function render() {
        const phase = (elapsed * Math.PI * 2) / FX.floatDuration
        const breathe = reducedMotion ? 1 : 1 + Math.sin(phase) * FX.breatheAmount
        logo.y = basePosition.y + (reducedMotion ? 0 : Math.sin(phase) * FX.floatDistance)
        logo.scale.set(baseScale.x * breathe, baseScale.y * breathe)
        glow.position.copyFrom(logo.position)
        glow.scale.set(logo.scale.x * FX.glowScale, logo.scale.y * FX.glowScale)
        glow.alpha = FX.glowAlpha + (reducedMotion ? 0 : Math.sin(phase + 0.8) * FX.glowPulse)
        sparkLayer.position.copyFrom(logo.position)
        sparks.forEach(({ star, x, y }, index) => {
            const progress = (elapsed / (FX.sparkDuration + (index % 3) * 0.4) + index / sparks.length) % 1
            star.position.set(x + Math.sin(progress * Math.PI) * 8, y - progress * FX.sparkRise)
            star.alpha = reducedMotion ? 0 : Math.sin(progress * Math.PI) ** 6 * 0.85
            star.scale.set(0.5 + Math.sin(progress * Math.PI) * 0.5)
            star.rotation = progress * 0.4
        })
    }
    function update(deltaMs: number) {
        if (reducedMotion) return
        elapsed += Math.max(0, Math.min(deltaMs, FX.maxDeltaMs)) / 1000
        render()
    }
    glow.once('destroyed', () => blur.destroy())
    render()
    return { update }
}
