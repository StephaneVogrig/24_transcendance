export function teamMember(firstName: string, lastName: string, imgName: string): HTMLElement {

    const li = document.createElement('li');

    const div = document.createElement('div');
    div.className = 'flex flex-col items-center';
    li.appendChild(div);

    const img = document.createElement('img');
    img.className = 'w-full sm: max-w-36 md:max-w-48 aspect-square rounded-full object-cover';
    const imageUrl = new URL(`../../assets/${imgName}.jpg`, import.meta.url).href;
    img.src = imageUrl;
    div.appendChild(img);

    const firstNameTxt = document.createElement('h3');
    firstNameTxt.className = 'text-center font-semibold text-blue-200 mt-4';
    firstNameTxt.textContent = firstName;
    div.appendChild(firstNameTxt);

    const lastNametxt = document.createElement('h3');
    lastNametxt.className = 'text-center font-semibold text-blue-200';
    lastNametxt.textContent = lastName;
    div.appendChild(lastNametxt);

    return li;
};
