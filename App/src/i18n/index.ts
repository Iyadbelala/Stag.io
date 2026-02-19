import en from "./en";
import fr from "./fr";
import ar from "./ar";

export type Lang = "en" | "fr" | "ar";

const dictionaries: Record<Lang, Record<string, string>> = { en, fr, ar };

export default dictionaries;
