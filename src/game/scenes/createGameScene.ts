import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { createCauldron } from "../objects/cauldron/createCauldron";
import { CAULDRON_LAYOUT } from "../objects/cauldron/constants/cauldron.constants";
import { createIngredientGroup } from "../objects/ingredients/ingredientGroup/createIngredientGroup";
import { GROUP_LAYOT } from "../objects/ingredients/ingredientGroup/constants/group.constants";

export async function createGameScene(): Promise<Container> {
  const scene = new Container();

  //background

  const texture = await Assets.load("/assets/backgrounds/lab.webp");

  const background = new Sprite(texture);

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

  cauldron.label = "cauldron";

  const cauldronWidth = GAME_WIDTH * CAULDRON_LAYOUT.cauldron.widthRatio;
  cauldron.scale.set(cauldronWidth / cauldron.width);
  cauldron.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT - GAME_HEIGHT * CAULDRON_LAYOUT.cauldron.centerFromBottomRatio,
  );

  scene.addChild(cauldron);

  //ingredients

  const ingredients = await createIngredientGroup((id) => {
    console.log("Тыкнут:", id);
  });

  ingredients.label = "ingredients";

  ingredients.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT * GROUP_LAYOT.centerFromBottonRation,
  );

  scene.addChild(ingredients);

  return scene;
}
