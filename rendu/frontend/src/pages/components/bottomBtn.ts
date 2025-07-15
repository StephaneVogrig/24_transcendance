import { navigate } from '../../router';

export function bottomBtn(title: string, route: string): HTMLElement {

    const div = document.createElement('div');
    div.className = 'absolute inset-x-0 bottom-5 flex flex-col';

    const button = document.createElement('button');
    button.textContent = title;
    button.className = `text-lg font-semibold transition-transform transform hover:scale-110`;
    button.addEventListener('click', async () => {
        navigate(route);
    });

    div.appendChild(button);

    return div;
}
