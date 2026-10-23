import type { Container, Sprite } from 'pixi.js'

export interface GameLayoutTargets {
    background: Sprite
    cauldron: Container
    ingredients: Container
    recipePanel: Container
    comboPanel: Container
    hud: Container
    pauseButton: Container
    resultPanel: Container
    pausePanel: Container
}
