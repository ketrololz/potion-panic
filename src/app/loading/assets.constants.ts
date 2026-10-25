import { INGREDIENTS } from '../../game/objects/ingredients/constants/ingredients.constants'
import type { AmbientId, MusicId, SoundId } from '../../audio/constants/audio.constants'

const COMMON_TEXTURES = [
    '/assets/backgrounds/lab.webp',
    '/assets/menu/button-action.webp',
    '/assets/menu/button-cancel.webp',
    '/assets/ui/buttons/button-round.webp'
]

export const SCENE_ASSETS = {
    menu: {
        textures: [
            ...COMMON_TEXTURES,
            '/assets/menu/logo.webp',
            '/assets/menu/button-base.webp',
            ...['music', 'music_off', 'sound', 'sound_off'].map((name) => `/assets/ui/icons/${name}.webp`)
        ],
        audio: ['menu', 'click', 'hover']
    },
    game: {
        textures: [
            ...COMMON_TEXTURES,
            ...INGREDIENTS.map((item) => item.textureUrl),
            '/assets/cauldron/cauldron.webp',
            '/assets/cauldron/liquid-turquoise.webp',
            '/assets/ui/recipe/recipe-panel.webp',
            '/assets/ui/recipe/text-panel.webp',
            '/assets/ui/hud/frame.webp',
            '/assets/ui/icons/star.webp',
            '/assets/ui/icons/time.webp',
            '/assets/ui/icons/pause.webp',
            '/assets/ui/combo/combo-frame.webp',
            '/assets/ui/combo/combo-icon.webp'
        ],
        audio: [
            'game',
            'fire',
            'ingredient',
            'recipe',
            'impact',
            'brewing',
            'error',
            'result',
            'shuffle',
            'record',
            'count',
            'combo',
            'comboBurn',
            'click',
            'hover'
        ]
    }
} satisfies Record<string, { textures: string[]; audio: (SoundId | MusicId | AmbientId)[] }>

export type SceneName = keyof typeof SCENE_ASSETS
