import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { createCauldron } from "../objects/cauldron/createCauldron";
import { createIngredientGroup } from "../objects/ingredients/ingredientGroup/createIngredientGroup";
import { createRecipePanel } from "../../ui/recipe/createRecipePanel";
import { createGameSession } from "../gameplay/session/createGameSession";
import { createScorePanel } from "../../ui/score/createScorePanel";
import { applyGameLayout } from "../layout/applyGameLayout";
import { createComboPanel } from "../../ui/combo/createComboPanel";
import { SESSION_RULES } from "../gameplay/session/constants/session.constants";
import { createTimerPanel } from "../../ui/timer/createTimerPanel";
import type { GameScene } from "./types/gameScene.types";
import { createPauseButton } from "../../ui/pause/createPauseButton";
import { createResultPanel } from "../../ui/result/createResultPanel";

export async function createGameScene(): Promise<GameScene> {
  const scene = new Container();

  const texture = await Assets.load("/assets/backgrounds/lab.webp");
  const background = new Sprite(texture);

  background.label = "debug_hide";

  const bounds = new Graphics()
    .rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    .fill(0xffffff);
  scene.addChild(background, bounds);

  scene.mask = bounds;

  const cauldron = await createCauldron();
  scene.addChild(cauldron);

  const recipe = ["flower", "pomegranate", "blueberry"];

  const session = createGameSession(recipe);

  const recipePanel = await createRecipePanel(recipe);
  scene.addChild(recipePanel.view);

  recipePanel.setProgress(session.getState().currentStep);

  const ingredients = await createIngredientGroup((id) => {
    session.selectIngredient(id);

    syncPanels();
  });
  scene.addChild(ingredients);

  const scorePanel = createScorePanel(session.getState().score);

  scorePanel.view.position.set(GAME_WIDTH / 2, 150);
  scene.addChild(scorePanel.view);

  const comboPanel = await createComboPanel(
    session.getState().combo,
    SESSION_RULES.maxCombo,
  );
  scene.addChild(comboPanel.view);

  const timerPanel = createTimerPanel(session.getState().remainingMs);
  scene.addChild(timerPanel.view);

  const pauseButton = createPauseButton(() => {
    const { status } = session.getState();

    if (status === "playing") {
      session.pause();
    } else if (status === "paused") {
      session.resume();
    }

    pauseButton.setPaused(session.getState().status === "paused");
  });

  scene.addChild(pauseButton.view);

  const resultPanel = createResultPanel({
    screenHeight: GAME_HEIGHT,
    screenWidth: GAME_WIDTH,
    onRestart: () => {
      session.restart();
      syncPanels();
      resultPanel.hide();
    },
  });

  scene.addChild(resultPanel.view);

  applyGameLayout({
    background,
    cauldron,
    ingredients,
    recipePanel: recipePanel.view,
    scorePanel: scorePanel.view,
    comboPanel: comboPanel.view,
    timerPanel: timerPanel.view,
    pauseButton: pauseButton.view,
    resultPanel: resultPanel.view,
  });

  function update(deltaMs: number) {
    session.update(deltaMs);

    const state = session.getState();
    const isPlaying = state.status === "playing";

    timerPanel.setTime(session.getState().remainingMs);

    ingredients.eventMode = isPlaying ? "passive" : "none";

    pauseButton.setEnabled(state.status !== "finished");

    if (state.status === "finished") resultPanel.show(state.score);
  }

  function syncPanels() {
    const state = session.getState();

    recipePanel.setProgress(state.currentStep);
    scorePanel.setScore(state.score);
    comboPanel.setCombo(state.combo);
    timerPanel.setTime(state.remainingMs);
    pauseButton.setPaused(state.status === "paused");
  }

  return {
    view: scene,
    update,
  };
}
