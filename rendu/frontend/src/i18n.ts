import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { la } from './locales/la';

type Dictionary = {
	[key: string]: string;
};


const translations: { [key: string]: Dictionary } = {
    en: en,
    fr: fr,
	es: es,
	la: la,
};

export type supportedLanguage = keyof typeof translations;

function getUserLanguage(): supportedLanguage {
	const userLanguage: string = navigator.language;
	const userLanguageCode: string = userLanguage.substring(0,2);
	let lang: supportedLanguage = 'en';
	if (userLanguageCode in translations) {
        lang = userLanguageCode as supportedLanguage;
    }
	return lang;
}

let currentLanguage: supportedLanguage = getUserLanguage();

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

export function getLaguangeName(lang: supportedLanguage): string {
	return translations[lang]['language'];
}

setLanguage(currentLanguage);
