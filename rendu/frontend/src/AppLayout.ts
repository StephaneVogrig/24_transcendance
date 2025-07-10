import { createSky } from './3d/skybox';

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
		this.layoutElement.className = 'min-h-screen relative bg-black text-white overflow-hidden';

		// Background layer
		this.backgroundLayer = document.createElement('div');
		this.backgroundLayer.className = 'fixed inset-0 z-0';
		this.backgroundLayer.appendChild(createSky());

		// Content layer
		this.contentLayer = document.createElement('div');
		this.contentLayer.className = 'relative z-10 flex flex-col items-center justify-center min-h-screen p-4';
		this.contentLayer.id = 'main-content';

		this.layoutElement.appendChild(this.backgroundLayer);
		this.layoutElement.appendChild(this.contentLayer);
	}

	public getLayout(): HTMLElement {
		return this.layoutElement;
	}

	public updateContent(content: HTMLElement): void {
		 // Transition fluide
        // this.contentLayer.style.opacity = '0';
        // this.contentLayer.style.transition = 'opacity 0.2s ease-in-out';
		this.contentLayer.innerHTML = '';
		this.contentLayer.appendChild(content);
		this.contentLayer.style.opacity = '1';
        // setTimeout(() => {
        //     // Vider seulement le contenu, pas tout le layout
        //     this.contentLayer.innerHTML = '';
        //     this.contentLayer.appendChild(content);
        //     this.contentLayer.style.opacity = '1';
        // }, 100);
	}
}