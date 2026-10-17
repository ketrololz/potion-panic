import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { RECIPE_LAYOUT } from "./constants/layout.constants";
import { INGREDIENTS } from "../../game/objects/ingredients/constants/ingredinents.constants";

export async function createRecipePanel(recipe: readonly string[]) {
  const view = new Container();

  view.eventMode = "none";

  const panelTexture = await Assets.load("/assets/ui/recipe/recipe-panel.webp");

  const panel = new Sprite(panelTexture);

  panel.anchor.set(0.5);
  panel.scale.set(RECIPE_LAYOUT.panelWidth / panelTexture.width);

  view.addChild(panel);

  const items = await Promise.all(
    recipe.map(async (id) => {
      const definition = INGREDIENTS.find((item) => item.id === id);

      if (!definition) {
        throw new Error(`Неизвестный ингредиент: ${id}`);
      }

      const texture = await Assets.load(definition.textureUrl);
      const icon = new Sprite(texture);

      icon.anchor.set(0.5);
      icon.scale.set(
        RECIPE_LAYOUT.iconSize / Math.max(texture.width, texture.height),
      );

      const highlight = new Graphics()
        .circle(0, 0, RECIPE_LAYOUT.highlightRadius)
        .stroke({
          color: RECIPE_LAYOUT.highlightColor,
          width: RECIPE_LAYOUT.highlightWidth,
        });

      return { icon, highlight };
    }),
  );

  const rowWidth = (items.length - 1) * RECIPE_LAYOUT.iconStep;

  items.forEach(({ icon, highlight }, index) => {
    const x = index * RECIPE_LAYOUT.iconStep - rowWidth / 2;

    icon.position.set(x, RECIPE_LAYOUT.rowY);
    highlight.position.set(x, RECIPE_LAYOUT.rowY);

    view.addChild(highlight, icon);
  });

  function setProgress(currentStep: number) {
    items.forEach(({ icon, highlight }, index) => {
      highlight.visible = index === currentStep;

      icon.alpha = index < currentStep ? RECIPE_LAYOUT.completedAlpha : 1;
    });
  }

  setProgress(0);

  return { view, setProgress };
}
