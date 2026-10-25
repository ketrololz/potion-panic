import { createLoadingScreen } from './ui/loading/createLoadingScreen'
import { createApp } from './app/createApp'
import './style.css'

async function bootstrap() {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
        throw new Error('#app не найден')
    }

    const loading = createLoadingScreen()
    let app: Awaited<ReturnType<typeof createApp>>
    try {
        app = await createApp(root, loading)
    } catch (error) {
        loading.fail(() => window.location.reload())
        throw error
    }

    if (import.meta.hot) {
        import.meta.hot.dispose(() => app.destroy())
    }
}

bootstrap().catch(console.error)
