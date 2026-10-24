import { BEST_SCORE_STORAGE_KEY } from './constants/storage.constants'

function readBestScore(): number {
    try {
        const storedValue = localStorage.getItem(BEST_SCORE_STORAGE_KEY)

        if (storedValue === null) {
            return 0
        }

        const score = Number(storedValue)

        return Number.isSafeInteger(score) && score >= 0 ? score : 0
    } catch {
        return 0
    }
}

export function createBestScoreStore() {
    let bestScore = readBestScore()

    function recordScore(score: number): number {
        if (!Number.isSafeInteger(score) || score < 0) {
            throw new Error('Score must be a non-negative safe integer')
        }

        if (score <= bestScore) {
            return bestScore
        }

        bestScore = score

        try {
            localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(bestScore))
        } catch {
            // Keep the record in memory when persistent storage is unavailable.
        }

        return bestScore
    }

    return { recordScore }
}
