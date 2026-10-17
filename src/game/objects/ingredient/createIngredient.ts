import { Assets, Sprite } from "pixi.js";
import type { IngredientOptions } from "./types/ingredient.types";

export async function createIngredient(
  options: IngredientOptions,
): Promise<Sprite> {
  const texture = await Assets.load(options.textureUrl);

  const ingredient = new Sprite(texture);

  ingredient.anchor.set(0.5);

  const scale = options.size / Math.max(texture.width, texture.height);

  ingredient.scale.set(scale);

  ((ingredient.eventMode = "static"), (ingredient.cursor = "pointer"));

  ingredient.on("pointertap", () => {
    options.onSelect(options.id);
  });

  return ingredient;
}
