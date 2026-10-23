export const PAUSE_BUTTON_STYLE = {
    radius: 56,
    backgroundColor: 0x211029,
    borderColor: 0xffd166,
    borderWidth: 3,
    fontFamily: 'Georgia',
    fontSize: 40,
    textColor: 0xfff3dc,
    disabledAlpha: 0.4
}

export const PAUSE_PANEL_LAYOUT = {
    width: 820,
    height: 700,
    radius: 24,
    backgroundColor: 0x211029,
    borderColor: 0xffd166,
    borderWidth: 3,
    backdropAlpha: 0.7,

    titleY: -240,
    titleFontSize: 48,
    fontFamily: 'Georgia',
    textColor: 0xfff3dc,

    buttonWidth: 640,
    buttonFontSize: 36,
    resumeY: -80,
    restartY: 60,
    exitY: 200
} as const
