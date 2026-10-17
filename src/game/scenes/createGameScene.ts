import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config.constants";
import { createCauldron } from "../objects/cauldron/createCauldron";
import { cauldronLayout } from "../objects/cauldron/constants/cauldron.constants";
import { createIngredient } from "../objects/ingredient/createIngredient";

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

  const cauldronWidth = GAME_WIDTH * cauldronLayout.cauldron.widthRatio;
  cauldron.scale.set(cauldronWidth / cauldron.width);
  cauldron.position.set(
    GAME_WIDTH / 2,
    GAME_HEIGHT - GAME_HEIGHT * cauldronLayout.cauldron.centerFromBottomRatio,
  );

  scene.addChild(cauldron);

  //flower

  const flower = await createIngredient({
    id: "flower",
    textureUrl: "/assets/ingredients/flower.webp",
    size: 200,
    onSelect: (id) => {
      console.log("Тыкнут:", id);
    },
  });

  flower.position.set(540, 760);

  scene.addChild(flower);

  return scene;
}
