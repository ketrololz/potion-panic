import { createRecipeProgress } from "../recipe/createRecipeProgress";
import { SESSION_RULES } from "./constants/session.constants";
import type { SessionStatus } from "./types/session.types";

export function createGameSession(recipe: readonly string[]) {
  const recipeProgress = createRecipeProgress(recipe);

  let score = 0;
  let combo = 0;
  let status: SessionStatus = "playing";
  let remainingMs: number = SESSION_RULES.durationMs;

  function getState() {
    return {
      ...recipeProgress.getProgress(),
      score,
      combo,
      status,
      remainingMs,
    };
  }

  function selectIngredient(id: string) {
    if (status !== "playing") {
      return {
        outcome: "inactive" as const,
        state: getState(),
      };
    }

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

  function update(deltaMs: number) {
    if (status !== "playing" || deltaMs <= 0) return;

    remainingMs = Math.max(0, remainingMs - deltaMs);

    if (remainingMs === 0) status = "finished";
  }

  function pause() {
    if (status === "playing") status = "paused";
  }

  function resume() {
    if (status === "paused") status = "playing";
  }

  return {
    selectIngredient,
    getState,
    update,
    pause,
    resume,
  };
}
