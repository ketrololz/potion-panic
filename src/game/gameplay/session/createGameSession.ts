import { generateRecipe } from '../recipe/generateRecipe'
import { createRecipeProgress } from '../recipe/createRecipeProgress'
import { SESSION_RULES } from './constants/session.constants'
import type { SessionStatus } from './types/session.types'

export function createGameSession(availableIngredients: readonly string[]) {
    const ingredientIds = [...availableIngredients]

    let recipe = generateRecipe(ingredientIds, SESSION_RULES.recipeLength)

    let recipeProgress = createRecipeProgress(recipe)

    let score = 0
    let combo = 0
    let status: SessionStatus = 'playing'
    let remainingMs: number = SESSION_RULES.durationMs

    function startNewRecipe() {
        recipe = generateRecipe(ingredientIds, SESSION_RULES.recipeLength)

        recipeProgress = createRecipeProgress(recipe)
    }

    function getState() {
        return {
            ...recipeProgress.getProgress(),
            recipe: [...recipe],
            score,
            combo,
            status,
            remainingMs
        }
    }

    function selectIngredient(id: string) {
        if (status !== 'playing') {
            return {
                outcome: 'inactive' as const,
                state: getState()
            }
        }

        const outcome = recipeProgress.selectIngredient(id)

        if (outcome === 'wrong') {
            combo = 0
            recipeProgress.reset()
        }

        if (outcome === 'completed') {
            combo = Math.min(combo + 1, SESSION_RULES.maxCombo)
            score += SESSION_RULES.pointsPerRecipe * combo

            startNewRecipe()
        }

        return {
            outcome,
            state: getState()
        }
    }

    function update(deltaMs: number) {
        if (status !== 'playing' || deltaMs <= 0) return

        remainingMs = Math.max(0, remainingMs - deltaMs)

        if (remainingMs === 0) status = 'finished'
    }

    function pause() {
        if (status === 'playing') status = 'paused'
    }

    function resume() {
        if (status === 'paused') status = 'playing'
    }

    function restart() {
        startNewRecipe()

        score = 0
        combo = 0
        remainingMs = SESSION_RULES.durationMs
        status = 'playing'
    }

    return {
        selectIngredient,
        getState,
        update,
        pause,
        resume,
        restart
    }
}
