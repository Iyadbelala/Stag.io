import en from "./en";
import fr from "./fr";

export type Lang = "en" | "fr";

const dictionaries: Record<Lang, Record<string, string>> = { en, fr };

export default dictionaries;
