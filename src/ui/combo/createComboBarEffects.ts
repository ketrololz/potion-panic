import { Container, Graphics } from 'pixi.js'
import type { Sprite, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { createComboFill } from './createComboFill'
import { COMBO_FX as FX } from './constants/effects.constants'
import { COMBO_LAYOUT as L } from './constants/layout.constants'

export function createComboBarEffects(parent: Container, fill: Container, title: Text, flame: Sprite) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const painter = createComboFill(fill)
    const particles = new Container()
    particles.eventMode = 'none'
    parent.addChildAt(particles, parent.getChildIndex(fill) + 1)
    const sparks = Array.from({ length: FX.burnSparkCount }, (_, index) => {
        const spark = new Graphics().circle(0, 0, index % 4 === 0 ? 3 : 1.5).fill(FX.burnColor)
        spark.blendMode = 'add'
        spark.alpha = 0
        particles.addChild(spark)
        return spark
    })
    const state = { progress: 0, warmth: 0, sweep: 0 }
    let paused = false
    let isBurning = false
    let transition: gsap.core.Timeline | undefined
    function draw() {
        painter.draw(state.progress, state.warmth, state.sweep, !reducedMotion && !isBurning)
    }
    const shimmer = gsap.to(state, { sweep: 1, duration: FX.sheenDuration, repeat: -1, ease: 'none', paused: true, onUpdate: draw })
    function stop() {
        transition?.kill()
        transition = undefined
        shimmer.pause()
        isBurning = false
        sparks.forEach((spark) => {
            spark.alpha = 0
        })
    }
    function syncShimmer() {
        shimmer.paused(paused || reducedMotion || isBurning || state.progress <= 0)
    }
    function setProgress(value: number, animate = false) {
        stop()
        title.alpha = 1
        flame.alpha = 1
        fill.alpha = 1
        if (!animate || reducedMotion) {
            state.progress = value
            state.warmth = 0
            draw()
            syncShimmer()
            return
        }
        transition = gsap.timeline({
            paused,
            onComplete: () => {
                transition = undefined
                syncShimmer()
            }
        })
        transition.to(state, {
            progress: value,
            warmth: 0,
            duration: FX.growDuration,
            ease: 'power2.out',
            onUpdate() {
                draw()
                syncShimmer()
            }
        })
    }
    function burn() {
        stop()
        if (state.progress <= 0) return
        isBurning = true
        const start = state.progress
        const duration = reducedMotion ? 0.2 : FX.burnDuration
        draw()
        transition = gsap.timeline({
            paused,
            onComplete() {
                title.visible = false
                flame.visible = false
                setProgress(0)
            }
        })
        transition.to(state, { progress: 0, duration, ease: 'none', onUpdate: draw }, 0)
        transition.to(state, { warmth: FX.burnHeat, duration: duration * 0.3, ease: 'sine.out', onUpdate: draw }, 0)
        transition.to([fill, title, flame], { alpha: 0, duration, ease: 'power2.in' }, 0)
        if (reducedMotion) return
        sparks.forEach((spark, index) => {
            const fraction = index / sparks.length
            const at = fraction * duration * 0.95
            const x = fill.x + L.fillWidth * start * (1 - fraction * 0.95)
            const spread = Math.sin(index * 2.39996)
            const distance = FX.burnSparkDistance * (0.4 + (index % 7) / 7)
            spark.position.set(x, spread * L.fillHeight * 0.45)
            spark.scale.set(1)
            transition!.set(spark, { alpha: 0.95 }, at)
            transition!.to(spark, { x: x + distance, y: spread * distance * 0.8 - 25, alpha: 0, duration: FX.burnSparkDuration, ease: 'power2.out' }, at)
            transition!.to(spark.scale, { x: 0.1, y: 0.1, duration: FX.burnSparkDuration }, at)
        })
    }
    function setPaused(value: boolean) {
        paused = value
        transition?.paused(value)
        syncShimmer()
    }
    parent.once('destroyed', () => {
        shimmer.kill()
        transition?.kill()
    })
    return { setProgress, burn, setPaused }
}
