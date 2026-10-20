import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";
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

  const textPanelTexture = await Assets.load(
    "/assets/ui/recipe/text-panel.webp",
  );

  const textPanel = new Sprite(textPanelTexture);

  textPanel.anchor.set(0.5);
  textPanel.scale.set(RECIPE_LAYOUT.textPanel.width / textPanelTexture.width);
  textPanel.position.set(0, RECIPE_LAYOUT.textPanel.y);

  view.addChild(textPanel);

  const title = new Text({
    text: RECIPE_LAYOUT.title.text,
    style: {
      fontFamily: RECIPE_LAYOUT.fontFamily,
      fontSize: RECIPE_LAYOUT.title.fontSize,
      fill: RECIPE_LAYOUT.textColor,
    },
  });

  title.anchor.set(0.5);
  title.position.set(0, RECIPE_LAYOUT.title.y);

  view.addChild(title);

  const loadedIngredients = await Promise.all(
    INGREDIENTS.map(async ({ id, textureUrl }) => {
      const texture = await Assets.load(textureUrl);

      return [id, texture] as const;
    }),
  );

  const textures = new Map<string, Texture>(loadedIngredients);

  const items = recipe.map(() => {
    const icon = new Sprite();

    icon.anchor.set(0.5);

    const highlight = new Graphics()
      .circle(0, 0, RECIPE_LAYOUT.highlightRadius)
      .stroke({
        color: RECIPE_LAYOUT.highlightColor,
        width: RECIPE_LAYOUT.highlightWidth,
      });

    const arrow = new Text({
      text: RECIPE_LAYOUT.arrow.text,
      style: {
        fontFamily: RECIPE_LAYOUT.fontFamily,
        fontSize: RECIPE_LAYOUT.arrow.fontSize,
        fill: RECIPE_LAYOUT.textColor,
      },
    });

    arrow.anchor.set(0.5);

    return { icon, highlight, arrow };
  });

  const rowWidth = (items.length - 1) * RECIPE_LAYOUT.iconStep;

  items.forEach(({ icon, highlight, arrow }, index) => {
    const x = index * RECIPE_LAYOUT.iconStep - rowWidth / 2;

    icon.position.set(x, RECIPE_LAYOUT.rowY);
    highlight.position.set(x, RECIPE_LAYOUT.rowY);

    if (index < items.length - 1) {
      arrow.position.set(x + RECIPE_LAYOUT.iconStep / 2, RECIPE_LAYOUT.rowY);
      view.addChild(arrow);
    }

    view.addChild(highlight, icon);
  });

  function setProgress(currentStep: number) {
    items.forEach(({ icon, highlight }, index) => {
      highlight.visible = index === currentStep;

      icon.alpha = index < currentStep ? RECIPE_LAYOUT.completedAlpha : 1;
    });
  }

  let currentRecipe: readonly string[] = [];

  function setRecipe(nextRecipe: readonly string[]) {
    if (nextRecipe.length !== items.length) {
      throw new Error(`Панель рассчитана на ${items.length} ингредиента`);
    }

    const isSameRecipe = nextRecipe.every(
      (id, index) => id === currentRecipe[index],
    );

    if (isSameRecipe) return;

    const nextTextures = nextRecipe.map((id) => {
      const texture = textures.get(id);

      if (!texture) {
        throw new Error(`Неизвестный ингредиент: ${id}`);
      }

      return texture;
    });

    nextTextures.forEach((texture, index) => {
      const { icon } = items[index];

      icon.texture = texture;

      icon.scale.set(
        RECIPE_LAYOUT.iconSize / Math.max(texture.width, texture.height),
      );
    });

    currentRecipe = [...nextRecipe];
  }

  setRecipe(recipe);
  setProgress(0);

  return { view, setProgress, setRecipe };
}
