export const createNavLink = (text: string, route: string, loginLogout?: string): HTMLAnchorElement => {
	const link = document.createElement('a');
	link.setAttribute('data-route', route);
	link.className = loginLogout || 'btn btn-secondary text-center';
	link.textContent = text;
	return link;
};
