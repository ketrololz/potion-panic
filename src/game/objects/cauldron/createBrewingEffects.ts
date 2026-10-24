import { Container, Graphics } from 'pixi.js'
import { BREWING_FX as FX } from './constants/brewing.constants'

export function createBrewingEffects(cauldron: Container, liquid: Container) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const width = liquid.width
    const height = liquid.height
    const view = new Container()
    view.eventMode = 'none'
    view.position.copyFrom(liquid.position)
    cauldron.addChild(view)
    let elapsed = 0

    function softEllipse(radiusX: number, radiusY: number, color: number) {
        const shape = new Graphics()
        for (let index = FX.softLayers; index > 0; index--) {
            const ratio = index / FX.softLayers
            shape.ellipse(0, 0, radiusX * ratio, radiusY * ratio).fill({
                color,
                alpha: (1 - ratio) / FX.softLayers
            })
        }
        shape.blendMode = 'add'
        return shape
    }

    const glow = softEllipse(width * 0.48, height * 0.48, FX.magicColor)
    view.addChild(glow)

    const ripples = Array.from({ length: FX.rippleCount }, () => {
        const ripple = new Graphics().ellipse(0, 0, width * 0.4, height * 0.34).stroke({ color: FX.magicColor, width: width * FX.rippleWidthRatio, alpha: 0.7 })
        ripple.blendMode = 'add'
        view.addChild(ripple)
        return ripple
    })

    const bubbles = Array.from({ length: FX.bubbleCount }, (_, index) => {
        const radius = width * FX.bubbleRadiusRatio * (0.7 + (index % 3) * 0.25)
        const bubble = new Graphics()
            .circle(0, 0, radius)
            .fill({ color: FX.magicColor, alpha: 0.22 })
            .circle(0, 0, radius)
            .stroke({ color: FX.magicColor, width: radius * 0.18, alpha: 0.9 })
            .circle(-radius * 0.3, -radius * 0.35, radius * 0.22)
            .fill({ color: FX.highlightColor, alpha: 0.8 })
        const pop = new Graphics().ellipse(0, 0, radius * 2, radius * 0.65).stroke({ color: FX.highlightColor, width: radius * 0.12, alpha: 0.6 })
        bubble.blendMode = pop.blendMode = 'add'
        view.addChild(bubble, pop)
        const angle = index * 2.399963
        const distance = Math.sqrt((index + 0.5) / FX.bubbleCount)
        return {
            bubble,
            pop,
            x: Math.cos(angle) * width * 0.33 * distance,
            y: Math.sin(angle) * height * 0.25 * distance
        }
    })

    const steam = Array.from({ length: FX.steamCount }, () => {
        const puff = softEllipse(width * FX.steamRadiusRatio, width * FX.steamRadiusRatio * 1.6, FX.steamColor)
        view.addChild(puff)
        return puff
    })

    function render() {
        glow.alpha = FX.glowAlpha + Math.sin((elapsed * Math.PI * 2) / FX.glowDuration) * FX.glowPulse
        ripples.forEach((ripple, index) => {
            const phase = (elapsed / FX.rippleDuration + index / ripples.length) % 1
            ripple.scale.set(0.35 + phase * 0.65)
            ripple.alpha = Math.sin(phase * Math.PI) * FX.rippleAlpha
        })
        bubbles.forEach(({ bubble, pop, x, y }, index) => {
            const phase = (elapsed / (FX.bubbleDuration + (index % 3) * 0.3) + index / bubbles.length) % 1
            const rise = Math.min(phase / 0.8, 1)
            bubble.position.set(x + Math.sin(phase * Math.PI) * width * 0.006, y - rise * width * FX.bubbleRiseRatio)
            bubble.scale.set(0.25 + rise * 0.75)
            bubble.alpha = phase < 0.8 ? Math.sin(rise * Math.PI * 0.8) * FX.bubbleAlpha : 0
            const popPhase = Math.max(0, (phase - 0.8) / 0.2)
            pop.position.set(x, y - width * FX.bubbleRiseRatio)
            pop.scale.set(0.5 + popPhase)
            pop.alpha = phase >= 0.8 ? (1 - popPhase) * FX.popAlpha : 0
        })
        steam.forEach((puff, index) => {
            const phase = (elapsed / FX.steamDuration + index / steam.length) % 1
            const side = index % 2 ? 1 : -1
            puff.position.set(
                side * width * (0.08 + (index % 3) * 0.04) + Math.sin(phase * Math.PI * 2 + index) * width * 0.025,
                -height * 0.1 - phase * width * FX.steamRiseRatio
            )
            puff.scale.set(0.5 + phase * 1.2)
            puff.alpha = Math.sin(phase * Math.PI) ** 2 * FX.steamAlpha
        })
    }

    function reset() {
        elapsed = 0
        render()
    }

    function update(deltaMs: number) {
        if (reducedMotion) return
        elapsed += Math.max(0, Math.min(deltaMs, FX.maxDeltaMs)) / 1000
        render()
    }

    reset()
    if (reducedMotion) {
        for (const child of view.children) child.visible = child === glow
    }
    return { update, reset }
}
