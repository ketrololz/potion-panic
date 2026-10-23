import type { SelectionResult } from './types/result.types'

export function createRecipeProgress(recipe: readonly string[]) {
    if (recipe.length === 0) {
        throw new Error('Рецепт не может быть пустым')
    }

    const ingredients = [...recipe]

    let currentStep = 0

    function selectIngredient(id: string): SelectionResult {
        if (currentStep >= ingredients.length) {
            return 'inactive'
        }

        const expectedIngredient = ingredients[currentStep]

        if (id !== expectedIngredient) {
            return 'wrong'
        }

        currentStep += 1

        return currentStep === ingredients.length ? 'completed' : 'correct'
    }

    function getProgress() {
        return {
            currentStep,
            totalSteps: ingredients.length,
            isCompleted: currentStep === ingredients.length
        }
    }

    function reset() {
        currentStep = 0
    }

    return {
        selectIngredient,
        getProgress,
        reset
    }
}
