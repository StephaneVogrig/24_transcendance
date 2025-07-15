import { createSky } from './3d/background';

export class AppLayout {
	private static instance: AppLayout;
	private layoutElement: HTMLElement;
	private backgroundLayer: HTMLElement;
	private contentLayer: HTMLElement;

	private constructor() {
		this.initializeLayout();
	}

	public static getInstance(): AppLayout {
		if (!AppLayout.instance)
			AppLayout.instance = new AppLayout();
		return AppLayout.instance;
	}

	private initializeLayout(): void {
		// Container principal
		this.layoutElement = document.createElement('div');
		this.layoutElement.className = 'min-h-screen relative bg-black text-blue-600 overflow-hidden flex flex-col';

		// Background layer
		this.backgroundLayer = document.createElement('div');
		this.backgroundLayer.className = 'fixed inset-0 z-0';
		this.backgroundLayer.appendChild(createSky());
		this.layoutElement.appendChild(this.backgroundLayer);

		// Titre
		const titreDiv = document.createElement('div');
		titreDiv.className = 'flex flex-col items-center mt-20 animate-bounce';
		const h1 = document.createElement('h1');
		h1.className = 'text-7xl font-bold';
		h1.textContent = 'VIIIITE';
		titreDiv.appendChild(h1);
		const h2 = document.createElement('h2');
		h2.className = 'text-2xl font-bold';
		h2.textContent = 'a quick-build pong';
		titreDiv.appendChild(h2);

		this.layoutElement.appendChild(titreDiv);

		// Content layer
		this.contentLayer = document.createElement('div');
		this.contentLayer.className = 'relative z-10 flex flex-col items-center justify-center p-4 flex-grow min-h-0';
		this.contentLayer.id = 'main-content';

		this.layoutElement.appendChild(this.contentLayer);
	}

	public getLayout(): HTMLElement {
		return this.layoutElement;
	}

	public updateContent(content: HTMLElement): void {
        this.contentLayer.replaceChildren(content);
		this.contentLayer.style.opacity = '1';
	}
}
