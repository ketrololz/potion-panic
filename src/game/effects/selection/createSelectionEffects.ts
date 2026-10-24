import { Container, Graphics, Point } from 'pixi.js'
import type { PointData } from 'pixi.js'
import { gsap } from 'gsap'
import { createCauldronImpact } from './createCauldronImpact'
import { SELECTION_FX as FX } from './constants/selection.constants'

export function createSelectionEffects(liquid: Container, onImpact: (recipeCompleted: boolean) => void) {
    const view = new Container()
    view.eventMode = 'none'
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const running = new Map<gsap.core.Timeline, Container>()
    let paused = false

    function effect() {
        const layer = new Container()
        layer.eventMode = 'none'
        view.addChild(layer)
        const timeline = gsap.timeline({
            paused,
            onComplete() {
                running.delete(timeline)
                layer.destroy({ children: true })
            }
        })
        running.set(timeline, layer)
        return { layer, timeline }
    }

    function success(source: PointData, recipeCompleted = false) {
        const target = view.toLocal(liquid.getGlobalPosition())
        const { layer, timeline } = effect()
        const liquidBounds = liquid.getLocalBounds()
        const left = view.toLocal(liquid.toGlobal({ x: liquidBounds.x, y: 0 }))
        const right = view.toLocal(liquid.toGlobal({ x: liquidBounds.x + liquidBounds.width, y: 0 }))
        const width = Math.hypot(right.x - left.x, right.y - left.y)
        const arrival = reducedMotion ? 0 : FX.travelDuration
        createCauldronImpact(layer, timeline, target, width, arrival, reducedMotion)
        timeline.call(() => onImpact(recipeCompleted), [], arrival)
        if (reducedMotion) return

        const trail = new Graphics()
        trail.blendMode = 'add'
        const head = new Graphics()
            .circle(0, 0, FX.dropGlowRadius)
            .fill({ color: FX.magicColor, alpha: 0.08 })
            .circle(0, 0, FX.dropRadius * 1.4)
            .fill({ color: FX.magicColor, alpha: 0.18 })
            .circle(0, 0, FX.dropRadius)
            .fill({ color: FX.magicColor, alpha: 0.7 })
            .circle(0, 0, FX.dropCoreRadius)
            .fill(FX.coreColor)
        head.blendMode = 'add'
        head.position.copyFrom(source)
        layer.addChild(trail, head)
        const control = new Point((source.x + target.x) / 2, Math.min(source.y, target.y) - FX.arcHeight)
        const progress = { t: 0 }
        function pointAt(t: number) {
            const inverse = 1 - t
            return {
                x: inverse * inverse * source.x + 2 * inverse * t * control.x + t * t * target.x,
                y: inverse * inverse * source.y + 2 * inverse * t * control.y + t * t * target.y
            }
        }
        timeline.to(
            progress,
            {
                t: 1,
                duration: FX.travelDuration,
                ease: 'power1.in',
                onUpdate() {
                    trail.clear()
                    head.position.copyFrom(pointAt(progress.t))
                    for (let index = 1; index <= FX.trailSegments; index++) {
                        const fraction = index / FX.trailSegments
                        const from = pointAt(Math.max(0, progress.t - FX.trailLength * (1 - (index - 1) / FX.trailSegments)))
                        const to = pointAt(Math.max(0, progress.t - FX.trailLength * (1 - fraction)))
                        trail
                            .moveTo(from.x, from.y)
                            .lineTo(to.x, to.y)
                            .stroke({ color: FX.magicColor, width: FX.trailWidth * fraction, alpha: fraction * 0.12, cap: 'round' })
                        trail
                            .moveTo(from.x, from.y)
                            .lineTo(to.x, to.y)
                            .stroke({ color: FX.coreColor, width: FX.trailCoreWidth * fraction, alpha: fraction * 0.8, cap: 'round' })
                    }
                }
            },
            0
        )
        timeline.to([head, trail], { alpha: 0, duration: 0.16 }, arrival)
    }

    function error(source: PointData) {
        const { layer, timeline } = effect()
        layer.position.copyFrom(source)
        const flash = new Container()
        const glow = new Graphics().circle(0, 0, FX.errorRadius).fill({ color: FX.errorColor, alpha: 0.12 })
        const ring = new Graphics().circle(0, 0, FX.errorRadius).stroke({ color: FX.errorColor, width: 3, alpha: 0.9 })
        flash.addChild(glow, ring)
        layer.addChild(flash)
        timeline
            .fromTo(
                flash.scale,
                { x: 0.7, y: 0.7 },
                { x: reducedMotion ? 1 : 1.3, y: reducedMotion ? 1 : 1.3, duration: FX.errorDuration, ease: 'power2.out' },
                0
            )
            .to(layer, { alpha: 0, duration: FX.errorDuration, ease: 'power2.in' }, 0)
    }

    function clear() {
        for (const [timeline, layer] of running) {
            timeline.kill()
            layer.destroy({ children: true })
        }
        running.clear()
    }

    function setPaused(value: boolean) {
        if (paused === value) return
        paused = value
        for (const timeline of running.keys()) timeline.paused(paused)
    }

    view.once('destroyed', clear)
    return { view, success, error, clear, setPaused }
}
