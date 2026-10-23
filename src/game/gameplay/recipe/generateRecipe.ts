export function generateRecipe(ingredientIds: readonly string[], length: number): string[] {
    const available = [...new Set(ingredientIds)]

    if (!Number.isInteger(length) || length < 1 || length > available.length) {
        throw new Error('Недопустимая длина рецепта')
    }

    const recipe: string[] = []

    while (recipe.length < length) {
        const index = Math.floor(Math.random() * available.length)
        const ingredient = available[index]

        recipe.push(ingredient)
        available.splice(index, 1)
    }

    return recipe
}
