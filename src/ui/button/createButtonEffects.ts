import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js'
import type { FederatedPointerEvent } from 'pixi.js'
import { gsap } from 'gsap'
import { BUTTON_EFFECTS as FX } from './constants/effects.constants'

interface ButtonEffectsOptions {
    view: Container
    content: Container
    background: Sprite
    sheenEnabled?: boolean
}

export function createButtonEffects({ view, content, background, sheenEnabled = true }: ButtonEffectsOptions) {
    const width = background.width
    const height = background.height
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let hovered = false
    let pressed = false
    let enabled = true
    let stateAnimation: gsap.core.Timeline | undefined
    let shimmer: gsap.core.Timeline | undefined
    let particles: gsap.core.Timeline | undefined

    const glow = new Sprite(background.texture)
    glow.anchor.set(0.5)
    glow.width = width * FX.glowScale
    glow.height = height * FX.glowScale
    glow.tint = FX.glowColor
    glow.blendMode = 'add'
    glow.alpha = 0
    const blur = new BlurFilter({ strength: height * FX.glowBlurRatio, quality: 4 })
    glow.filters = [blur]
    content.addChildAt(glow, 0)

    const light = new Container()
    light.alpha = 0
    light.eventMode = 'none'
    const lightMask = new Sprite(background.texture)
    lightMask.anchor.set(0.5)
    lightMask.width = width
    lightMask.height = height
    const bandWidth = width * FX.sheenWidthRatio
    const sheen = new Graphics().poly([-bandWidth, -height, 0, -height, bandWidth, height, 0, height]).fill({ color: FX.sheenColor, alpha: FX.sheenAlpha })
    sheen.blendMode = 'add'
    light.addChild(sheen, lightMask)
    light.setMask({ mask: lightMask, channel: 'alpha' })
    content.addChild(light)

    const sparks = new Container()
    sparks.eventMode = 'none'
    const sparkSize = height * FX.sparkSizeRatio
    const stars = Array.from({ length: FX.sparkCount }, () => {
        const star = new Graphics()
            .poly([
                0,
                -sparkSize * 2,
                sparkSize * 0.35,
                -sparkSize * 0.35,
                sparkSize * 2,
                0,
                sparkSize * 0.35,
                sparkSize * 0.35,
                0,
                sparkSize * 2,
                -sparkSize * 0.35,
                sparkSize * 0.35,
                -sparkSize * 2,
                0,
                -sparkSize * 0.35,
                -sparkSize * 0.35
            ])
            .fill(FX.sparkColor)
        star.alpha = 0
        star.blendMode = 'add'
        sparks.addChild(star)
        return star
    })
    content.addChild(sparks)

    // Animate the inner content so scene layout and hit area remain stable.
    function animateState() {
        const scale = pressed ? FX.pressedScale : hovered ? FX.hoverScale : 1
        const duration = reducedMotion ? 0 : pressed ? FX.pressDuration : FX.releaseDuration
        stateAnimation?.kill()
        stateAnimation = gsap
            .timeline()
            .to(content.scale, { x: scale, y: scale, duration, ease: pressed ? 'power2.out' : 'back.out(1.5)' }, 0)
            .to(content, { y: hovered && !pressed && !reducedMotion ? -height * FX.liftRatio : 0, duration }, 0)
            .to(glow, { alpha: hovered || pressed ? FX.glowAlpha : 0, duration: reducedMotion ? 0 : FX.hoverDuration }, 0)
    }

    function stopMagic() {
        shimmer?.kill()
        particles?.kill()
        shimmer = undefined
        particles = undefined
        light.alpha = 0
        for (const star of stars) star.alpha = 0
    }

    function startMagic() {
        stopMagic()
        if (reducedMotion) return

        if (sheenEnabled) {
            light.alpha = 1
            shimmer = gsap
                .timeline({ repeat: -1, repeatDelay: FX.sheenRepeatDelay })
                .fromTo(sheen, { x: -width * 0.7 }, { x: width * 0.7, duration: FX.sheenDuration, ease: 'power1.inOut' })
        }

        particles = gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
        stars.forEach((star, index) => {
            const x = (index / (stars.length - 1) - 0.5) * width * 0.85
            const y = -height * (0.25 + (index % 2) * 0.15)
            const at = index * FX.sparkStagger
            particles!
                .fromTo(
                    star,
                    { x, y, alpha: 0, rotation: 0 },
                    {
                        x: x + (index % 2 ? 1 : -1) * height * 0.12,
                        y: y - height * 0.4,
                        rotation: Math.PI * 0.25,
                        duration: FX.sparkDuration,
                        ease: 'power1.out'
                    },
                    at
                )
                .to(star, { alpha: 0.9, duration: 0.18 }, at)
                .to(star, { alpha: 0, duration: 0.55 }, at + 0.4)
        })
    }

    function reset() {
        hovered = false
        pressed = false
        stopMagic()
        animateState()
    }

    function onOver(event: FederatedPointerEvent) {
        if (!enabled || event.pointerType === 'touch') return
        hovered = true
        startMagic()
        animateState()
    }

    function onOut() {
        hovered = false
        pressed = false
        stopMagic()
        animateState()
    }

    function onDown() {
        if (!enabled) return
        pressed = true
        stopMagic()
        animateState()
    }

    function onUp() {
        if (!enabled) return
        pressed = false
        animateState()
        if (hovered) startMagic()
    }

    // Reset before the action can hide a modal or replace the scene.
    view.on('pointerover', onOver)
    view.on('pointerout', onOut)
    view.on('pointerdown', onDown)
    view.on('pointerup', onUp)
    view.on('pointerupoutside', reset)
    view.on('pointercancel', reset)
    view.on('pointertap', reset)

    view.once('destroyed', () => {
        stopMagic()
        stateAnimation?.kill()
        blur.destroy()
    })

    return {
        setEnabled(value: boolean) {
            if (enabled === value) return
            enabled = value
            if (!enabled) reset()
        }
    }
}
