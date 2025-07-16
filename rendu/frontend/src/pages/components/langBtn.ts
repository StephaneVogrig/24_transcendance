import { getLaguangeName, setLanguage, supportedLanguage } from '../../i18n'
import { navigate } from '../../router';

export function langBtn(lang: supportedLanguage) {

    const button = document.createElement('button');
    button.textContent = getLaguangeName(lang);
    button.className = 'w-full mx-4 text-lg font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg';

    button.addEventListener('click', async () => {

        setLanguage(lang);

        window.dispatchEvent(new CustomEvent('languageChanged'));

        // close lang modal
        const languageModal = document.getElementById('languageModal');
        if (languageModal) {
            languageModal.remove();
        }

        navigate('/');

    });

    return button;

}
