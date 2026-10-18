import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { createCauldron } from "../objects/cauldron/createCauldron";
import { CAULDRON_LAYOUT } from "../objects/cauldron/constants/cauldron.constants";
import { createIngredientGroup } from "../objects/ingredients/ingredientGroup/createIngredientGroup";
import { GROUP_LAYOT } from "../objects/ingredients/ingredientGroup/constants/group.constants";
import { createRecipePanel } from "../../ui/recipe/createRecipePanel";
import { RECIPE_LAYOUT } from "../../ui/recipe/constants/layout.constants";
import { createGameSession } from "../gameplay/session/createGameSession";

export async function createGameScene(): Promise<Container> {
  const scene = new Container();

  //background

  const texture = await Assets.load("/assets/backgrounds/lab.webp");

  const background = new Sprite(texture);

  background.label = "debug_hide";

  background.anchor.set(0.5);
  background.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);

  //general

  const scale = Math.max(
    GAME_WIDTH / texture.width,
    GAME_HEIGHT / texture.height,
  );

  background.scale.set(scale);

  const bounds = new Graphics()
    .rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    .fill(0xffffff);

  scene.addChild(background, bounds);

  scene.mask = bounds;

  //cauldron

  const cauldron = await createCauldron();

  const cauldronWidth = GAME_WIDTH * CAULDRON_LAYOUT.cauldron.widthRatio;
  cauldron.scale.set(cauldronWidth / cauldron.width);
  cauldron.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT - GAME_HEIGHT * CAULDRON_LAYOUT.cauldron.centerFromBottomRatio,
  );

  scene.addChild(cauldron);

  //ingredients

  const recipe = ["flower", "pomegranate", "blueberry"];

  const session = createGameSession(recipe);
  const recipePanel = await createRecipePanel(recipe);

  recipePanel.setProgress(session.getState().currentStep);

  const ingredients = await createIngredientGroup((id) => {
    const { state } = session.selectIngredient(id);

    recipePanel.setProgress(state.currentStep);
  });

  ingredients.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT * GROUP_LAYOT.centerFromTopRation,
  );

  scene.addChild(ingredients);

  //recipe

  recipePanel.view.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT * RECIPE_LAYOUT.centerFromTopRation,
  );

  scene.addChild(recipePanel.view);

  return scene;
}
