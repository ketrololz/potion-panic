import { prefersReducedMotion } from '../../shared/prefersReducedMotion'
import { Assets, Container, Sprite, Text, Texture } from 'pixi.js'
import { gsap } from 'gsap'
import { RECIPE_FOCUS } from './constants/effects.constants'
import { RECIPE_LAYOUT } from './constants/layout.constants'
import { createRecipeFocus } from './createRecipeFocus'
import { INGREDIENTS } from '../../game/objects/ingredients/constants/ingredients.constants'

export async function createRecipePanel(recipe: readonly string[]) {
    const view = new Container()

    view.eventMode = 'none'
    const reducedMotion = prefersReducedMotion()

    const panelTexture = await Assets.load('/assets/ui/recipe/recipe-panel.webp')

    const panel = new Sprite(panelTexture)

    panel.anchor.set(0.5)
    panel.scale.set(RECIPE_LAYOUT.panelWidth / panelTexture.width)

    view.addChild(panel)

    const textPanelTexture = await Assets.load('/assets/ui/recipe/text-panel.webp')

    const textPanel = new Sprite(textPanelTexture)

    textPanel.anchor.set(0.5)
    textPanel.scale.set(RECIPE_LAYOUT.textPanel.width / textPanelTexture.width)
    textPanel.position.set(0, RECIPE_LAYOUT.textPanel.y)

    view.addChild(textPanel)

    const title = new Text({
        text: RECIPE_LAYOUT.title.text,
        style: {
            fontFamily: RECIPE_LAYOUT.fontFamily,
            fontSize: RECIPE_LAYOUT.title.fontSize,
            fill: RECIPE_LAYOUT.textColor
        }
    })

    title.anchor.set(0.5)
    title.position.set(0, RECIPE_LAYOUT.title.y)

    view.addChild(title)

    const loadedIngredients = await Promise.all(
        INGREDIENTS.map(async ({ id, textureUrl }) => {
            const texture = await Assets.load(textureUrl)

            return [id, texture] as const
        })
    )

    const textures = new Map<string, Texture>(loadedIngredients)

    const items = recipe.map((_, index) => {
        const icon = new Sprite()

        icon.anchor.set(0.5)

        const arrow =
            index < recipe.length - 1
                ? new Text({
                      text: RECIPE_LAYOUT.arrow.text,
                      style: {
                          fontFamily: RECIPE_LAYOUT.fontFamily,
                          fontSize: RECIPE_LAYOUT.arrow.fontSize,
                          fill: RECIPE_LAYOUT.textColor
                      }
                  })
                : undefined

        arrow?.anchor.set(0.5)

        const visual = new Container()
        visual.addChild(icon)

        return { icon, arrow, visual, active: false, scaleTween: undefined as gsap.core.Tween | undefined }
    })

    const rowWidth = (items.length - 1) * RECIPE_LAYOUT.iconStep

    const focus = createRecipeFocus()
    view.addChild(focus.view)

    items.forEach(({ visual, arrow }, index) => {
        const x = index * RECIPE_LAYOUT.iconStep - rowWidth / 2

        visual.position.set(x, RECIPE_LAYOUT.rowY)

        if (arrow) {
            arrow.position.set(x + RECIPE_LAYOUT.iconStep / 2, RECIPE_LAYOUT.rowY)
            view.addChild(arrow)
        }

        view.addChild(visual)
    })

    function setProgress(currentStep: number) {
        items.forEach((item, index) => {
            item.icon.alpha = index < currentStep ? RECIPE_LAYOUT.completedAlpha : 1

            const active = index === currentStep
            if (item.active === active) return

            item.active = active
            item.scaleTween?.kill()
            const scale = active ? RECIPE_FOCUS.activeIconScale : 1
            item.scaleTween = gsap.to(item.visual.scale, {
                x: scale,
                y: scale,
                duration: reducedMotion ? 0 : RECIPE_FOCUS.iconScaleDuration,
                ease: 'power2.out'
            })
        })

        const activeItem = items[currentStep]
        if (activeItem) {
            focus.setPosition(activeItem.visual.x, activeItem.visual.y)
        } else {
            focus.hide()
        }
    }

    let currentRecipe: readonly string[] = []

    function setRecipe(nextRecipe: readonly string[]) {
        if (nextRecipe.length !== items.length) {
            throw new Error(`Панель рассчитана на ${items.length} ингредиента`)
        }

        const isSameRecipe = nextRecipe.every((id, index) => id === currentRecipe[index])

        if (isSameRecipe) return

        const nextTextures = nextRecipe.map((id) => {
            const texture = textures.get(id)

            if (!texture) {
                throw new Error(`Неизвестный ингредиент: ${id}`)
            }

            return texture
        })

        nextTextures.forEach((texture, index) => {
            const { icon } = items[index]

            icon.texture = texture

            icon.scale.set(RECIPE_LAYOUT.iconSize / Math.max(texture.width, texture.height))
        })

        currentRecipe = [...nextRecipe]
    }

    view.once('destroyed', () => {
        items.forEach((item) => item.scaleTween?.kill())
    })

    setRecipe(recipe)
    setProgress(0)

    return { view, setProgress, setRecipe }
}
