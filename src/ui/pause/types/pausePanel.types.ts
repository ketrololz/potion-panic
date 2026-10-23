export interface PausePanelOptions {
    screenWidth: number
    screenHeight: number
    onResume: () => void
    onRestart: () => void
    onExit: () => void
}
