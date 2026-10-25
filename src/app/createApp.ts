import { loadSceneAssets, waitForPaint } from './loading/loadSceneAssets'
import type { SceneName } from './loading/assets.constants'
import type { LoadingScreen } from '../ui/loading/createLoadingScreen'
import { bindAudioControls } from '../audio/bindAudioControls'
import { createAudio } from '../audio/createAudio'
import { Application } from 'pixi.js'
import type { Container, Ticker } from 'pixi.js'
import { createGameScene } from '../game/scenes/createGameScene'

import { fitScene } from '../game/layout/fitScene'
import { createSceneManager } from './createSceneManager'
import { createMenuScene } from '../game/scenes/createMenuScene'
import { createBestScoreStore } from '../game/progress/createBestScoreStore'

export async function createApp(root: HTMLElement, loading: LoadingScreen) {
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
        app.stage.interactiveChildren = true
        loading.hide()
    })

    const audio = createAudio()
    const unbindAudioControls = bindAudioControls(app.stage, app.canvas, audio)
    const bestScoreStore = createBestScoreStore()

    let destroyed = false
    let loadVersion = 0

    async function showScene(name: SceneName) {
        try {
            await sceneManager.show(async () => {
                const version = ++loadVersion
                loading.show(name === 'menu' ? 'Пробуждаем магическую лабораторию…' : 'Готовим котёл и ингредиенты…')
                app.stage.interactiveChildren = false
                await waitForPaint()
                await loadSceneAssets(name, audio, (progress) => {
                    if (!destroyed && version === loadVersion) loading.setProgress(progress * 0.95)
                })
                if (destroyed) throw new Error('Application destroyed during loading')
                return name === 'menu'
                    ? createMenuScene(showGame, audio)
                    : createGameScene({ onExit: showMenu, recordScore: bestScoreStore.recordScore, getBestScore: bestScoreStore.getBestScore, audio })
            })
        } catch (error) {
            if (destroyed) return
            console.error(error)
            loading.fail(() => {
                void showScene(name)
            })
        }
    }

    function showGame() {
        void showScene('game')
    }
    function showMenu() {
        void showScene('menu')
    }

    function update(ticker: Ticker) {
        sceneManager.update(ticker.deltaMS)
    }

    app.ticker.add(update)
    app.renderer.on('resize', resize)
    showMenu()

    return {
        destroy() {
            destroyed = true
            loading.hide()
            app.ticker.remove(update)
            app.renderer.off('resize', resize)

            unbindAudioControls()
            sceneManager.destroy()
            audio.destroy()

            app.destroy(true, { children: true })
        }
    }
}
