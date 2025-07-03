import * as toolkit from './toolkit.js';

//crée le container pour le module toolkit
const toolkitContainer = document.createElement("div");
toolkitContainer.id = "toolkitContainer";  
//ajouter le conteneur au body ou un autre conteneur  
document.body.appendChild(toolkitContainer);

// Option pour générer le selecteur de service ou appeler un service spécifique
const generateSelect = true;
const serviceName = 'synflow';

//init toolkit
toolkit.initToolkit(generateSelect, serviceName);
