import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/config/config";

export async function createGameScene(): Promise<Container> {
  const scene = new Container();

  const texture = await Assets.load("/assets/backgrounds/lab.webp");

  const background = new Sprite(texture);

  background.anchor.set(0.5);
  background.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);

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

  return scene;
}
