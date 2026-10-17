import { Assets, Container, Sprite } from "pixi.js";
import { cauldronLayout } from "./constants/cauldron.constants";

export async function createCauldron(): Promise<Container> {
  const cauldron = new Container();

  const texture = await Assets.load("/assets/cauldron/cauldron.webp");
  const liquidTexture = await Assets.load(
    "/assets/cauldron/liquid-turquoise.webp",
  );

  const body = new Sprite(texture);
  const liquid = new Sprite(liquidTexture);

  body.anchor.set(0.5, 1);

  liquid.anchor.set(0.5);

  liquid.width = body.width * cauldronLayout.liquid.widthRatio;
  liquid.height = body.height * cauldronLayout.liquid.heightRatio;
  liquid.position.set(
    0,
    -body.height * cauldronLayout.liquid.centerFromBottomRatio,
  );

  cauldron.addChild(body, liquid);

  return cauldron;
}
