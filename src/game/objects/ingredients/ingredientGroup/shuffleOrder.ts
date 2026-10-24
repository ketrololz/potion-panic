export function shuffleOrder<T>(items: readonly T[]): T[] {
    const shuffled = [...items]

    for (let index = shuffled.length - 1; index > 0; index--) {
        const target = Math.floor(Math.random() * (index + 1))
        ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
    }

    // Even a valid random shuffle can return the original order.
    if (shuffled.length > 1 && shuffled.every((item, index) => item === items[index])) {
        shuffled.push(shuffled.shift()!)
    }

    return shuffled
}
