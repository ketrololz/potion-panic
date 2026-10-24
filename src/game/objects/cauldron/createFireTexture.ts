import { Texture } from 'pixi.js'
import { FIRE_FX as FX } from './constants/fire.constants'

// Generated once per effect; all particles share these soft, feathered textures.
export function createFireTexture(turbulent: boolean) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = FX.textureSize
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Не удалось создать текстуру огня')
    const image = context.createImageData(FX.textureSize, FX.textureSize)
    for (let y = 0; y < FX.textureSize; y++) {
        for (let x = 0; x < FX.textureSize; x++) {
            const nx = ((x + 0.5) / FX.textureSize) * 2 - 1
            const ny = ((y + 0.5) / FX.textureSize) * 2 - 1
            const bend = turbulent ? Math.sin(ny * 5) * 0.12 : 0
            const radius = Math.hypot(nx + bend, ny)
            const envelope = Math.max(0, 1 - radius * radius) ** 2
            const wisps = turbulent ? 0.6 + 0.2 * Math.sin(nx * 13 + Math.sin(ny * 9) * 2) + 0.2 * Math.sin(ny * 17 - nx * 7) : 1
            const offset = (y * FX.textureSize + x) * 4
            image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = 255
            image.data[offset + 3] = Math.round(envelope * wisps * 255)
        }
    }
    context.putImageData(image, 0, 0)
    return Texture.from(canvas)
}
