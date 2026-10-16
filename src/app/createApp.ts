import { Application } from "pixi.js";
import { createGameScene } from "../game/scenes/createGameScene";
import { fitScene } from "../game/layout/fitScene";

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

  app.stage.addChild(scene);

  function resize() {
    fitScene(scene, app.screen.width, app.screen.height);
  }

  resize();

  app.renderer.on("resize", resize);

  return {
    destroy() {
      app.renderer.off("resize", resize);
      app.destroy(true, { children: true });
    },
  };
}
