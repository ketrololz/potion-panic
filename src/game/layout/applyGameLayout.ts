import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { GAME_LAYOUT } from "./constants/gameLayout.constants";
import type { GameLayoutTargets } from "./types/gameLayout.types";

export function applyGameLayout({
  background,
  cauldron,
  ingredients,
  recipePanel,
  scorePanel,
  comboPanel,
  timerPanel,
  pauseButton,
}: GameLayoutTargets): void {
  const centerX = GAME_WIDTH / 2;

  const backgroundScale = Math.max(
    GAME_WIDTH / background.texture.width,
    GAME_HEIGHT / background.texture.height,
  );

  background.anchor.set(0.5);
  background.scale.set(backgroundScale);
  background.position.set(centerX, GAME_HEIGHT / 2);

  const cauldronWidth = GAME_WIDTH * GAME_LAYOUT.cauldron.widthRatio;

  const cauldronBounds = cauldron.getLocalBounds();

  cauldron.scale.set(cauldronWidth / cauldronBounds.width);

  cauldron.position.set(
    centerX,
    GAME_HEIGHT * (1 - GAME_LAYOUT.cauldron.bottomOffsetRatio),
  );

  ingredients.position.set(
    centerX,
    GAME_HEIGHT * GAME_LAYOUT.ingredients.centerYRatio,
  );

  recipePanel.position.set(
    centerX,
    GAME_HEIGHT * GAME_LAYOUT.recipe.centerYRatio,
  );

  comboPanel.position.set(
    centerX,
    GAME_HEIGHT - GAME_LAYOUT.combo.bottomOffset,
  );

  scorePanel.position.set(
    GAME_WIDTH * GAME_LAYOUT.score.centerXRatio,
    GAME_LAYOUT.score.centerY,
  );

  timerPanel.position.set(
    GAME_WIDTH * GAME_LAYOUT.timer.centerXRatio,
    GAME_LAYOUT.timer.centerY,
  );

  pauseButton.position.set(
    GAME_WIDTH * GAME_LAYOUT.pause.centerXRatio,
    GAME_LAYOUT.pause.centerY,
  );
}
