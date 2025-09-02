import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { la } from './locales/la';
import { lc } from './locales/lc';

type Dictionary = {
	[key: string]: string;
};

const translations: { [key: string]: Dictionary } = {
	en: en,
	fr: fr,
	es: es,
	la: la,
	lc: lc
};

export type supportedLanguage = keyof typeof translations;

function getNavigatorLanguage(): supportedLanguage {
	const userLanguage: string = navigator.language;
	const userLanguageCode: string = userLanguage.substring(0,2);
	let lang: supportedLanguage = 'en';
	if (userLanguageCode in translations) {
		lang = userLanguageCode as supportedLanguage;
	}
	return lang;
}

function getPreferredLanguage(): supportedLanguage {
  const storedLang = localStorage.getItem('lang');
  if (storedLang) {
    return storedLang;
  }
  return getNavigatorLanguage();
}

let userLanguage: supportedLanguage = getPreferredLanguage();

export let locale: {[key: string]: string } = {};

/**
 * Définit la langue actuelle de l'application.
 * Met à jour l'objet `locale` et le localStorage.
 * @param lang La langue à définir ('en', 'fr', 'es', ...).
 */
export function setLanguage(lang: supportedLanguage): void {
	if (translations[lang]) {
		userLanguage = lang;
		localStorage.setItem('lang', lang as string);
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
export function getuserLanguage(): supportedLanguage {
	return userLanguage;
}

export function getLaguangeName(lang: supportedLanguage): string {
	return translations[lang]['language'];
}

setLanguage(userLanguage);
