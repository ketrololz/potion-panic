import { createRecipeProgress } from "../recipe/createRecipeProgress";

export function createGameSession(recipe: readonly string[]) {
  const recipeProgress = createRecipeProgress(recipe);

  function getState() {
    return recipeProgress.getProgress();
  }

  function selectIngredient(id: string) {
    const outcome = recipeProgress.selectIngredient(id);

    if (outcome === "wrong" || outcome === "completed") recipeProgress.reset();

    return {
      outcome,
      state: getState(),
    };
  }

  return {
    selectIngredient,
    getState,
  };
}
