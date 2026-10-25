import { readAudioMuted, saveAudioMuted } from './audioPreferences'
import { Howl } from 'howler'
import { AUDIO_SETTINGS as SETTINGS, AUDIO_SOURCES, AUDIO_VOLUMES, AUDIO_LOOP_IDS } from './constants/audio.constants'
import type { AmbientId, MusicId, SoundId } from './constants/audio.constants'

export type GameAudio = ReturnType<typeof createAudio>
type AudioId = SoundId | MusicId | AmbientId

export function createAudio() {
    const sounds = new Map<AudioId, Howl>()
    const cancelLoads = new Set<() => void>()
    const pendingLoads = new Map<AudioId, Promise<void>>()
    const voices = new Map<AudioId, number>()
    const lastPlayed = new Map<SoundId, number>()
    let musicMuted = readAudioMuted('music')
    let effectsMuted = readAudioMuted('effects')
    let activated = false
    let destroyed = false
    let gamePaused = false
    let counting = false
    let hovered = false
    let hoverTimer: ReturnType<typeof setTimeout> | undefined
    let desiredMusic: MusicId = 'menu'

    function allowed() {
        return activated && !document.hidden && !destroyed
    }
    function gameEffectsAllowed() {
        return allowed() && !effectsMuted && desiredMusic === 'game' && !gamePaused
    }
    function isLoop(id: AudioId) {
        return AUDIO_LOOP_IDS.some((loop) => loop === id)
    }

    function getSound(id: AudioId) {
        const existing = sounds.get(id)
        if (existing) return existing
        const sound = new Howl({
            src: AUDIO_SOURCES[id],
            loop: isLoop(id),
            preload: false,
            volume: AUDIO_VOLUMES[id],
            pool: SETTINGS.reusePoolSize,
            onload: () => {
                if (isLoop(id)) syncLoops()
            },
            onloaderror: (_voice, error) => console.warn(`Audio load failed: ${id}`, error),
            onplayerror: (voice) => {
                sound.stop(voice)
                if (isLoop(id)) {
                    voices.delete(id)
                    sound.off('unlock', syncLoops)
                    sound.once('unlock', syncLoops)
                }
            }
        })
        sounds.set(id, sound)
        return sound
    }

    function syncLoop(id: MusicId | AmbientId, enabled: boolean, volume: number) {
        const sound = getSound(id)
        if (!enabled) {
            sound.pause()
            return
        }
        if (sound.state() !== 'loaded') return
        sound.volume(volume)
        const voice = voices.get(id)
        if (!sound.playing(voice)) voices.set(id, voice === undefined ? sound.play() : sound.play(voice))
    }
    function syncLoops() {
        if (destroyed) return
        for (const id of ['menu', 'game'] as const) {
            syncLoop(id, allowed() && !musicMuted && desiredMusic === id, AUDIO_VOLUMES[id] * (gamePaused ? SETTINGS.pausedMusicMultiplier : 1))
        }
        syncLoop('fire', gameEffectsAllowed(), AUDIO_VOLUMES.fire)
        syncLoop('count', counting && allowed() && !effectsMuted && desiredMusic === 'game', AUDIO_VOLUMES.count)
    }

    function resetHover() {
        hovered = false
        clearTimeout(hoverTimer)
        hoverTimer = undefined
        sounds.get('hover')?.stop()
    }

    function stopEffects() {
        resetHover()
        for (const [id, sound] of sounds) {
            if (isLoop(id)) continue
            sound.off('end')
            sound.stop()
        }
    }

    function play(id: SoundId) {
        if (!allowed() || effectsMuted) return undefined
        const now = performance.now()
        if (now - (lastPlayed.get(id) ?? -Infinity) < SETTINGS.effectCooldownMs) return undefined
        const sound = getSound(id)
        if (sound.state() !== 'loaded') return undefined
        lastPlayed.set(id, now)
        // Cancel the old sequence before restarting this sound.
        sound.off('end')
        sound.stop()
        sound.volume(AUDIO_VOLUMES[id])
        return sound.play()
    }

    function playImpact(recipeCompleted = false) {
        if (!gameEffectsAllowed()) return
        const voice = play('impact')
        if (voice === undefined || !recipeCompleted) return
        getSound('impact').once(
            'end',
            () => {
                if (gameEffectsAllowed()) play('brewing')
            },
            voice
        )
    }

    function visibilityChanged() {
        if (document.hidden) {
            stopEffects()
        }
        syncLoops()
    }
    document.addEventListener('visibilitychange', visibilityChanged)
    function loadSound(id: AudioId): Promise<void> {
        if (destroyed) return Promise.resolve()
        const sound = getSound(id)
        if (sound.state() === 'loaded') return Promise.resolve()
        const pending = pendingLoads.get(id)
        if (pending) return pending
        const promise = new Promise<void>((resolve) => {
            function complete() {
                cancelLoads.delete(complete)
                sound.off('load', complete)
                sound.off('loaderror', complete)
                resolve()
            }
            cancelLoads.add(complete)
            sound.once('load', complete)
            sound.once('loaderror', complete)
            sound.load()
        })
        pendingLoads.set(id, promise)
        void promise.then(() => pendingLoads.delete(id))
        return promise
    }

    return {
        async load(ids: readonly AudioId[], onProgress: (value: number) => void) {
            const unique = [...new Set(ids)]
            let loaded = 0
            if (!unique.length) onProgress(1)
            await Promise.all(
                unique.map(async (id) => {
                    await loadSound(id)
                    onProgress(++loaded / unique.length)
                })
            )
        },
        play,
        playImpact,
        setCounting(value: boolean) {
            if (destroyed || counting === value) return
            counting = value
            if (!value) {
                sounds.get('count')?.stop()
                voices.delete('count')
            }
            syncLoops()
        },
        setHovered(value: boolean) {
            if (hovered === value) return
            hovered = value
            if (!value) {
                resetHover()
            } else if (allowed() && !effectsMuted) {
                hoverTimer = setTimeout(() => {
                    hoverTimer = undefined
                    if (hovered) play('hover')
                }, SETTINGS.hoverDelayMs)
            }
        },
        activate() {
            if (destroyed || activated) return
            activated = true
            syncLoops()
        },
        setMusic(id: MusicId) {
            resetHover()
            if (desiredMusic !== id) {
                counting = false
                stopEffects()
                for (const loop of AUDIO_LOOP_IDS) {
                    sounds.get(loop)?.stop()
                    voices.delete(loop)
                }
            }
            desiredMusic = id
            gamePaused = false
            syncLoops()
        },
        setPaused(value: boolean) {
            if (gamePaused === value) return
            gamePaused = value
            if (value) stopEffects()
            else resetHover()
            syncLoops()
        },
        isMusicMuted: () => musicMuted,
        isEffectsMuted: () => effectsMuted,
        toggleMusic() {
            musicMuted = !musicMuted
            saveAudioMuted('music', musicMuted)
            syncLoops()
            return musicMuted
        },
        toggleEffects() {
            effectsMuted = !effectsMuted
            if (effectsMuted) stopEffects()
            saveAudioMuted('effects', effectsMuted)
            syncLoops()
            return effectsMuted
        },
        destroy() {
            if (destroyed) return
            resetHover()
            destroyed = true
            for (const cancel of cancelLoads) cancel()
            pendingLoads.clear()
            document.removeEventListener('visibilitychange', visibilityChanged)
            for (const sound of sounds.values()) sound.unload()
            sounds.clear()
            voices.clear()
            lastPlayed.clear()
        }
    }
}
