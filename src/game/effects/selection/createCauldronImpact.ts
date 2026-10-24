import { Container, Graphics } from 'pixi.js'
import type { PointData } from 'pixi.js'
import { createCauldronCrown } from './createCauldronCrown'
import { SELECTION_FX as FX } from './constants/selection.constants'

export function createCauldronImpact(
    layer: Container,
    timeline: gsap.core.Timeline,
    target: PointData,
    width: number,
    arrival: number,
    reducedMotion: boolean
) {
    const impact = new Container()
    impact.position.copyFrom(target)
    layer.addChild(impact)

    const core = new Graphics()
    for (let index = 4; index >= 1; index--) {
        core.ellipse(0, 0, width * 0.045 * index, width * 0.016 * index).fill({
            color: index === 1 ? FX.coreColor : FX.magicColor,
            alpha: index === 1 ? 0.85 : 0.1
        })
    }
    core.blendMode = 'add'
    core.alpha = 0
    impact.addChild(core)
    timeline
        .set(core, { alpha: 1 }, arrival)
        .fromTo(core.scale, { x: 0.5, y: 0.5 }, { x: reducedMotion ? 1 : 1.5, y: reducedMotion ? 1 : 1.5, duration: 0.2, ease: 'power2.out' }, arrival)
        .to(core, { alpha: 0, duration: FX.impactDuration, ease: 'power2.out' }, arrival + 0.06)

    for (let index = 0; index < FX.impactWaves; index++) {
        const wave = new Graphics()
            .ellipse(0, 0, width * 0.38, width * 0.085)
            .stroke({ color: FX.magicColor, width: 12, alpha: 0.08 })
            .ellipse(0, 0, width * 0.38, width * 0.085)
            .stroke({ color: index === 0 ? FX.coreColor : FX.magicColor, width: 2.5, alpha: 0.85 })
        wave.alpha = 0
        wave.blendMode = 'add'
        impact.addChild(wave)
        const at = arrival + index * 0.09
        timeline
            .set(wave, { alpha: 1 }, at)
            .fromTo(
                wave.scale,
                { x: 0.15, y: 0.15 },
                { x: reducedMotion ? 0.8 : 1.2, y: reducedMotion ? 0.8 : 1.2, duration: FX.impactDuration, ease: 'power2.out' },
                at
            )
            .to(wave, { alpha: 0, duration: FX.impactDuration, ease: 'power1.in' }, at)
    }
    if (reducedMotion) return

    createCauldronCrown(impact, timeline, width, arrival)

    for (let index = 0; index < FX.impactParticles; index++) {
        const angle = (Math.PI * 2 * index) / FX.impactParticles
        const distance = width * (0.15 + (index % 3) * 0.055)
        const height = width * (0.12 + (index % 4) * 0.025)
        const mote = new Graphics().circle(0, 0, index % 3 === 0 ? 4 : 2.5).fill(index % 3 === 0 ? FX.coreColor : FX.magicColor)
        mote.alpha = 0
        mote.blendMode = 'add'
        impact.addChild(mote)
        const travel = { t: 0 }
        const at = arrival + (index % 3) * 0.025
        timeline
            .set(mote, { alpha: 1 }, at)
            .to(
                travel,
                {
                    t: 1,
                    duration: FX.impactDuration,
                    ease: 'none',
                    onUpdate() {
                        mote.position.set(
                            Math.cos(angle) * distance * travel.t,
                            Math.sin(angle) * distance * 0.25 * travel.t - Math.sin(Math.PI * travel.t) * height
                        )
                    }
                },
                at
            )
            .to(mote, { alpha: 0, duration: FX.impactDuration * 0.55 }, at + FX.impactDuration * 0.45)
    }
}
