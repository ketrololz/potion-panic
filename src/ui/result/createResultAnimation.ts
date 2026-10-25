import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import type { ResultData } from './types/result.types'
import { RESULT_FX as FX } from './constants/effects.constants'

interface ResultAnimationOptions {
    view: Container
    backdrop: Graphics
    content: Container
    scoreLabel: Text
    buttons: Container[]
}

export function createResultAnimation({ view, backdrop, content, scoreLabel, buttons }: ResultAnimationOptions) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const intro = new Container()
    intro.eventMode = 'none'
    view.addChild(intro)
    const seal = new Graphics()
        .circle(0, 0, FX.sealRadius)
        .stroke({ color: FX.goldColor, width: 2, alpha: 0.45 })
        .circle(0, 0, FX.sealRadius * 1.08)
        .stroke({ color: FX.magicColor, width: 1, alpha: 0.2 })
    const title = new Text({
        text: 'ВРЕМЯ ВЫШЛО',
        style: {
            fontFamily: 'Georgia',
            fontSize: FX.introFontSize,
            fill: FX.goldColor,
            dropShadow: { color: 0x12091e, blur: 12, distance: 3 }
        }
    })
    title.anchor.set(0.5)
    const subtitle = new Text({
        text: 'Зельеварение завершено',
        style: {
            fontFamily: 'Georgia',
            fontSize: FX.subtitleFontSize,
            fill: 0xfff3dc
        }
    })
    subtitle.anchor.set(0.5)
    subtitle.y = FX.subtitleY
    intro.addChild(seal, title, subtitle)
    const sparks = Array.from({ length: FX.sparkCount }, (_, index) => {
        const spark = new Graphics().circle(0, 0, index % 3 ? 2 : 4).fill(index % 2 ? FX.goldColor : FX.magicColor)
        spark.blendMode = 'add'
        intro.addChild(spark)
        return spark
    })
    let timeline: gsap.core.Timeline | undefined

    function clear() {
        timeline?.kill()
        timeline = undefined
        content.interactiveChildren = false
    }

    function play({ score }: ResultData) {
        clear()
        const panelAt = reducedMotion ? 0.35 : FX.panelAt
        backdrop.alpha = 0
        intro.alpha = 0
        content.alpha = 0
        content.y = reducedMotion ? 0 : FX.panelOffset
        content.scale.set(reducedMotion ? 1 : 0.96)
        buttons.forEach((button) => {
            button.alpha = 0
        })
        seal.visible = !reducedMotion
        scoreLabel.text = 'Очки: 0'
        const counter = { value: 0 }
        timeline = gsap.timeline()
        timeline
            .to(backdrop, { alpha: 1, duration: FX.introDuration }, 0)
            .to(intro, { alpha: 1, duration: 0.25 }, 0)
            .to(intro, { alpha: 0, duration: 0.3 }, panelAt - 0.2)
            .to(content, { alpha: 1, y: 0, duration: FX.panelDuration, ease: 'power3.out' }, panelAt)
            .to(content.scale, { x: 1, y: 1, duration: FX.panelDuration, ease: 'power3.out' }, panelAt)
            .to(
                counter,
                {
                    value: score,
                    duration: reducedMotion ? 0 : FX.countDuration,
                    ease: 'power2.out',
                    onUpdate: () => {
                        scoreLabel.text = `Очки: ${Math.round(counter.value)}`
                    },
                    onComplete: () => {
                        scoreLabel.text = `Очки: ${score}`
                    }
                },
                panelAt + 0.15
            )
            .to(buttons, { alpha: 1, duration: 0.3, stagger: FX.buttonStagger }, panelAt + 0.35)
            .call(
                () => {
                    content.interactiveChildren = true
                },
                [],
                panelAt + 0.65 + FX.buttonStagger * (buttons.length - 1)
            )
        if (!reducedMotion) {
            timeline.fromTo(seal.scale, { x: 0.7, y: 0.7 }, { x: 1.15, y: 1.15, duration: panelAt, ease: 'power2.out' }, 0)
            sparks.forEach((spark, index) => {
                const angle = (index * Math.PI * 2) / sparks.length
                spark.position.set(Math.cos(angle) * FX.sealRadius, Math.sin(angle) * FX.sealRadius)
                spark.alpha = 0
                timeline!
                    .to(spark, { alpha: 0.85, duration: 0.2 }, 0)
                    .to(
                        spark,
                        { x: Math.cos(angle) * FX.sparkDistance, y: Math.sin(angle) * FX.sparkDistance, alpha: 0, duration: panelAt, ease: 'power2.out' },
                        0.2
                    )
            })
        } else {
            sparks.forEach((spark) => {
                spark.alpha = 0
            })
        }
    }
    view.once('destroyed', () => timeline?.kill())
    return { play, clear }
}
