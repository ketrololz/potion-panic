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
        background: '#160d20',
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
    })

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

    const bestScoreStore = createBestScoreStore()

    function showGame() {
        sceneManager.show(() => createGameScene({ onExit: showMenu, recordScore: bestScoreStore.recordScore })).catch(console.error)
    }

    function showMenu() {
        sceneManager.show(() => createMenuScene(showGame)).catch(console.error)
    }

    function update(ticker: Ticker) {
        sceneManager.update(ticker.deltaMS)
    }

    await sceneManager.show(() => createMenuScene(showGame))

    app.ticker.add(update)
    app.renderer.on('resize', resize)

    return {
        destroy() {
            app.ticker.remove(update)
            app.renderer.off('resize', resize)

            sceneManager.destroy()

            app.destroy(true, { children: true })
        }
    }
}
