import { createRecordSparkles } from './createRecordSparkles'
import { createRoundFinale } from './createRoundFinale'
import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import type { ResultData } from './types/result.types'
import { RESULT_FX as FX } from './constants/effects.constants'

interface ResultAnimationOptions {
    screenWidth: number
    screenHeight: number
    view: Container
    backdrop: Graphics
    content: Container
    resultTitle: Text
    bestScoreLabel: Text
    onCountingChange: (counting: boolean) => void
    onNewRecord: () => void
    scoreLabel: Text
    buttons: Container[]
}

export function createResultAnimation({
    view,
    backdrop,
    content,
    scoreLabel,
    buttons,
    screenWidth,
    screenHeight,
    resultTitle,
    bestScoreLabel,
    onCountingChange,
    onNewRecord
}: ResultAnimationOptions) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finale = createRoundFinale(view, screenWidth, screenHeight)
    const intro = new Container()
    intro.eventMode = 'none'
    view.addChild(intro)
    const seal = new Graphics()
        .circle(0, 0, FX.sealRadius)
        .stroke({ color: FX.goldColor, width: 2, alpha: 0.45 })
        .circle(0, 0, FX.sealRadius * 1.08)
        .stroke({ color: FX.magicColor, width: 1, alpha: 0.2 })
    for (let index = 0; index < 24; index++) {
        const angle = (index * Math.PI) / 12
        const inner = FX.sealRadius * 0.92
        const outer = FX.sealRadius * (index % 3 === 0 ? 1.04 : 0.98)
        seal.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
            .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
            .stroke({ color: FX.goldColor, width: 2, alpha: 0.6 })
    }
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
    const recordSparkles = createRecordSparkles(view, screenWidth, screenHeight)
    let timeline: gsap.core.Timeline | undefined
    let celebration: gsap.core.Timeline | undefined

    function clear() {
        onCountingChange(false)
        celebration?.kill()
        celebration = undefined
        timeline?.kill()
        timeline = undefined
        content.interactiveChildren = false
        finale.reset()
        recordSparkles.reset()
    }

    function play({ score, bestScore, previousBestScore }: ResultData) {
        clear()
        resultTitle.text = 'ИТОГИ РАУНДА'
        resultTitle.scale.set(1)
        scoreLabel.scale.set(1)
        bestScoreLabel.style.fill = 0xfff3dc
        bestScoreLabel.text = `Рекорд: ${previousBestScore}`
        const isNewRecord = score > previousBestScore
        const panelAt = reducedMotion ? 0.35 : FX.panelAt
        backdrop.alpha = 0
        intro.alpha = 0
        content.alpha = 0
        content.y = reducedMotion ? 0 : FX.panelOffset
        content.scale.set(reducedMotion ? 1 : 0.96)
        buttons.forEach((button) => {
            button.alpha = 0
        })
        title.scale.set(1)
        title.alpha = 1
        subtitle.alpha = 1
        seal.rotation = 0
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
                    duration: reducedMotion || score === 0 ? 0 : FX.countDuration,
                    onStart: () => {
                        if (!reducedMotion && score > 0) onCountingChange(true)
                    },
                    ease: 'power2.out',
                    onUpdate: () => {
                        scoreLabel.text = `Очки: ${Math.round(counter.value)}`
                    },
                    onComplete: () => {
                        onCountingChange(false)
                        bestScoreLabel.text = `Рекорд: ${bestScore}`
                        scoreLabel.text = `Очки: ${score}`
                        if (!isNewRecord) return
                        resultTitle.text = 'НОВЫЙ РЕКОРД!'
                        bestScoreLabel.style.fill = FX.goldColor
                        onNewRecord()
                        if (reducedMotion) return
                        celebration = gsap.timeline()
                        finale.play(celebration)
                        recordSparkles.play(celebration)
                        celebration
                            .to(resultTitle.scale, { x: FX.recordTitleScale, y: FX.recordTitleScale, duration: 0.2, ease: 'power2.out' }, 0)
                            .to(resultTitle.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' }, 0.2)
                            .to(scoreLabel.scale, { x: 1.18, y: 1.18, duration: 0.2 }, 0)
                            .to(scoreLabel.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' }, 0.2)
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
            finale.play(timeline)
            title.scale.set(FX.titleScale)
            title.alpha = 0
            subtitle.alpha = 0
            timeline
                .to(title, { alpha: 1, duration: 0.18 }, FX.burstAt)
                .to(title.scale, { x: 1, y: 1, duration: 0.55, ease: 'back.out(1.5)' }, FX.burstAt)
                .to(subtitle, { alpha: 1, duration: 0.35 }, 0.4)
                .to(seal, { rotation: 0.18, duration: panelAt, ease: 'sine.out' }, 0)
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
    view.once('destroyed', clear)
    return { play, clear }
}
