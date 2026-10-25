import { Assets } from 'pixi.js'
import type { GameAudio } from '../../audio/createAudio'
import { SCENE_ASSETS } from './assets.constants'
import type { SceneName } from './assets.constants'

export async function loadSceneAssets(name: SceneName, audio: GameAudio, onProgress: (value: number) => void) {
    const assets = SCENE_ASSETS[name]
    let texturesProgress = 0
    let audioProgress = 0
    const report = () =>
        onProgress((texturesProgress * assets.textures.length + audioProgress * assets.audio.length) / (assets.textures.length + assets.audio.length))
    await Promise.all([
        Assets.load(assets.textures, (progress) => {
            texturesProgress = progress
            report()
        }),
        audio.load(assets.audio, (progress) => {
            audioProgress = progress
            report()
        })
    ])
}

export function waitForPaint(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}
