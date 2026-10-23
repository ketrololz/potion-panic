import type { Scene } from "../../game/scenes/types/gameScene.types";

export type SceneFactory = () => Scene | Promise<Scene>;
