import { Assets, Container, Rectangle, Sprite } from 'pixi.js'
import type { IngredientOptions } from './types/ingredient.types'
import { createIngredientEffects } from './createIngredientEffects'

export async function createIngredient(options: IngredientOptions): Promise<Container> {
    const texture = await Assets.load(options.textureUrl)
    const view = new Container()
    const floating = new Container()
    const visual = new Container()
    const icon = new Sprite(texture)

    icon.anchor.set(0.5)
    icon.scale.set(options.size / Math.max(texture.width, texture.height))

    visual.addChild(icon)
    floating.addChild(visual)
    floating.eventMode = 'none'
    view.addChild(floating)

    // Keep the click target stable while the image floats and reacts to presses.
    view.hitArea = new Rectangle(-options.size / 2, -options.size / 2, options.size, options.size)
    view.eventMode = 'static'
    view.cursor = 'pointer'

    createIngredientEffects({ view, floating, visual, size: options.size, id: options.id })

    view.on('pointertap', () => {
        options.onSelect(options.id)
    })

    return view
}
