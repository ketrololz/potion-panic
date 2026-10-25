import { gsap } from 'gsap'
import type { Container, Text } from 'pixi.js'
import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import { createRecordSparkles } from './createRecordSparkles'
import type { createRoundFinale } from './createRoundFinale'
import { RESULT_FX as FX } from './constants/effects.constants'

interface RecordCelebrationOptions {
    view: Container
    screenWidth: number
    screenHeight: number
    resultTitle: Text
    scoreLabel: Text
    bestScoreLabel: Text
    finale: ReturnType<typeof createRoundFinale>
    onNewRecord: () => void
}

export function createRecordCelebration({
    view,
    screenWidth,
    screenHeight,
    resultTitle,
    scoreLabel,
    bestScoreLabel,
    finale,
    onNewRecord
}: RecordCelebrationOptions) {
    const reducedMotion = prefersReducedMotion()
    const sparkles = createRecordSparkles(view, screenWidth, screenHeight)
    let timeline: gsap.core.Timeline | undefined

    function clear() {
        timeline?.kill()
        timeline = undefined
        sparkles.reset()
    }

    function play() {
        clear()
        resultTitle.text = 'НОВЫЙ РЕКОРД!'
        bestScoreLabel.style.fill = FX.goldColor
        onNewRecord()
        if (reducedMotion) return
        timeline = gsap.timeline()
        finale.play(timeline)
        sparkles.play(timeline)
        timeline
            .to(resultTitle.scale, { x: FX.recordTitleScale, y: FX.recordTitleScale, duration: 0.2, ease: 'power2.out' }, 0)
            .to(resultTitle.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' }, 0.2)
            .to(scoreLabel.scale, { x: 1.18, y: 1.18, duration: 0.2 }, 0)
            .to(scoreLabel.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' }, 0.2)
    }

    return { play, clear }
}
