import { Container } from 'pixi.js'
import { INGREDIENTS } from '../constants/ingredinents.constants'
import { createIngredient } from '../ingredient/createIngredient'
import { GROUP_LAYOT } from './constants/group.constants'

export async function createIngredientGroup(onSelect: (id: string) => void): Promise<Container> {
    const group = new Container()

    const ingredients = await Promise.all(INGREDIENTS.map((item) => createIngredient({ ...item, size: GROUP_LAYOT.itemSize, onSelect })))

    ingredients.forEach((item, index) => {
        const column = index % GROUP_LAYOT.columns
        const row = Math.floor(index / GROUP_LAYOT.columns)

        item.position.set(column * GROUP_LAYOT.columnStep, row * GROUP_LAYOT.rowStep)

        group.addChild(item)
    })

    const bounds = group.getLocalBounds()

    group.pivot.set(bounds.x + bounds.width / 2, bounds.x + bounds.height / 2)

    return group
}
