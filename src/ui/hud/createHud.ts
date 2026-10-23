import { Assets, Container, Sprite } from 'pixi.js'
import { createScorePanel } from '../score/createScorePanel'
import { createTimerPanel } from '../timer/createTimerPanel'
import { HUD_LAYOUT as LAYOUT } from './constants/layout.constants'

interface HudOptions {
    score: number
    remainingMs: number
}

export async function createHud({ score, remainingMs }: HudOptions) {
    const view = new Container()

    view.eventMode = 'none'

    const [panelTexture, starTexture, hourglassTexture] = await Promise.all([
        Assets.load('/assets/ui/hud/frame.webp'),
        Assets.load('/assets/ui/icons/star.webp'),
        Assets.load('/assets/ui/icons/time.webp')
    ])

    const panel = new Sprite(panelTexture)
    panel.anchor.set(0.5)
    panel.scale.set(LAYOUT.width / panelTexture.width)

    const star = new Sprite(starTexture)
    star.anchor.set(0.5)
    star.scale.set(LAYOUT.star.size / Math.max(starTexture.width, starTexture.height))
    star.position.set(LAYOUT.star.x, 0)

    const hourglass = new Sprite(hourglassTexture)
    hourglass.anchor.set(0.5)
    hourglass.scale.set(LAYOUT.hourglass.size / Math.max(hourglassTexture.width, hourglassTexture.height))
    hourglass.position.set(LAYOUT.hourglass.x, 0)

    const scorePanel = createScorePanel(score)
    scorePanel.view.position.set(LAYOUT.score.x, 0)

    const timerPanel = createTimerPanel(remainingMs)
    timerPanel.view.position.set(LAYOUT.timer.x, 0)

    view.addChild(panel, star, scorePanel.view, hourglass, timerPanel.view)

    return {
        view,
        setScore: scorePanel.setScore,
        setTime: timerPanel.setTime
    }
}
