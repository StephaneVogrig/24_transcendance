export function joinButton(title: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = title;
    button.className = 'btn btn-primary text-center';
    button.disabled = true;
    return button;
}
