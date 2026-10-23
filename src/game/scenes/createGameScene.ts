import { Assets, Container, Graphics, Sprite } from 'pixi.js'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants/config/config.constants'
import { createCauldron } from '../objects/cauldron/createCauldron'
import { createIngredientGroup } from '../objects/ingredients/ingredientGroup/createIngredientGroup'
import { createRecipePanel } from '../../ui/recipe/createRecipePanel'
import { createGameSession } from '../gameplay/session/createGameSession'
import { createScorePanel } from '../../ui/score/createScorePanel'
import { applyGameLayout } from '../layout/applyGameLayout'
import { createComboPanel } from '../../ui/combo/createComboPanel'
import { SESSION_RULES } from '../gameplay/session/constants/session.constants'
import { createTimerPanel } from '../../ui/timer/createTimerPanel'
import type { GameSceneOptions, Scene } from './types/gameScene.types'
import { createPauseButton } from '../../ui/pause/createPauseButton'
import { createResultPanel } from '../../ui/result/createResultPanel'
import { INGREDIENTS_NAME } from '../objects/ingredients/constants/ingredinents.constants'
import { createPausePanel } from '../../ui/pause/createPausePanel'

export async function createGameScene({ onExit }: GameSceneOptions): Promise<Scene> {
    const scene = new Container()

    const texture = await Assets.load('/assets/backgrounds/lab.webp')
    const background = new Sprite(texture)

    background.label = 'debug_hide'

    const bounds = new Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0xffffff)
    scene.addChild(background, bounds)

    scene.mask = bounds

    const cauldron = await createCauldron()
    scene.addChild(cauldron)

    const session = createGameSession(INGREDIENTS_NAME)

    const recipePanel = await createRecipePanel(session.getState().recipe)
    scene.addChild(recipePanel.view)

    recipePanel.setProgress(session.getState().currentStep)

    const ingredients = await createIngredientGroup((id) => {
        session.selectIngredient(id)

        syncPanels()
    })
    scene.addChild(ingredients)

    const scorePanel = createScorePanel(session.getState().score)
    scene.addChild(scorePanel.view)

    const comboPanel = await createComboPanel(session.getState().combo, SESSION_RULES.maxCombo)
    scene.addChild(comboPanel.view)

    const timerPanel = createTimerPanel(session.getState().remainingMs)
    scene.addChild(timerPanel.view)

    const pauseButton = createPauseButton(() => {
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
        ingredients,
        recipePanel: recipePanel.view,
        scorePanel: scorePanel.view,
        comboPanel: comboPanel.view,
        timerPanel: timerPanel.view,
        pauseButton: pauseButton.view,
        resultPanel: resultPanel.view,
        pausePanel: pausePanel.view
    })

    function update(deltaMs: number) {
        session.update(deltaMs)

        timerPanel.setTime(session.getState().remainingMs)

        syncStatus()
    }

    function syncPanels() {
        const state = session.getState()

        recipePanel.setRecipe(state.recipe)
        recipePanel.setProgress(state.currentStep)
        scorePanel.setScore(state.score)
        comboPanel.setCombo(state.combo)
        timerPanel.setTime(state.remainingMs)
        pauseButton.setPaused(state.status === 'paused')
    }

    function restartGame() {
        session.restart()
        syncPanels()
        syncStatus()
    }

    function syncStatus() {
        const state = session.getState()

        ingredients.eventMode = state.status === 'playing' ? 'passive' : 'none'

        pauseButton.setEnabled(state.status === 'playing')
        pausePanel.setVisible(state.status === 'paused')

        if (state.status === 'finished') {
            resultPanel.show(state.score)
        } else {
            resultPanel.hide()
        }
    }

    return {
        view: scene,
        update,
        destroy() {
            scene.destroy({ children: true })
        }
    }
}
