export const RULES_LAYOUT = {
    width: 820,
    height: 1000,
    radius: 24,
    backgroundColor: 0x211029,
    borderColor: 0xffd166,
    borderWidth: 3,
    backdropAlpha: 0.75,

    fontFamily: 'Georgia',
    textColor: 0xfff3dc,

    titleY: -390,
    titleFontSize: 48,

    bodyY: -40,
    bodyWidth: 680,
    bodyFontSize: 34,
    bodyLineHeight: 48,

    closeButtonY: 350,
    closeButtonWidth: 700,
    closeButtonFontSize: 42
} as const

export const RULES_TEXT = [
    'Нажимай ингредиенты в порядке, указанном в рецепте.',
    'Правильно собранные рецепты дают очки и увеличивают множитель комбо.',
    'Ошибка сбрасывает текущий рецепт и комбо.',
    'Приготовь как можно больше зелий до окончания времени.'
].join('\n\n')
