import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { createCauldron } from "../objects/cauldron/createCauldron";
import { createIngredientGroup } from "../objects/ingredients/ingredientGroup/createIngredientGroup";
import { createRecipePanel } from "../../ui/recipe/createRecipePanel";
import { createGameSession } from "../gameplay/session/createGameSession";
import { createScorePanel } from "../../ui/score/createScorePanel";
import { applyGameLayout } from "../layout/applyGameLayout";
import { createComboPanel } from "../../ui/combo/createComboPanel";

export async function createGameScene(): Promise<Container> {
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
    const { state } = session.selectIngredient(id);

    recipePanel.setProgress(state.currentStep);
    scorePanel.setScore(state.score);
    comboPanel.setCombo(state.combo);
  });
  scene.addChild(ingredients);

  const scorePanel = createScorePanel(session.getState().score);

  scorePanel.view.position.set(GAME_WIDTH / 2, 150);
  scene.addChild(scorePanel.view);

  const comboPanel = createComboPanel(session.getState().combo);
  scene.addChild(comboPanel.view);

  applyGameLayout({
    background,
    cauldron,
    ingredients,
    recipePanel: recipePanel.view,
    scorePanel: scorePanel.view,
    comboPanel: comboPanel.view,
  });

  return scene;
}
