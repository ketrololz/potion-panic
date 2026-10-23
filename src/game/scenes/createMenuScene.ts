import { Container, Graphics, Text } from "pixi.js";
import { MENU_LAYOUT as LAYOUT } from "./menu/constants/layout.constants";
import type { Scene } from "./types/gameScene.types";
import { GAME_WIDTH } from "../constants/config/config.constants";

export function createMenuScene(onStart: () => void): Scene {
  const view = new Container();

  const title = new Text({
    text: "Potion Panic",
    style: {
      fontFamily: LAYOUT.fontFamily,
      fontSize: LAYOUT.titleFontSize,
      fill: LAYOUT.textColor,
    },
  });

  title.anchor.set(0.5);
  title.position.set(GAME_WIDTH / 2, LAYOUT.titleY);

  const button = new Container();

  const background = new Graphics()
    .roundRect(
      -LAYOUT.buttonWidth / 2,
      -LAYOUT.buttonHeight / 2,
      LAYOUT.buttonWidth,
      LAYOUT.buttonHeight,
      LAYOUT.buttonRadius,
    )
    .fill(LAYOUT.buttonColor);

  const label = new Text({
    text: "СТАРТ",
    style: {
      fontFamily: LAYOUT.fontFamily,
      fontSize: LAYOUT.buttonFontSize,
      fill: LAYOUT.textColor,
    },
  });

  label.anchor.set(0.5);

  button.addChild(background, label);
  button.position.set(GAME_WIDTH / 2, LAYOUT.buttonY);
  button.eventMode = "static";
  button.cursor = "pointer";

  button.on("pointertap", onStart);

  view.addChild(title, button);

  return {
    view,
    destroy() {
      view.destroy({ children: true });
    },
  };
}
