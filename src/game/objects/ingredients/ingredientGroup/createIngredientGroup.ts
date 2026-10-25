import { prefersReducedMotion } from '../../../../shared/prefersReducedMotion'
import { Container } from 'pixi.js'
import { gsap } from 'gsap'
import { INGREDIENTS } from '../constants/ingredients.constants'
import { createIngredient } from '../ingredient/createIngredient'
import { GROUP_LAYOUT, GROUP_SHUFFLE } from './constants/group.constants'
import { shuffleOrder } from './shuffleOrder'

export async function createIngredientGroup(onSelect: (id: string) => void) {
    const view = new Container()
    const reducedMotion = prefersReducedMotion()
    let enabled = true
    let shuffling = false
    let movement: gsap.core.Timeline | undefined

    const ingredients = await Promise.all(
        INGREDIENTS.map((item) =>
            createIngredient({
                ...item,
                size: GROUP_LAYOUT.itemSize,
                onSelect(id) {
                    if (enabled && !shuffling) onSelect(id)
                }
            })
        )
    )
    let order = [...ingredients]

    function positionFor(index: number) {
        return {
            x: (index % GROUP_LAYOUT.columns) * GROUP_LAYOUT.columnStep,
            y: Math.floor(index / GROUP_LAYOUT.columns) * GROUP_LAYOUT.rowStep
        }
    }

    ingredients.forEach((item, index) => {
        const { x, y } = positionFor(index)
        item.position.set(x, y)
        view.addChild(item)
    })

    const columns = Math.min(GROUP_LAYOUT.columns, ingredients.length)
    const rows = Math.ceil(ingredients.length / GROUP_LAYOUT.columns)
    view.pivot.set(((columns - 1) * GROUP_LAYOUT.columnStep) / 2, ((rows - 1) * GROUP_LAYOUT.rowStep) / 2)

    function syncInteraction() {
        view.eventMode = enabled && !shuffling ? 'passive' : 'none'
    }

    function shuffle() {
        if (shuffling || !enabled || ingredients.length < 2) return

        order = shuffleOrder(order)
        if (reducedMotion) {
            order.forEach((item, index) => {
                const { x, y } = positionFor(index)
                item.position.set(x, y)
            })
            return true
        }

        shuffling = true
        syncInteraction()
        movement = gsap.timeline({
            onComplete() {
                shuffling = false
                syncInteraction()
            }
        })
        order.forEach((item, index) => {
            movement!.to(
                item,
                {
                    ...positionFor(index),
                    duration: GROUP_SHUFFLE.duration,
                    ease: 'power2.inOut'
                },
                index * GROUP_SHUFFLE.stagger
            )
        })
        return true
    }

    function setEnabled(value: boolean) {
        if (enabled === value) return
        enabled = value
        movement?.paused(!enabled)
        syncInteraction()
    }

    function reset() {
        movement?.kill()
        movement = undefined
        shuffling = false
        order = [...ingredients]
        order.forEach((item, index) => {
            const { x, y } = positionFor(index)
            item.position.set(x, y)
        })
        syncInteraction()
    }

    view.once('destroyed', () => movement?.kill())
    syncInteraction()

    function getIngredientPosition(id: string, relativeTo: Container) {
        const index = INGREDIENTS.findIndex((item) => item.id === id)
        const ingredient = ingredients[index]
        if (!ingredient) throw new Error(`Неизвестный ингредиент: ${id}`)

        return relativeTo.toLocal(ingredient.children[0].getGlobalPosition())
    }

    return { view, shuffle, setEnabled, reset, getIngredientPosition }
}
