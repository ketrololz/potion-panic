import { Container, Graphics } from 'pixi.js'
import { SELECTION_FX as FX } from './constants/selection.constants'

export function createCauldronCrown(impact: Container, timeline: gsap.core.Timeline, width: number, arrival: number) {
    for (let index = 0; index < FX.crownDrops; index++) {
        const spread = (index / (FX.crownDrops - 1)) * 2 - 1
        const height = width * FX.crownHeightRatio * (1 - Math.abs(spread) * 0.4)
        const radius = width * FX.crownDropRatio
        const drop = new Graphics()
            .ellipse(0, 0, radius * 3, radius * 6)
            .fill({ color: FX.magicColor, alpha: 0.06 })
            .ellipse(0, 0, radius, radius * 2.6)
            .fill({ color: FX.magicColor, alpha: 0.8 })
            .ellipse(0, -radius, radius * 0.4, radius * 1.2)
            .fill(FX.coreColor)
        drop.blendMode = 'add'
        drop.alpha = 0
        impact.addChild(drop)
        const flight = { t: 0 }
        const at = arrival + (index % 3) * 0.02
        timeline
            .set(drop, { alpha: 1 }, at)
            .to(
                flight,
                {
                    t: 1,
                    duration: FX.crownDuration,
                    ease: 'none',
                    onUpdate() {
                        drop.position.set(spread * width * FX.crownWidthRatio * flight.t, -4 * height * flight.t * (1 - flight.t))
                        drop.rotation = Math.atan2(spread * width * FX.crownWidthRatio, 4 * height * (1 - 2 * flight.t))
                    }
                },
                at
            )
            .to(drop.scale, { x: 0.35, y: 0.35, duration: FX.crownDuration, ease: 'power1.in' }, at)
            .to(drop, { alpha: 0, duration: FX.crownDuration * 0.45 }, at + FX.crownDuration * 0.55)
    }
}
