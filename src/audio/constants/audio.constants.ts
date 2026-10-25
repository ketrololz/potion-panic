export type SoundId = 'click' | 'ingredient' | 'recipe' | 'error' | 'result' | 'impact' | 'brewing' | 'hover' | 'shuffle'
export type AmbientId = 'fire'
export type MusicId = 'menu' | 'game'

export const AUDIO_SOURCES: Record<SoundId | MusicId | AmbientId, string[]> = {
    fire: ['/assets/audio/fire.m4a'],
    hover: ['/assets/audio/woosh.wav'],
    brewing: ['/assets/audio/brewing.m4a'],
    menu: ['/assets/audio/menu.ogg', '/assets/audio/menu.m4a'],
    game: ['/assets/audio/game-magic.mp3'],
    click: ['/assets/audio/button_click.mp3'],
    ingredient: ['/assets/audio/ingredient.ogg', '/assets/audio/ingredient.m4a'],
    recipe: ['/assets/audio/recipe.wav'],
    impact: ['/assets/audio/water_drop.ogg', '/assets/audio/water_drop.m4a'],
    error: ['/assets/audio/error.ogg', '/assets/audio/error.m4a'],
    result: ['/assets/audio/result.m4a'],
    shuffle: ['/assets/audio/swoosh.wav']
}

export const AUDIO_SETTINGS = {
    pausedMusicMultiplier: 0.4,
    reusePoolSize: 4,
    effectCooldownMs: 65,
    hoverDelayMs: 100,
    musicStorageKey: 'potion-panic:music-muted',
    effectsStorageKey: 'potion-panic:effects-muted'
} as const

// Individual playback volumes: 0 = silent, 1 = full volume.
export const AUDIO_VOLUMES: Record<SoundId | MusicId | AmbientId, number> = {
    menu: 0.3,
    game: 0.05,
    click: 0.65,
    ingredient: 0.65,
    recipe: 0.65,
    impact: 0.65,
    brewing: 0.45,
    error: 0.65,
    result: 0.65,
    shuffle: 0.45,
    hover: 0.15,
    fire: 0.05
}

export const AUDIO_BUTTON_LABEL = 'audio:button'
export const AUDIO_LOOP_IDS = ['menu', 'game', 'fire'] as const
