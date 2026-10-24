import type { Container, FederatedPointerEvent } from 'pixi.js'
import type { GameAudio } from './createAudio'
import { AUDIO_BUTTON_LABEL } from './constants/audio.constants'

export function bindAudioControls(stage: Container, canvas: HTMLCanvasElement, audio: GameAudio) {
    function isButton(event: FederatedPointerEvent) {
        let target: Container | null = event.target
        while (target) {
            if (target.label === AUDIO_BUTTON_LABEL) return true
            target = target.parent
        }
        return false
    }
    function onTap(event: FederatedPointerEvent) {
        audio.setHovered(false)
        if (isButton(event)) audio.play('click')
    }
    function onOver(event: FederatedPointerEvent) {
        if (event.pointerType !== 'touch' && isButton(event)) audio.setHovered(true)
    }
    function onOut() {
        audio.setHovered(false)
    }

    // Capture also covers modal buttons that stop propagation.
    stage.on('pointertapcapture', onTap)
    stage.on('pointerovercapture', onOver)
    stage.on('pointeroutcapture', onOut)
    canvas.addEventListener('pointerdown', audio.activate)
    window.addEventListener('keydown', audio.activate)

    return () => {
        stage.off('pointertapcapture', onTap)
        stage.off('pointerovercapture', onOver)
        stage.off('pointeroutcapture', onOut)
        canvas.removeEventListener('pointerdown', audio.activate)
        window.removeEventListener('keydown', audio.activate)
        audio.setHovered(false)
    }
}
