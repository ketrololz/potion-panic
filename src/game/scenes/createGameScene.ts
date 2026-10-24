import { createCauldronFire } from '../objects/cauldron/createCauldronFire'
import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import { createScreenShake } from '../effects/shake/createScreenShake'
import { createSelectionEffects } from '../effects/selection/createSelectionEffects'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/config/config.constants'
import { createBrewingEffects } from '../objects/cauldron/createBrewingEffects'
import { createCauldron } from '../objects/cauldron/createCauldron'
import { createIngredientGroup } from '../objects/ingredients/ingredientGroup/createIngredientGroup'
import { createRecipePanel } from '../../ui/recipe/createRecipePanel'
import { createGameSession } from '../gameplay/session/createGameSession'
import { createHud } from '../../ui/hud/createHud'
import { applyGameLayout } from '../layout/applyGameLayout'
import { createComboPanel } from '../../ui/combo/createComboPanel'
import { SESSION_RULES } from '../gameplay/session/constants/session.constants'
import type { GameSceneOptions, Scene } from './types/gameScene.types'
import { createPauseButton } from '../../ui/pause/createPauseButton'
import { createResultPanel } from '../../ui/result/createResultPanel'
import { INGREDIENTS_NAME } from '../objects/ingredients/constants/ingredinents.constants'
import { createPausePanel } from '../../ui/pause/createPausePanel'
import type { ResultData } from '../../ui/result/types/result.types'

export async function createGameScene({ onExit, recordScore }: GameSceneOptions): Promise<Scene> {
    const viewport = new Container()
    const scene = new Container()
    viewport.addChild(scene)
    const screenShake = createScreenShake(scene)

    const texture = await Assets.load('/assets/backgrounds/lab.webp')
    const background = new Sprite(texture)

    const bounds = new Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0xffffff)
    scene.addChild(background, bounds)

    scene.mask = bounds

    const cauldron = await createCauldron()
    scene.addChild(cauldron)

    const session = createGameSession(INGREDIENTS_NAME)
    let finalResult: ResultData | undefined

    const recipePanel = await createRecipePanel(session.getState().recipe)
    scene.addChild(recipePanel.view)

    recipePanel.setProgress(session.getState().currentStep)

    const liquid = cauldron.getChildByLabel('liquid')
    if (!liquid) throw new Error('Не найден слой жидкости котла')
    const selectionEffects = createSelectionEffects(liquid)

    const ingredients = await createIngredientGroup((id) => {
        const { outcome } = session.selectIngredient(id)

        if (outcome !== 'inactive') {
            const source = ingredients.getIngredientPosition(id, selectionEffects.view)
            if (outcome === 'wrong') {
                selectionEffects.error(source)
                screenShake.play()
            } else {
                selectionEffects.success(source)
            }
        }

        if (outcome === 'completed') ingredients.shuffle()

        syncPanels()
        syncStatus()
    })
    scene.addChild(ingredients.view, selectionEffects.view)

    const comboPanel = await createComboPanel(session.getState().combo, SESSION_RULES.maxCombo)
    scene.addChild(comboPanel.view)

    const hud = await createHud(session.getState())
    scene.addChild(hud.view)

    const pauseButton = await createPauseButton(() => {
        session.pause()
        syncStatus()
    })

    scene.addChild(pauseButton.view)

    const resultPanel = await createResultPanel({
        screenWidth: GAME_WIDTH,
        screenHeight: GAME_HEIGHT,
        onRestart: restartGame,
        onExit
    })

    const pausePanel = await createPausePanel({
        screenWidth: GAME_WIDTH,
        screenHeight: GAME_HEIGHT,
        onResume: () => {
            session.resume()
            syncStatus()
        },
        onRestart: restartGame,
        onExit
    })

    scene.addChild(pausePanel.view)

    scene.addChild(resultPanel.view)

    applyGameLayout({
        background,
        cauldron,
        ingredients: ingredients.view,
        recipePanel: recipePanel.view,
        hud: hud.view,
        comboPanel: comboPanel.view,
        pauseButton: pauseButton.view,
        resultPanel: resultPanel.view,
        pausePanel: pausePanel.view
    })

    const brewing = createBrewingEffects(cauldron, liquid)
    const fire = createCauldronFire(cauldron)

    function update(deltaMs: number) {
        if (session.getState().status === 'playing') {
            brewing.update(deltaMs)
            fire.update(deltaMs)
        }
        session.update(deltaMs)

        hud.setTime(session.getState().remainingMs)

        syncStatus()
    }

    function syncPanels() {
        const state = session.getState()

        recipePanel.setRecipe(state.recipe)
        recipePanel.setProgress(state.currentStep)
        hud.setScore(state.score)
        comboPanel.setCombo(state.combo)
        hud.setTime(state.remainingMs)
    }

    function restartGame() {
        finalResult = undefined

        session.restart()
        brewing.reset()
        fire.reset()
        ingredients.reset()
        selectionEffects.clear()
        screenShake.clear()
        syncPanels()
        syncStatus()
    }

    function syncStatus() {
        const state = session.getState()

        ingredients.setEnabled(state.status === 'playing')
        selectionEffects.setPaused(state.status !== 'playing')
        screenShake.setPaused(state.status === 'paused')

        pauseButton.setEnabled(state.status === 'playing')
        pausePanel.setVisible(state.status === 'paused')

        if (state.status === 'finished') {
            if (finalResult === undefined) {
                finalResult = {
                    score: state.score,
                    bestScore: recordScore(state.score)
                }
            }

            resultPanel.show(finalResult)
        } else {
            resultPanel.hide()
        }
    }

    return {
        view: viewport,
        update,
        destroy() {
            viewport.destroy({ children: true })
        }
    }
}
