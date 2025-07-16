import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';

type Dictionary = {
	[key: string]: string;
};

export type supportedLanguage = 'en' | 'fr' | 'es';

const translations: { [key: string]: Dictionary } = {
    en: en,
    fr: fr,
	es: es,
};

let currentLanguage: supportedLanguage = 'es';

export let locale: {[key: string]: string } = {};

/**
 * Définit la langue actuelle de l'application.
 * Met à jour l'objet `locale` et le localStorage.
 * @param lang La langue à définir ('en', 'fr', 'es').
 */
export function setLanguage(lang: supportedLanguage): void {
    if (translations[lang]) {
        currentLanguage = lang;
        // localStorage.setItem('lang', lang);
		Object.assign(locale, translations[lang]);
        console.log(`Language set to: ${lang}`);
    } else {
        console.warn(`Language '${lang}' not supported.`);
    }
}

/**
 * Retourne la langue actuellement sélectionnée.
 * @returns La langue actuelle.
 */
export function getCurrentLanguage(): supportedLanguage {
    return currentLanguage;
}

export function getLaguangeName(lang: string): string {
	return translations[lang]['language'];
}

setLanguage(currentLanguage);
