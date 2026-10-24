import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { HUD_REWARD_FX as FX } from './constants/reward.constants'

export function createHudRewardEffect(parent: Container, target: Text, color: number) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const baseScale = target.scale.clone()
    const view = new Container()
    view.eventMode = 'none'
    view.position.x = target.x
    parent.addChild(view)
    const label = new Text({
        text: '',
        style: {
            fontFamily: 'Georgia',
            fontSize: FX.fontSize,
            fontWeight: 'bold',
            fill: color,
            stroke: { color: 0x21102f, width: 4 },
            dropShadow: { color: 0x10091c, alpha: 0.8, blur: 5, distance: 2 }
        }
    })
    label.anchor.set(0.5)
    view.addChild(label)
    const sparks = Array.from({ length: FX.sparkCount }, (_, index) => {
        const spark = new Graphics().circle(0, 0, index % 2 ? 2 : 3).fill(0xffffff)
        spark.blendMode = 'add'
        view.addChild(spark)
        return spark
    })
    let timeline: gsap.core.Timeline | undefined
    let paused = false

    function clear() {
        timeline?.kill()
        timeline = undefined
        view.visible = false
        target.scale.copyFrom(baseScale)
    }

    function play(text: string, effectColor = color, startY: number = FX.startY) {
        clear()
        view.visible = true
        label.text = text
        label.style.fill = effectColor
        label.alpha = 0
        label.y = startY
        label.scale.set(reducedMotion ? 1 : 0.85)
        timeline = gsap.timeline({ paused, onComplete: clear })
        timeline.to(label, { alpha: 1, duration: FX.pulseDuration }, 0).to(label, { alpha: 0, duration: FX.fadeDuration }, FX.duration - FX.fadeDuration)
        if (!reducedMotion) {
            timeline
                .to(label, { y: startY - FX.rise, duration: FX.duration, ease: 'power1.out' }, 0)
                .to(label.scale, { x: 1, y: 1, duration: FX.pulseDuration, ease: 'back.out(1.7)' }, 0)
                .to(target.scale, { x: baseScale.x * FX.pulseScale, y: baseScale.y * FX.pulseScale, duration: FX.pulseDuration, ease: 'power2.out' }, 0)
                .to(target.scale, { x: baseScale.x, y: baseScale.y, duration: FX.fadeDuration, ease: 'sine.out' }, FX.pulseDuration)
        }
        sparks.forEach((spark, index) => {
            spark.tint = effectColor
            spark.alpha = reducedMotion ? 0 : 0.85
            const angle = (index * Math.PI * 2) / sparks.length
            spark.position.set(Math.cos(angle) * 20, startY + Math.sin(angle) * 10)
            if (reducedMotion) return
            timeline!.to(
                spark,
                {
                    x: Math.cos(angle) * FX.sparkDistance,
                    y: startY + Math.sin(angle) * FX.sparkDistance * 0.5 - FX.rise,
                    alpha: 0,
                    duration: FX.duration * 0.7,
                    ease: 'power2.out'
                },
                0
            )
        })
    }
    function setPaused(value: boolean) {
        if (paused === value) return
        paused = value
        timeline?.paused(value)
    }
    parent.once('destroyed', () => timeline?.kill())
    clear()
    return { play, clear, setPaused }
}
