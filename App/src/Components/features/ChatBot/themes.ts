/** Theme color tokens for the ChatBot widget (light & dark modes) */
export const themes = {
  light: {
    // FAB
    fabGradient: "linear-gradient(135deg, #4B2E2B 0%, #7A4E3A 50%, #C8A96A 100%)",
    fabPulse: "linear-gradient(135deg, #4B2E2B, #C8A96A)",
    fabText: "#FDF8F3",
    // Window
    windowBorder: "1px solid rgba(200, 169, 106, 0.2)",
    windowShadow: "0 25px 60px rgba(75, 46, 43, 0.15)",
    // Header
    headerBg: "linear-gradient(135deg, #3A2019 0%, #4B2E2B 50%, #5C3830 100%)",
    headerDotColor: "#C8A96A",
    headerOnlineBorder: "#4B2E2B",
    // Avatar
    avatarFrom: "#C8A96A",
    avatarTo: "#E8D5A8",
    avatarIcon: "#4B2E2B",
    // Messages area
    msgAreaBg: "#FAF6F0",
    msgAreaGradient: "radial-gradient(circle at 50% 0%, rgba(200,169,106,0.06) 0%, transparent 50%)",
    // Bot bubble
    botBubbleBg: "#FFFFFF",
    botBubbleText: "#3D3029",
    botBubbleBorder: "1px solid rgba(200,169,106,0.15)",
    botBoldText: "#4B2E2B",
    // Bot mini avatar
    botAvatarFrom: "rgba(200,169,106,0.2)",
    botAvatarTo: "rgba(232,213,168,0.3)",
    botAvatarIcon: "#7A4E3A",
    // User bubble
    userBubbleBg: "linear-gradient(135deg, #4B2E2B, #5C3830)",
    userBubbleText: "#FDF8F3",
    // Timestamp
    timestampColor: "#A89279",
    // Suggestion chips
    chipBg: "#FFFFFF",
    chipText: "#7A4E3A",
    chipBorder: "rgba(200,169,106,0.3)",
    chipBorderHover: "rgba(200,169,106,0.6)",
    chipSparkle: "#C8A96A",
    // Typing dots
    dotColor: "#C8A96A",
    dotBubbleBg: "#FFFFFF",
    dotBubbleBorder: "1px solid rgba(200,169,106,0.15)",
    // Input area
    inputAreaBg: "#FFFFFF",
    inputAreaBorder: "1px solid rgba(200,169,106,0.15)",
    inputAreaShadow: "0 -4px 12px rgba(75,46,43,0.03)",
    inputBg: "#FAF6F0",
    inputBorder: "rgba(232,213,168,0.5)",
    inputText: "#3D3029",
    inputPlaceholder: "#B8A68E",
    sendBtnActive: "linear-gradient(135deg, #4B2E2B 0%, #7A4E3A 50%, #C8A96A 100%)",
    sendBtnInactive: "#E8D5A8",
    sendBtnText: "#FDF8F3",
  },
  dark: {
    // FAB
    fabGradient: "linear-gradient(135deg, #C8A96A 0%, #A8874A 50%, #7A4E3A 100%)",
    fabPulse: "linear-gradient(135deg, #C8A96A, #7A4E3A)",
    fabText: "#1A1210",
    // Window
    windowBorder: "1px solid rgba(200, 169, 106, 0.12)",
    windowShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
    // Header
    headerBg: "linear-gradient(135deg, #1A1210 0%, #241A16 50%, #2E2018 100%)",
    headerDotColor: "#C8A96A",
    headerOnlineBorder: "#1A1210",
    // Avatar
    avatarFrom: "#C8A96A",
    avatarTo: "#A8874A",
    avatarIcon: "#1A1210",
    // Messages area
    msgAreaBg: "#1A1210",
    msgAreaGradient: "radial-gradient(circle at 50% 0%, rgba(200,169,106,0.04) 0%, transparent 50%)",
    // Bot bubble
    botBubbleBg: "#241A16",
    botBubbleText: "#E8DDD0",
    botBubbleBorder: "1px solid rgba(200,169,106,0.1)",
    botBoldText: "#C8A96A",
    // Bot mini avatar
    botAvatarFrom: "rgba(200,169,106,0.15)",
    botAvatarTo: "rgba(200,169,106,0.08)",
    botAvatarIcon: "#C8A96A",
    // User bubble
    userBubbleBg: "linear-gradient(135deg, #C8A96A, #A8874A)",
    userBubbleText: "#1A1210",
    // Timestamp
    timestampColor: "#7A6B58",
    // Suggestion chips
    chipBg: "#241A16",
    chipText: "#C8A96A",
    chipBorder: "rgba(200,169,106,0.2)",
    chipBorderHover: "rgba(200,169,106,0.5)",
    chipSparkle: "#C8A96A",
    // Typing dots
    dotColor: "#C8A96A",
    dotBubbleBg: "#241A16",
    dotBubbleBorder: "1px solid rgba(200,169,106,0.1)",
    // Input area
    inputAreaBg: "#1A1210",
    inputAreaBorder: "1px solid rgba(200,169,106,0.1)",
    inputAreaShadow: "0 -4px 12px rgba(0,0,0,0.2)",
    inputBg: "#241A16",
    inputBorder: "rgba(200,169,106,0.15)",
    inputText: "#E8DDD0",
    inputPlaceholder: "#6B5D4E",
    sendBtnActive: "linear-gradient(135deg, #C8A96A 0%, #A8874A 50%, #7A4E3A 100%)",
    sendBtnInactive: "#3A2E24",
    sendBtnText: "#1A1210",
  },
} as const;
