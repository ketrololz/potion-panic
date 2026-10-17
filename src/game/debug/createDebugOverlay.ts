import { Graphics } from "pixi.js";
import type { Application, Container } from "pixi.js";

const DEBUG_STYLE = {
  boundsColor: 0x00ffff,
  pivotColor: 0xff4444,
  lineWidth: 2,
  crossSize: 6,
};

export function createDebugOverlay(
  app: Application,
  targets: Container[],
): () => void {
  const overlay = new Graphics();

  overlay.eventMode = "none";

  app.stage.addChild(overlay);

  function update() {
    overlay.clear();

    for (const target of targets) {
      const bounds = target.getBounds();

      overlay.rect(bounds.x, bounds.y, bounds.width, bounds.height).stroke({
        color: DEBUG_STYLE.boundsColor,
        width: DEBUG_STYLE.lineWidth,
      });

      const point = target.toGlobal(target.pivot);
      const size = DEBUG_STYLE.crossSize;

      overlay
        .moveTo(point.x - size, point.y)
        .lineTo(point.x + size, point.y)
        .moveTo(point.x, point.y - size)
        .lineTo(point.x, point.y + size)
        .stroke({
          color: DEBUG_STYLE.pivotColor,
          width: DEBUG_STYLE.lineWidth,
        });
    }
  }

  update();
  app.ticker.add(update);

  return () => {
    app.ticker.remove(update);
    overlay.destroy();
  };
}
