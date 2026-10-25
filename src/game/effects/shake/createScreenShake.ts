import { prefersReducedMotion } from '../../../shared/prefersReducedMotion'
import type { Container } from 'pixi.js'
import { gsap } from 'gsap'

const SHAKE = { duration: 0.34, horizontal: 11, vertical: 6, oscillations: 4 } as const

export function createScreenShake(target: Container) {
    const reducedMotion = prefersReducedMotion()
    let animation: gsap.core.Tween | undefined

    function clear() {
        animation?.kill()
        if (!target.destroyed) target.position.set(0, 0)
    }

    function play() {
        clear()
        if (reducedMotion) return
        const state = { progress: 0 }
        animation = gsap.to(state, {
            progress: 1,
            duration: SHAKE.duration,
            ease: 'none',
            onUpdate() {
                const decay = (1 - state.progress) ** 2
                const angle = state.progress * Math.PI * 2 * SHAKE.oscillations
                target.position.set(Math.sin(angle) * SHAKE.horizontal * decay, Math.sin(angle * 1.3) * SHAKE.vertical * decay)
            },
            onComplete: () => target.position.set(0, 0)
        })
    }

    target.once('destroyed', () => animation?.kill())
    return {
        play,
        clear,
        setPaused(value: boolean) {
            animation?.paused(value)
        }
    }
}
