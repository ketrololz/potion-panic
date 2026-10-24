import { BlurFilter, Container, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { RECIPE_FOCUS as FX } from './constants/effects.constants'

export function createRecipeFocus() {
    const view = new Container()
    view.eventMode = 'none'
    view.visible = false

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const halo = new Graphics().circle(0, 0, FX.haloRadius).fill(FX.haloColor)
    halo.alpha = FX.haloAlpha
    halo.blendMode = 'add'
    const blur = new BlurFilter({ strength: FX.haloBlur, quality: 4 })
    halo.filters = [blur]

    const arcs = new Graphics()
    for (let index = 0; index < FX.arcCount; index++) {
        const angle = (index / FX.arcCount) * Math.PI * 2
        arcs.moveTo(Math.cos(angle) * FX.radius, Math.sin(angle) * FX.radius)
            .arc(0, 0, FX.radius, angle, angle + FX.arcLength)
            .stroke({ color: FX.arcColor, width: FX.arcWidth, cap: 'round' })
    }

    const inner = new Graphics()
    for (let index = 0; index < FX.arcCount; index++) {
        const angle = (index / FX.arcCount) * Math.PI * 2 + Math.PI / FX.arcCount
        inner
            .moveTo(Math.cos(angle) * FX.innerRadius, Math.sin(angle) * FX.innerRadius)
            .arc(0, 0, FX.innerRadius, angle, angle + FX.arcLength * 0.5)
            .stroke({ color: FX.accentColor, width: 1, alpha: 0.55, cap: 'round' })
    }

    const orbit = new Container()
    for (let index = 0; index < FX.orbitCount; index++) {
        const angle = (index / FX.orbitCount) * Math.PI * 2
        const size = index % 2 === 0 ? FX.sparkSize : FX.sparkSize * 0.6
        const star = new Graphics()
            .poly([
                0,
                -size * 1.7,
                size * 0.4,
                -size * 0.4,
                size,
                0,
                size * 0.4,
                size * 0.4,
                0,
                size * 1.7,
                -size * 0.4,
                size * 0.4,
                -size,
                0,
                -size * 0.4,
                -size * 0.4
            ])
            .fill(index % 2 === 0 ? FX.arcColor : FX.accentColor)
        star.position.set(Math.cos(angle) * FX.orbitRadius, Math.sin(angle) * FX.orbitRadius)
        orbit.addChild(star)
    }

    view.addChild(halo, inner, arcs, orbit)

    const ambient = gsap.timeline({ paused: true, repeat: -1 })
    if (!reducedMotion) {
        ambient
            .to(arcs, { rotation: Math.PI * 2, duration: FX.rotationDuration, ease: 'none', repeat: -1 }, 0)
            .to(inner, { rotation: -Math.PI * 2, duration: FX.counterRotationDuration, ease: 'none', repeat: -1 }, 0)
            .to(orbit, { rotation: -Math.PI * 2, duration: FX.counterRotationDuration, ease: 'none', repeat: -1 }, 0)
            .to(halo, { alpha: FX.haloAlpha * 0.55, duration: FX.pulseDuration, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
    }

    let transition: gsap.core.Timeline | undefined
    let activeX: number | undefined

    function setPosition(x: number, y: number) {
        if (activeX === x && view.visible) return
        const firstAppearance = activeX === undefined
        activeX = x
        view.visible = true
        if (!reducedMotion) ambient.play()

        transition?.kill()
        if (firstAppearance || reducedMotion) view.position.set(x, y)
        transition = gsap
            .timeline()
            .to(view, { x, y, duration: reducedMotion ? 0 : FX.moveDuration, ease: 'power3.out' }, 0)
            .fromTo(view.scale, { x: 0.9, y: 0.9 }, { x: 1, y: 1, duration: reducedMotion ? 0 : FX.appearDuration, ease: 'back.out(1.4)' }, 0)
    }

    function hide() {
        view.visible = false
        ambient.pause()
        transition?.kill()
    }

    view.once('destroyed', () => {
        ambient.kill()
        transition?.kill()
        blur.destroy()
    })

    return { view, setPosition, hide }
}
