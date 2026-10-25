import { Container, Graphics } from 'pixi.js'
import type { Sprite, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { COMBO_FX as FX } from './constants/effects.constants'
import { COMBO_LAYOUT as LAYOUT } from './constants/layout.constants'

export function createComboEffects(parent: Container, title: Text, flame: Sprite) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const titleScale = title.scale.clone()
    const flameScale = flame.scale.clone()
    const view = new Container()
    view.eventMode = 'none'
    const glow = new Graphics()
    for (let layer = 4; layer >= 1; layer--) {
        glow.ellipse(0, 0, LAYOUT.fillWidth * 0.5, LAYOUT.fillHeight * layer * 0.3).fill({ color: FX.sparkColor, alpha: 0.06 })
    }
    glow.blendMode = 'add'
    view.addChild(glow)
    const sparks = Array.from({ length: FX.sparkCount }, (_, index) => {
        const spark = new Graphics().star(0, 0, 4, FX.sparkRadius * (index % 3 === 0 ? 2 : 1), FX.sparkRadius * 0.3).fill(FX.sparkColor)
        spark.blendMode = 'add'
        view.addChild(spark)
        return spark
    })
    parent.addChild(view)
    let timeline: gsap.core.Timeline | undefined
    let paused = false

    function clear() {
        timeline?.kill()
        timeline = undefined
        view.visible = false
        title.scale.copyFrom(titleScale)
        flame.scale.copyFrom(flameScale)
    }

    function play(isMax: boolean) {
        clear()
        view.visible = true
        glow.alpha = FX.glowAlpha
        timeline = gsap.timeline({ paused, onComplete: clear })
        timeline.to(glow, { alpha: 0, duration: FX.glowDuration, ease: 'power2.out' }, 0)
        if (!reducedMotion) {
            const scale = isMax ? FX.maxPulseScale : FX.pulseScale
            for (const [target, base] of [
                [title, titleScale],
                [flame, flameScale]
            ] as const) {
                timeline
                    .to(target.scale, { x: base.x * scale, y: base.y * scale, duration: FX.pulseDuration, ease: 'power2.out' }, 0)
                    .to(target.scale, { x: base.x, y: base.y, duration: FX.settleDuration, ease: 'back.out(1.8)' }, FX.pulseDuration)
            }
        }
        sparks.forEach((spark, index) => {
            spark.alpha = reducedMotion ? 0 : 0.9
            if (reducedMotion) return
            const fraction = index / (sparks.length - 1)
            spark.position.set((fraction - 0.5) * LAYOUT.fillWidth, 0)
            spark.scale.set(1)
            const at = fraction * FX.pulseDuration
            timeline!.fromTo(spark, { alpha: 0 }, { alpha: 0.9, duration: 0.08 }, at)
            timeline!.to(
                spark,
                {
                    x: spark.x + (fraction - 0.5) * 35,
                    y: -FX.sparkRise * (0.5 + (index % 4) * 0.2) * (isMax ? 1.3 : 1),
                    duration: FX.sparkDuration,
                    ease: 'power2.out'
                },
                at
            )
            timeline!.to(spark, { alpha: 0, duration: FX.sparkDuration * 0.6 }, at + FX.sparkDuration * 0.4)
            timeline!.to(spark.scale, { x: 0.2, y: 0.2, duration: FX.sparkDuration }, at)
        })
    }

    function setPaused(value: boolean) {
        paused = value
        timeline?.paused(value)
    }

    parent.once('destroyed', () => timeline?.kill())
    clear()
    return { play, clear, setPaused }
}
