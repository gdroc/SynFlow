export function createInfoPanel() {
    const container = document.createElement('div');
    container.setAttribute('id', 'info-panel');
	container.style.cssText = `
		margin-top: 20px;
	`

    // Header
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

    const title = document.createElement('h4');
    title.textContent = 'Info';
    title.style.margin = '0';
    headerBar.appendChild(title);

    const chevronIcon = document.createElement('i');
    chevronIcon.className = 'fas fa-chevron-up';
    chevronIcon.style.color = '#666';
    headerBar.appendChild(chevronIcon);

    // Contenu déroulant
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        background-color: white;
        overflow: hidden;
        max-height: 1000px;
        transition: max-height 0.3s ease-out;
    `;

    headerBar.addEventListener('click', (event) => {
        event.preventDefault();
        const isCollapsed = contentWrapper.style.maxHeight === '0px';
        contentWrapper.style.maxHeight = isCollapsed ? '1000px' : '0px';
        chevronIcon.className = isCollapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    });

    // Conteneur principal
    const panelContainer = document.createElement('div');
    panelContainer.style.cssText = `
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 0 0 8px 8px;
    `;

    // Barre d'onglets horizontale
    const tabBar = document.createElement('div');
    tabBar.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
		background-color: white;
		border-radius: 5px;
		box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px;
    `;
	// style="padding: 15px; background-color: white; border-radius: 5px; box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px;"

    const menuItems = [
        { id: 'anchors', icon: 'fas fa-project-diagram', text: 'Orthology' },
        { id: 'details', icon: 'fas fa-info-circle', text: 'Band details' }
    ];

    const tabs = {};

    menuItems.forEach(item => {
        const tab = document.createElement('div');
        tab.setAttribute('data-option', item.id);
        tab.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 5px;
            background-color: transparent;
            color: #000;
            transition: all 0.3s ease;
            font-weight: 500;
        `;
        tab.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;

        tab.addEventListener('click', () => {
            // Reset tabs
            Object.values(tabs).forEach(t => {
                t.style.backgroundColor = 'transparent';
                t.style.color = '#000';
            });
            // Activate current tab
            tab.style.backgroundColor = 'black';
            tab.style.color = 'white';
            // Display content
            showInfoSection(item.id);
        });

        tabs[item.id] = tab;
        tabBar.appendChild(tab);
    });

    // Zone de contenu principale
    const contentBox = document.createElement('div');
    contentBox.style.cssText = `
        background-color: white;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
        overflow: hidden;
    `;

    const anchorsDiv = document.createElement('div');
    anchorsDiv.setAttribute('id', 'anchors');
    anchorsDiv.style.display = 'none';

    const anchorsDrawDiv = document.createElement('div');
    anchorsDrawDiv.setAttribute('id', 'zoomed-synteny');
    anchorsDiv.appendChild(anchorsDrawDiv);

    const anchorsTableDiv = document.createElement('div');
    anchorsTableDiv.setAttribute('id', 'orthology-table');
    anchorsDiv.appendChild(anchorsTableDiv);

    const infoDiv = document.createElement('div');
    infoDiv.setAttribute('id', 'info');
    infoDiv.style.display = 'none';

    contentBox.appendChild(anchorsDiv);
    contentBox.appendChild(infoDiv);

    // Switch content
    function showInfoSection(option) {
        anchorsDiv.style.display = 'none';
        infoDiv.style.display = 'none';
        if (option === 'anchors') anchorsDiv.style.display = 'block';
        else if (option === 'details') infoDiv.style.display = 'block';
    }

    // Assemblage final
    panelContainer.appendChild(tabBar);
    panelContainer.appendChild(contentBox);
    contentWrapper.appendChild(panelContainer);
    container.appendChild(headerBar);
    container.appendChild(contentWrapper);

    // Onglet par défaut
    tabs['anchors'].style.backgroundColor = 'black';
    tabs['anchors'].style.color = 'white';
    showInfoSection('anchors');

    return container;
}



// Ajouter une nouvelle fonction pour rendre visible le panel
export function showInfoPanel() {
    const panelContent = document.getElementById('info-panel-content');
    if (panelContent) {
        panelContent.style.maxHeight = '2000px';
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