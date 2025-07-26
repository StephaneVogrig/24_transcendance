            

            export const Connected = (user: any, userInfoDiv: HTMLDivElement): void => 
            {

                if (user)  // utilisateur connecté
                    {
                        const createElement = <K extends keyof HTMLElementTagNameMap>(
                            tag: K,
                            options: { text?: string; className?: string }
                        ): HTMLElementTagNameMap[K] => {
                            const element = document.createElement(tag);
                            if (options.text) element.textContent = options.text;
                            if (options.className) element.className = options.className;
                            return element;
                        };

                        // Title
                        const infoTitle = createElement('h3', {
                            text: 'Informations Utilisateur',
                            className: 'text-lg font-semibold text-gray-800 mb-4',
                        });
                        userInfoDiv.appendChild(infoTitle);

                        // Main container for user details
                        const detailsContainer = createElement('div', { className: 'space-y-3' });
                        userInfoDiv.appendChild(detailsContainer);

                        // --- Top section: Avatar, Name, Email ---
                        const topSection = createElement('div', { className: 'flex items-center space-x-4' });
                        detailsContainer.appendChild(topSection);

                        // Avatar image
                        const avatarImg = createElement('img', {
                            className: 'w-16 h-16 rounded-full border-2 border-gray-200',
                        }) as HTMLImageElement;
                        avatarImg.src = user.picture || '/assets/default-avatar.png';
                        avatarImg.alt = 'Avatar';
                        avatarImg.onerror = () => { avatarImg.src = '/assets/default-avatar.png'; };
                        topSection.appendChild(avatarImg);

                        // Name and Email container
                        const nameEmailDiv = createElement('div', {});
                        topSection.appendChild(nameEmailDiv);

                        nameEmailDiv.appendChild(
                            createElement('p', {
                                text: user.name || 'N/A',
                                className: 'font-semibold text-gray-800',
                            })
                        );
                        nameEmailDiv.appendChild(
                            createElement('p', {
                                text: user.email || 'N/A',
                                className: 'text-gray-600',
                            })
                        );

                        // --- Bottom section: Nickname ---
                        const nicknameSection = createElement('div', { className: 'bg-gray-50 p-3 rounded-lg' });
                        detailsContainer.appendChild(nicknameSection);

                        nicknameSection.appendChild(
                            createElement('p', {
                                text: 'Nickname',
                                className: 'text-sm font-medium text-gray-500',
                            })
                        );
                        nicknameSection.appendChild(
                            createElement('p', {
                                text: user.nickname || 'N/A',
                                className: 'text-sm text-gray-800',
                            })
                        );
                    } 
                    else // si erreur lors de la récupération des informations utilisateur 
                    {
                        userInfoDiv.innerHTML = `
                            <div class="text-center text-yellow-600">
                                <p>Impossible de récupérer les informations utilisateur</p>
                            </div>
                        `;
                    }
            }
              
            export const notConnected = (statusDiv: HTMLDivElement, userInfoDiv: HTMLDivElement,
                 actionsDiv: HTMLDivElement): void =>  
            {
                statusDiv.innerHTML = ''; // Vider le contenu précédent
                const statusContent = document.createElement('div');
                statusContent.className = 'text-center';

                const icon = document.createElement('div');
                icon.className = 'text-red-600 text-6xl mb-4';
                icon.textContent = '❌';

                const statusTitle = document.createElement('h3');
                statusTitle.className = 'text-xl font-semibold text-red-600 mb-2';
                statusTitle.textContent = 'Utilisateur Non Connecté';

                statusContent.appendChild(icon);
                statusContent.appendChild(statusTitle);
                statusDiv.appendChild(statusContent);

                userInfoDiv.innerHTML = ''; // Vider le contenu précédent
                const userInfoContent = document.createElement('div');
                userInfoContent.className = 'text-center text-gray-500';
                const userInfoText = document.createElement('p');
                userInfoText.textContent = 'Connectez-vous pour voir vos informations';
                userInfoContent.appendChild(userInfoText);
                userInfoDiv.appendChild(userInfoContent);

                // Actions pour utilisateur non connecté
                actionsDiv.innerHTML = ''; // Vider le contenu précédent
                const actionsTitle = document.createElement('h3');
                actionsTitle.className = 'text-lg font-semibold text-gray-800 mb-4';
                actionsTitle.textContent = 'Actions';

                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'flex flex-wrap gap-4';

                const loginButton = document.createElement('button');
                loginButton.id = 'login-btn';
                loginButton.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200';
                loginButton.textContent = 'Se Connecter';

                actionsContainer.appendChild(loginButton);
                actionsDiv.appendChild(actionsTitle);
                actionsDiv.appendChild(actionsContainer);

                // Ajouter les événements
                // const loginBtn = actionsDiv.querySelector('#login-btn') as HTMLButtonElement;
                // const refreshBtn = actionsDiv.querySelector('#refresh-btn') as HTMLButtonElement;

                // loginBtn?.addEventListener('click', () => navigate('/login'));
                // refreshBtn?.addEventListener('click', () => updateStatus());
        }