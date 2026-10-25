import { Container, FillGradient, Graphics } from 'pixi.js'
import { COMBO_LAYOUT as L } from './constants/layout.constants'
import { COMBO_FX as FX } from './constants/effects.constants'

export function createComboFill(view: Container) {
    function gradient(colors: number[]) {
        return new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            textureSpace: 'local',
            colorStops: colors.map((color, index) => ({ offset: index / (colors.length - 1), color }))
        })
    }
    const gold = gradient([0xfff3ac, 0xffcf45, 0xffa016, 0xb94b0c])
    const red = gradient([0xffc48b, 0xff9446, 0xec5730, 0x8f291c])
    const base = new Graphics()
    const heat = new Graphics()
    const sheen = new Graphics()
    sheen.blendMode = 'add'
    view.addChild(base, heat, sheen)
    function draw(progress: number, warmth: number, sweep: number, showSheen: boolean) {
        const width = L.fillWidth * Math.max(0, Math.min(1, progress))
        view.visible = width > 0.1
        base.clear()
        heat.clear()
        sheen.clear()
        if (!view.visible) return
        const height = L.fillHeight
        const radius = Math.min(height / 2, width / 2)
        base.roundRect(0, -height / 2, width, height, radius).fill(gold)
        heat.roundRect(0, -height / 2, width, height, radius).fill(red)
        heat.alpha = warmth
        if (!showSheen) return
        const center = sweep * (width + FX.sheenWidth * 2) - FX.sheenWidth
        // Follow the rounded contour numerically; no graphics mask is needed.
        const step = 2
        for (let x = 0; x < width; x += step) {
            const stripWidth = Math.min(step, width - x)
            const strength = Math.exp(-Math.pow((x + stripWidth / 2 - center) / (FX.sheenWidth * 0.35), 2))
            if (strength < 0.01) continue
            const inset = Math.max(radius - x, x + stripWidth - (width - radius), 0)
            const halfHeight = height / 2 - radius + Math.sqrt(Math.max(0, radius * radius - inset * inset))
            sheen.rect(x, -halfHeight, stripWidth, halfHeight * 2).fill({ color: 0xfff4da, alpha: strength * FX.sheenAlpha })
        }
    }
    view.once('destroyed', () => {
        gold.destroy()
        red.destroy()
    })
    return { draw }
}
