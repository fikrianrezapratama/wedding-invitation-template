export type ThemePreset = {
  key: string;
  name: string;
  mood: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  fontKey: string;
  layoutStyle: string;
};

export const themePresets: ThemePreset[] = [
  {
    key: "cinnamon-rose",
    name: "Cinnamon Rose",
    mood: "Hangat, elegan, romantis",
    primaryColor: "#8E7A63",
    secondaryColor: "#E7D7C1",
    accentColor: "#C89B7B",
    backgroundColor: "#FAF5EE",
    surfaceColor: "#FFFDFC",
    fontKey: "cormorant",
    layoutStyle: "classic"
  },
  {
    key: "sage-poetry",
    name: "Sage Green",
    mood: "Minimal, elegan, lembut",
    primaryColor: "#89986D",
    secondaryColor: "#C5D89D",
    accentColor: "#9CAB84",
    backgroundColor: "#F6F0D7",
    surfaceColor: "#FBF8EC",
    fontKey: "playfair",
    layoutStyle: "classic"
  },
  {
    key: "midnight-blush",
    name: "Midnight Blush",
    mood: "Mewah, dramatis, intimate",
    primaryColor: "#6A6575",
    secondaryColor: "#E9E1E8",
    accentColor: "#C7A4A0",
    backgroundColor: "#FAF5F7",
    surfaceColor: "#FFFDFE",
    fontKey: "playfair",
    layoutStyle: "classic"
  },
  {
    key: "champagne-dust",
    name: "Champagne Dust",
    mood: "Terang, festive, refined",
    primaryColor: "#A78C6A",
    secondaryColor: "#F2E3C8",
    accentColor: "#D8B48B",
    backgroundColor: "#FCF8F1",
    surfaceColor: "#FFFFFF",
    fontKey: "jakarta",
    layoutStyle: "classic"
  }
];

export function getThemePreset(key: string) {
  return themePresets.find((preset) => preset.key === key) || null;
}
