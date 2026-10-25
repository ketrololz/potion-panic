import { Container, Graphics } from 'pixi.js'
import { RESULT_FX as FX } from './constants/effects.constants'

export function createRecordSparkles(parent: Container, width: number, height: number) {
    const view = new Container()
    view.eventMode = 'none'
    parent.addChild(view)
    const flash = new Graphics().rect(-width / 2, -height / 2, width, height).fill(FX.goldColor)
    flash.blendMode = 'add'
    view.addChild(flash)
    const sparks = Array.from({ length: FX.recordSparkCount }, (_, index) => {
        const spark = new Graphics()
        const radius = index % 5 === 0 ? 15 : 7
        const color = index % 3 ? FX.goldColor : FX.magicColor
        for (let layer = 4; layer >= 1; layer--) {
            spark.circle(0, 0, radius * layer * 0.7).fill({ color, alpha: 0.025 })
        }
        spark
            .star(0, 0, 4, radius, radius * 0.14)
            .fill({ color, alpha: 0.85 })
            .circle(0, 0, 1.5)
            .fill(0xfff4db)
        spark.blendMode = 'add'
        view.addChild(spark)
        return spark
    })
    function reset() {
        view.visible = false
        flash.alpha = 0
        sparks.forEach((spark) => {
            spark.alpha = 0
        })
    }
    function play(timeline: gsap.core.Timeline) {
        reset()
        view.visible = true
        timeline.to(flash, { alpha: FX.recordFlashAlpha, duration: 0.18, ease: 'sine.out' }, 0).to(flash, { alpha: 0, duration: 0.9, ease: 'sine.out' }, 0.18)
        sparks.forEach((spark, index) => {
            // Distribute across the entire scene, including its top and bottom edges.
            const x = (((index * 0.618034) % 1) - 0.5) * width * 0.94
            const y = (((index * 0.754878 + 0.17) % 1) - 0.5) * height * 0.94
            const overPanel = Math.abs(x) < width * 0.36 && Math.abs(y) < 340
            const at = ((index % 17) / 17) * FX.recordSparkStagger
            spark.position.set(x, y)
            spark.rotation = index * 0.7
            spark.scale.set(0.1)
            timeline
                .to(spark, { alpha: overPanel ? 0.3 : 1, duration: 0.2, ease: 'sine.out' }, at)
                .to(spark.scale, { x: 1, y: 1, duration: 0.35, ease: 'back.out(1.5)' }, at)
                .to(spark, { y: y - 70, rotation: spark.rotation + 0.5, duration: FX.recordSparkDuration, ease: 'sine.out' }, at)
                .to(spark, { alpha: 0, duration: FX.recordSparkDuration * 0.6 }, at + FX.recordSparkDuration * 0.4)
                .to(spark.scale, { x: 0.15, y: 0.15, duration: FX.recordSparkDuration * 0.6 }, at + FX.recordSparkDuration * 0.4)
        })
    }
    reset()
    return { play, reset }
}
