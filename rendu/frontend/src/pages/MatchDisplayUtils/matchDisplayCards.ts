
const empty = (emptyMessage: string): HTMLElement => 
{
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'text-center py-4 text-gray-500';
    emptyDiv.innerHTML = `
        <div class="text-2xl mb-1">🎮</div>
        <p class="text-xs">${emptyMessage}</p>
    `;
    return emptyDiv;
};

// Interface pour createCard
export interface CardConfig<T> {
    title: string;
    items: T[];
    emptyMessage: string;
    itemRenderer: (item: T) => HTMLElement;
    className?: string;
    maxHeight?: string;
}

// Fonction générique pour créer des cartes avec différents types de contenu
export const createCard = <T>(config: CardConfig<T>): HTMLElement => {

    const card = document.createElement('div');
    card.className = config.className || 'bg-white rounded-lg shadow-lg p-3';

    // Header de la carte
    const cardHeader = document.createElement('div');
    cardHeader.className = 'flex items-center justify-between mb-2 pb-2 border-b';
    
    const cardTitle = document.createElement('h2');
    cardTitle.className = 'text-sm font-bold text-gray-800';
    cardTitle.textContent = config.title;
    
    cardHeader.appendChild(cardTitle);
    card.appendChild(cardHeader);

    // Conteneur des éléments
    const itemList = document.createElement('div');
    itemList.className = `space-y-2 ${config.maxHeight || 'max-h-60'} overflow-y-auto`;

    if (config.items.length === 0) 
    {
        const emptyDiv = empty(config.emptyMessage);
        itemList.appendChild(emptyDiv);
    } 
    else 
    {
        config.items.forEach(item => {
            const itemElement = config.itemRenderer(item);
            itemList.appendChild(itemElement);
        });
    }

    card.appendChild(itemList);
    return card;
};
