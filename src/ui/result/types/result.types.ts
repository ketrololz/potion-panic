export interface ResultData {
    score: number
    bestScore: number
}

export interface ResultPanelOptions {
    screenWidth: number
    screenHeight: number
    onRestart: () => void
    onExit: () => void
}
