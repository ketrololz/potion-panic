import { AUDIO_SETTINGS } from './constants/audio.constants'

type Channel = 'music' | 'effects'
const keys = { music: AUDIO_SETTINGS.musicStorageKey, effects: AUDIO_SETTINGS.effectsStorageKey }

export function readAudioMuted(channel: Channel): boolean {
    try {
        const value = localStorage.getItem(keys[channel]) ?? localStorage.getItem('potion-panic:audio-muted')
        return value === 'true'
    } catch {
        return false
    }
}

export function saveAudioMuted(channel: Channel, muted: boolean) {
    try {
        localStorage.setItem(keys[channel], String(muted))
    } catch {
        // Audio remains usable when storage is unavailable.
    }
}
