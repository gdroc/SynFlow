export function createInfoPanel() {
	const infoPanel = document.createElement('div');
	infoPanel.setAttribute('id', 'info-panel');
	infoPanel.style.cssText = `
		margin-top: 20px;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 0 5px rgba(0,0,0,0.1);
	`;
	
	// Créer la barre de titre
	const headerBar = document.createElement('div');
	headerBar.style.cssText = `
		padding: 10px 15px;
		background-color: #f5f5f5;
		border-radius: 8px 8px 0 0;
		border-bottom: 1px solid #ddd;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	`;
	
	// Ajout du titre
	const title = document.createElement('h4');
	title.textContent = 'Info';
	title.style.margin = '0';
	headerBar.appendChild(title);

	// Ajout de l'icône de fermeture
	const chevronIcon = document.createElement('i');
	chevronIcon.className = 'fas fa-chevron-up';
	chevronIcon.style.color = '#666';
	headerBar.appendChild(chevronIcon);

	// Créer le conteneur pour le contenu
	const panelContent = document.createElement('div');
	panelContent.setAttribute('id', 'info-panel-content');
	panelContent.style.cssText = `
		background-color: white;
		border-radius: 0 0 8px 8px;
		transition: max-height 0.3s ease-out;
		overflow: hidden;
		max-height: 0px;  // Initialement caché
	`;

	const infoDiv = document.createElement('div');
	infoDiv.setAttribute('id', 'info');
	infoDiv.style.cssText = `
		background-color: white;
		border-radius: 0 0 8px 8px;
		transition: max-height 0.3s ease-out;
		overflow: hidden;
		max-height: 1000px;  // Initialement caché
	`;

	panelContent.appendChild(infoDiv);

	// Event listener sur headerBar
	headerBar.addEventListener('click', (event) => {
		event.preventDefault();
		if(panelContent.style.maxHeight === '0px' || !panelContent.style.maxHeight) {
			panelContent.style.maxHeight = '1000px';
			chevronIcon.className = 'fas fa-chevron-up';
		} else {
			panelContent.style.maxHeight = '0px';
			chevronIcon.className = 'fas fa-chevron-down';
		}
	});

	// Assemblage final
	infoPanel.appendChild(headerBar);
	infoPanel.appendChild(panelContent);

	return infoPanel;
}

// Ajouter une nouvelle fonction pour rendre visible le panel
export function showInfoPanel() {
    const panelContent = document.getElementById('info-panel-content');
    if (panelContent) {
        panelContent.style.maxHeight = '1000px';
        // Mettre à jour l'icône du bouton
        const hideButton = document.querySelector('#info-panel button');
        if (hideButton) {
            hideButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    }
}

//function qui fait apparaitre un message sur le coté pour dire que la section info a été mise à jour
export function showInfoUpdatedMessage(message = "Info section updated") {
    // Vérifie si un message existe déjà
    let existingMsg = document.getElementById('info-update-toast');
    if (existingMsg) {
        existingMsg.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'info-update-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 70%;
        right: 30px;
        background: black;
		border-right: 4px solid #ffa500;
        color: #fff;
        padding: 12px 24px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-size: 1rem;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
    `;
    document.body.appendChild(toast);

    // Animation d'apparition
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Disparition après 2 secondes
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}