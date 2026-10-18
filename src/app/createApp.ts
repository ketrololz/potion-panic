import { Application, Ticker } from "pixi.js";
import { createGameScene } from "../game/scenes/createGameScene";
import { fitScene } from "../game/layout/fitScene";
import { createDebugOverlay } from "../game/debug/createDebugOverlay";

export async function createApp(root: HTMLElement) {
  const app = new Application();

  await app.init({
    resizeTo: root,
    background: "#160d20",
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });

  root.appendChild(app.canvas);

  const scene = await createGameScene();

  app.stage.addChild(scene.view);

  function resize() {
    fitScene(scene.view, app.screen.width, app.screen.height);
  }

  resize();

  function update(ticker: Ticker) {
    scene.update(ticker.deltaMS);
  }

  app.ticker.add(update);

  let destroyDebug: (() => void) | undefined;

  if (import.meta.env.DEV) {
    const targets = scene.view.children.filter(
      (child) => child.label !== "debug_hide",
    );

    destroyDebug = createDebugOverlay(app, targets);
  }

  app.renderer.on("resize", resize);

  return {
    destroy() {
      destroyDebug?.();

      app.renderer.off("resize", resize);
      app.ticker.remove(update);
      app.destroy(true, { children: true });
    },
  };
}
