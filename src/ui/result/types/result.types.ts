export interface ResultData {
    score: number
    bestScore: number
    previousBestScore: number
}

export interface ResultPanelOptions {
    screenWidth: number
    screenHeight: number
    onCountingChange: (counting: boolean) => void
    onNewRecord: () => void
    onRestart: () => void
    onExit: () => void
}
