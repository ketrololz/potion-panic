import { Container, Graphics } from 'pixi.js'
import type { FederatedPointerEvent } from 'pixi.js'
import { gsap } from 'gsap'
import { INGREDIENT_EFFECTS as FX } from './constants/effects.constants'

interface IngredientEffectsOptions {
    view: Container
    floating: Container
    visual: Container
    size: number
    id: string
}

function createSpark(size: number, color: number) {
    return new Graphics()
        .poly([
            0,
            -size,
            size * 0.25,
            -size * 0.25,
            size,
            0,
            size * 0.25,
            size * 0.25,
            0,
            size,
            -size * 0.25,
            size * 0.25,
            -size,
            0,
            -size * 0.25,
            -size * 0.25
        ])
        .fill(color)
}

export function createIngredientEffects({ view, floating, visual, size, id }: IngredientEffectsOptions) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seed = ([...id].reduce((value, char) => value + char.charCodeAt(0), 0) % 17) / 17
    let hovered = false
    let feedback: gsap.core.Tween | undefined
    let burst: gsap.core.Timeline | undefined

    const sparkles = new Container()
    sparkles.eventMode = 'none'
    floating.addChild(sparkles)
    const stars = Array.from({ length: 3 }, (_, index) => {
        const star = createSpark(size * 0.035, FX.sparkColor)
        const angle = seed * Math.PI * 2 + (index * Math.PI * 2) / 3
        star.position.set(Math.cos(angle) * size * 0.36, Math.sin(angle) * size * 0.36)
        star.alpha = 0
        sparkles.addChild(star)
        return star
    })

    const burstLayer = new Container()
    burstLayer.eventMode = 'none'
    floating.addChild(burstLayer)
    const ring = new Graphics().circle(0, 0, size * FX.ringRadiusRatio).stroke({ color: FX.magicColor, width: FX.ringWidth })
    ring.blendMode = 'add'
    ring.alpha = 0
    burstLayer.addChild(ring)
    const motes = Array.from({ length: FX.burstCount }, (_, index) => {
        const mote = createSpark(size * 0.025, index % 2 ? FX.magicColor : FX.sparkColor)
        mote.blendMode = 'add'
        mote.alpha = 0
        burstLayer.addChild(mote)
        return mote
    })

    const halo = new Container()
    halo.eventMode = 'none'
    halo.alpha = 0
    floating.addChildAt(halo, 0)
    for (let index = 0; index < 3; index++) {
        const start = (index * Math.PI * 2) / 3
        const arc = new Graphics()
            .arc(0, 0, size * FX.haloRadiusRatio, start, start + Math.PI * 0.45)
            .stroke({ color: FX.magicColor, width: FX.haloWidth * 4, alpha: 0.1 })
            .arc(0, 0, size * FX.haloRadiusRatio, start, start + Math.PI * 0.45)
            .stroke({ color: FX.sparkColor, width: FX.haloWidth, alpha: 0.9 })
        arc.blendMode = 'add'
        halo.addChild(arc)
    }
    const flash = new Graphics()
        .circle(0, 0, size * 0.35)
        .fill({ color: FX.magicColor, alpha: 0.08 })
        .circle(0, 0, size * 0.24)
        .fill({ color: FX.sparkColor, alpha: 0.12 })
    flash.blendMode = 'add'
    flash.alpha = 0
    floating.addChildAt(flash, 0)

    const ambient = gsap.timeline({ paused: true })
    if (!reducedMotion) {
        ambient.fromTo(
            floating,
            { y: -size * FX.floatHeightRatio, rotation: -FX.tilt },
            {
                y: size * FX.floatHeightRatio,
                rotation: FX.tilt,
                duration: FX.floatDuration + seed,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            },
            0
        )
        stars.forEach((star, index) => {
            const twinkle = gsap
                .timeline({ repeat: -1, repeatDelay: FX.shimmerDelay + seed })
                .to(star, { alpha: 0.85, duration: FX.shimmerDuration * 0.35, ease: 'sine.inOut' })
                .to(star, { alpha: 0, duration: FX.shimmerDuration * 0.65, ease: 'sine.inOut' })
            ambient.add(twinkle, seed + index * 0.65)
        })
        ambient.play(seed * FX.floatDuration)
    }

    function scaleTo(scale: number, pressed = false) {
        feedback?.kill()
        feedback = gsap.to(visual.scale, {
            x: scale,
            y: scale,
            duration: reducedMotion ? 0 : pressed ? FX.pressDuration : FX.releaseDuration,
            ease: pressed ? 'power2.out' : 'back.out(1.7)'
        })
    }

    function release() {
        scaleTo(hovered ? FX.hoverScale : 1)
    }

    function onOver(event: FederatedPointerEvent) {
        if (event.pointerType === 'touch') return
        hovered = true
        release()
    }

    function onOut() {
        hovered = false
        release()
    }

    function playBurst() {
        burst?.kill()
        burst = gsap.timeline()
        halo.alpha = 0
        flash.alpha = FX.flashAlpha
        burst.to(flash, { alpha: 0, duration: FX.burstDuration, ease: 'power2.out' }, 0)
        if (!reducedMotion) {
            halo.alpha = 1
            halo.rotation = seed * Math.PI
            halo.scale.set(0.75)
            burst
                .to(halo, { alpha: 0, rotation: halo.rotation + FX.haloRotation, duration: FX.haloDuration, ease: 'power2.out' }, 0)
                .to(halo.scale, { x: 1.4, y: 1.4, duration: FX.haloDuration, ease: 'power2.out' }, 0)
        }
        if (!reducedMotion) {
            visual.scale.set(FX.tapScale)
            release()
        }
        ring.scale.set(reducedMotion ? 1 : 0.6)
        ring.alpha = 0.8
        burst.to(ring, { alpha: 0, duration: FX.burstDuration, ease: 'power2.out' }, 0)
        if (reducedMotion) return

        burst.to(ring.scale, { x: 1.65, y: 1.65, duration: FX.burstDuration, ease: 'power2.out' }, 0)
        motes.forEach((mote, index) => {
            const angle = (index * Math.PI * 2) / motes.length + seed
            const distance = size * FX.burstDistanceRatio * (index % 2 ? 0.8 : 1)
            mote.position.set(Math.cos(angle) * size * 0.2, Math.sin(angle) * size * 0.2)
            mote.scale.set(1)
            mote.alpha = 1
            burst!
                .to(
                    mote,
                    { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, alpha: 0, rotation: angle, duration: FX.burstDuration, ease: 'power2.out' },
                    0
                )
                .to(mote.scale, { x: 0.2, y: 0.2, duration: FX.burstDuration }, 0)
        })
    }

    view.on('pointerover', onOver)
    view.on('pointerout', onOut)
    view.on('pointerdown', () => scaleTo(FX.pressedScale, true))
    view.on('pointerup', release)
    view.on('pointerupoutside', onOut)
    view.on('pointercancel', onOut)
    view.on('pointertap', playBurst)
    view.once('destroyed', () => {
        ambient.kill()
        feedback?.kill()
        burst?.kill()
    })
}
