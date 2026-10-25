import { Container } from 'pixi.js'

import type { Scene } from '../game/scenes/types/gameScene.types'
import type { SceneFactory } from './types/app.types'

export function createSceneManager(host: Container, onChange: (scene: Scene) => void) {
    let activeScene: Scene | undefined
    let switching = false
    let destroyed = false

    async function show(createScene: SceneFactory) {
        if (switching || destroyed) return

        switching = true

        try {
            const nextScene = await createScene()

            if (destroyed) {
                nextScene.destroy()
                return
            }

            activeScene?.destroy()

            activeScene = nextScene

            host.addChild(nextScene.view)
            onChange(nextScene)
        } finally {
            switching = false
        }
    }

    function update(deltaMs: number) {
        if (!switching) activeScene?.update?.(deltaMs)
    }

    function destroy() {
        destroyed = true

        activeScene?.destroy()
        activeScene = undefined
    }

    return { show, update, destroy }
}
