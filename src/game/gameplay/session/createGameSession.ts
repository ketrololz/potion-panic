import { createRecipeProgress } from "../recipe/createRecipeProgress";
import { SESSION_RULES } from "./constants/session.constants";

export function createGameSession(recipe: readonly string[]) {
  const recipeProgress = createRecipeProgress(recipe);

  let score = 0;

  function getState() {
    return {
      ...recipeProgress.getProgress(),
      score,
    };
  }

  function selectIngredient(id: string) {
    const outcome = recipeProgress.selectIngredient(id);

    if (outcome === "wrong") recipeProgress.reset();

    if (outcome === "completed") {
      score += SESSION_RULES.pointsPerRecipe;
      recipeProgress.reset();
    }

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
