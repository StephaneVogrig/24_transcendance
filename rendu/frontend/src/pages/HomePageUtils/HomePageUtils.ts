import { API_BASE_URL, BASE_URL } from '../../config.ts';

export const createNavLink = (text: string, route: string, loginLogout?: string): HTMLButtonElement => {
	const link = document.createElement('button');
	link.setAttribute('data-route', route);
	link.className = loginLogout || 'btn btn-secondary text-center';
	link.textContent = text;
	return link;
};

export async function sendRegister(serviceUrl: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${serviceUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( data )
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const result = await response.json();
    console.debug(`Succesfully registered to ${serviceUrl}`, result);
    return result;
}
