export type LoadingScreen = ReturnType<typeof createLoadingScreen>

export function createLoadingScreen() {
    const view = document.querySelector<HTMLElement>('#loading-screen')!
    const label = view.querySelector<HTMLElement>('[data-loading-label]')!
    const progress = view.querySelector<HTMLProgressElement>('progress')!
    const percentage = view.querySelector<HTMLElement>('[data-loading-percentage]')!
    const retry = view.querySelector<HTMLButtonElement>('button')!
    let currentProgress = 0

    function show(text: string) {
        currentProgress = 0
        view.hidden = false
        view.classList.remove('loading-screen--error')
        retry.hidden = true
        retry.onclick = null
        label.textContent = text
        progress.value = 0
        percentage.textContent = '0%'
    }

    function setProgress(value: number) {
        currentProgress = Math.max(currentProgress, Math.min(1, value))
        progress.value = currentProgress
        percentage.textContent = `${Math.floor(currentProgress * 100)}%`
    }

    function hide() {
        setProgress(1)
        view.hidden = true
        retry.onclick = null
    }

    function fail(onRetry: () => void) {
        view.hidden = false
        view.classList.add('loading-screen--error')
        label.textContent = 'Не удалось загрузить игру. Проверь соединение и попробуй ещё раз.'
        percentage.textContent = ''
        retry.hidden = false
        retry.onclick = onRetry
    }

    return { show, setProgress, hide, fail }
}
