import { Container, Graphics } from 'pixi.js'
import { RESULT_FX as FX } from './constants/effects.constants'

export function createRoundFinale(parent: Container, screenWidth: number, screenHeight: number) {
    const view = new Container()
    view.eventMode = 'none'
    parent.addChildAt(view, 1)
    const flash = new Graphics().rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight).fill(FX.magicColor)
    flash.blendMode = 'add'
    const halo = new Graphics()
    for (let layer = 18; layer >= 1; layer--) {
        halo.circle(0, 0, (FX.burstRadius * layer) / 18).fill({ color: FX.magicColor, alpha: 0.012 })
    }
    halo.blendMode = 'add'
    const rays = new Container()
    for (let index = 0; index < FX.burstRays; index++) {
        const ray = new Graphics()
            .poly([70, -2, FX.burstRadius * 1.65, -18, FX.burstRadius * 1.8, 0, FX.burstRadius * 1.65, 18, 70, 2])
            .fill({ color: index % 2 ? FX.goldColor : FX.magicColor, alpha: 0.055 })
        ray.rotation = (index * Math.PI * 2) / FX.burstRays
        ray.blendMode = 'add'
        rays.addChild(ray)
    }
    const rings = Array.from({ length: 3 }, (_, index) => {
        const ring = new Graphics()
            .circle(0, 0, FX.sealRadius)
            .stroke({ color: index % 2 ? FX.goldColor : FX.magicColor, width: index === 0 ? 3 : 1.5, alpha: 0.55 })
        ring.blendMode = 'add'
        return ring
    })
    const embers = Array.from({ length: FX.burstSparks }, (_, index) => {
        const ember = new Graphics().star(0, 0, 4, index % 5 === 0 ? 6 : 3, 1).fill(index % 3 ? FX.goldColor : FX.magicColor)
        ember.blendMode = 'add'
        return ember
    })
    view.addChild(halo, rays, ...rings, ...embers, flash)
    function reset() {
        view.visible = false
        flash.alpha = 0
        halo.alpha = 0
        rays.alpha = 0
        rings.forEach((ring) => {
            ring.alpha = 0
        })
        embers.forEach((ember) => {
            ember.alpha = 0
        })
    }
    function play(timeline: gsap.core.Timeline) {
        reset()
        view.visible = true
        halo.scale.set(0.25)
        rays.scale.set(0.4)
        rays.rotation = -0.12
        timeline
            .to(halo, { alpha: 1, duration: FX.burstAt }, 0)
            .to(halo.scale, { x: 1.8, y: 1.8, duration: FX.burstDuration, ease: 'power2.out' }, 0)
            .to(halo, { alpha: 0, duration: FX.burstDuration }, FX.burstAt)
            .to(flash, { alpha: FX.flashAlpha, duration: 0.08 }, FX.burstAt)
            .to(flash, { alpha: 0, duration: 0.45 }, FX.burstAt + 0.08)
            .to(rays, { alpha: 1, duration: 0.16 }, FX.burstAt)
            .to(rays, { alpha: 0, rotation: 0.15, duration: FX.burstDuration }, FX.burstAt + 0.16)
            .to(rays.scale, { x: 1.4, y: 1.4, duration: FX.burstDuration, ease: 'power2.out' }, FX.burstAt)
        rings.forEach((ring, index) => {
            const at = FX.burstAt + index * 0.12
            ring.scale.set(0.4)
            timeline
                .set(ring, { alpha: 0.7 }, at)
                .to(ring.scale, { x: 2.8 + index * 0.4, y: 2.8 + index * 0.4, duration: FX.burstDuration, ease: 'power2.out' }, at)
                .to(ring, { alpha: 0, duration: FX.burstDuration, ease: 'power1.out' }, at)
        })
        embers.forEach((ember, index) => {
            const angle = index * 2.39996
            const distance = FX.sparkDistance * (0.7 + (index % 7) * 0.12)
            const at = FX.burstAt + (index % 5) * 0.025
            ember.position.set(Math.cos(angle) * 80, Math.sin(angle) * 80)
            ember.scale.set(1)
            ember.rotation = angle
            timeline
                .set(ember, { alpha: 0.9 }, at)
                .to(
                    ember,
                    { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance - 80, rotation: angle + 1, duration: FX.burstDuration, ease: 'power3.out' },
                    at
                )
                .to(ember, { alpha: 0, duration: FX.burstDuration * 0.7 }, at + FX.burstDuration * 0.3)
                .to(ember.scale, { x: 0.1, y: 0.1, duration: FX.burstDuration }, at)
        })
    }
    reset()
    return { play, reset }
}
