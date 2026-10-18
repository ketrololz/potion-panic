import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { COMBO_LAYOUT, COMBO_STYLE } from "./constants/layout.constants";

export async function createComboPanel(initialCombo: number, maxCombo: number) {
  if (maxCombo <= 0) {
    throw new Error("Максимальное комбо должно быть больше нуля");
  }

  const view = new Container();

  view.eventMode = "none";

  const [trackTexture, fillTexture, flameTexture] = await Promise.all([
    Assets.load("/assets/ui/combo/combo-frame.webp"),
    Assets.load("/assets/ui/combo/combo-section.webp"),
    Assets.load("/assets/ui/combo/combo-icon.webp"),
  ]);

  const track = new Sprite(trackTexture);
  track.anchor.set(0.5);
  track.width = COMBO_LAYOUT.trackWidth;
  track.height = COMBO_LAYOUT.trackHeight;

  const fill = new Sprite(fillTexture);
  fill.anchor.set(0.5);
  fill.width = COMBO_LAYOUT.fillWidth;
  fill.scale.set(COMBO_LAYOUT.fillWidth / fillTexture.width);
  fill.scale.y *= COMBO_LAYOUT.fillHeightScale;

  const fillMask = new Graphics();

  const flame = new Sprite(flameTexture);
  flame.anchor.set(0.5);
  flame.scale.set(
    COMBO_LAYOUT.flameSize / Math.max(flameTexture.width, flameTexture.height),
  );
  flame.position.set(COMBO_LAYOUT.flameX, COMBO_LAYOUT.flameY);

  const title = new Text({
    text: "",
    style: COMBO_STYLE,
  });

  title.anchor.set(0.5);
  title.position.set(COMBO_LAYOUT.titleX, COMBO_LAYOUT.titleY);

  view.addChild(track, fill, fillMask, flame, title);

  fill.mask = fillMask;

  function setCombo(combo: number) {
    const progress = Math.max(0, Math.min(combo / maxCombo, 1));

    title.text = `КОМБО ×${combo}`;
    title.visible = combo > 0;
    flame.visible = combo > 0;
    fill.visible = progress > 0;

    fillMask.clear();

    if (progress > 0) {
      fillMask
        .rect(
          -COMBO_LAYOUT.fillWidth / 2,
          -COMBO_LAYOUT.fillHeight / 2,
          COMBO_LAYOUT.fillWidth * progress,
          COMBO_LAYOUT.fillHeight,
        )
        .fill(0xffffff);
    }
  }

  setCombo(initialCombo);

  return {
    view,
    setCombo,
  };
}
