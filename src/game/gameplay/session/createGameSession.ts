import { createRecipeProgress } from "../recipe/createRecipeProgress";
import { SESSION_RULES } from "./constants/session.constants";

export function createGameSession(recipe: readonly string[]) {
  const recipeProgress = createRecipeProgress(recipe);

  let score = 0;
  let combo = 0;

  function getState() {
    return {
      ...recipeProgress.getProgress(),
      score,
      combo,
    };
  }

  function selectIngredient(id: string) {
    const outcome = recipeProgress.selectIngredient(id);

    if (outcome === "wrong") {
      combo = 0;
      recipeProgress.reset();
    }

    if (outcome === "completed") {
      score += SESSION_RULES.pointsPerRecipe;

      if (combo < SESSION_RULES.maxCombo) combo += 1;

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
