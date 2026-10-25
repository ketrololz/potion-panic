import { bindAudioControls } from '../audio/bindAudioControls'
import { createAudio } from '../audio/createAudio'
import { Application } from 'pixi.js'
import type { Container, Ticker } from 'pixi.js'
import { createGameScene } from '../game/scenes/createGameScene'

import { fitScene } from '../game/layout/fitScene'
import { createSceneManager } from './createSceneManager'
import { createMenuScene } from '../game/scenes/createMenuScene'
import { createBestScoreStore } from '../game/progress/createBestScoreStore'

export async function createApp(root: HTMLElement) {
    const app = new Application()

    await app.init({
        resizeTo: root,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
    })

    // The stage receives button taps during capture, including modal buttons.
    app.stage.eventMode = 'static'

    root.appendChild(app.canvas)

    let activeView: Container | undefined

    function resize() {
        if (!activeView) return

        fitScene(activeView, app.screen.width, app.screen.height)
    }

    const sceneManager = createSceneManager(app.stage, (scene) => {
        activeView = scene.view

        resize()
    })

    const audio = createAudio()
    const unbindAudioControls = bindAudioControls(app.stage, app.canvas, audio)
    const bestScoreStore = createBestScoreStore()

    function showGame() {
        sceneManager
            .show(() => createGameScene({ onExit: showMenu, recordScore: bestScoreStore.recordScore, getBestScore: bestScoreStore.getBestScore, audio }))
            .catch(console.error)
    }

    function showMenu() {
        sceneManager.show(() => createMenuScene(showGame, audio)).catch(console.error)
    }

    function update(ticker: Ticker) {
        sceneManager.update(ticker.deltaMS)
    }

    await sceneManager.show(() => createMenuScene(showGame, audio))

    app.ticker.add(update)
    app.renderer.on('resize', resize)

    return {
        destroy() {
            app.ticker.remove(update)
            app.renderer.off('resize', resize)

            unbindAudioControls()
            sceneManager.destroy()
            audio.destroy()

            app.destroy(true, { children: true })
        }
    }
}
