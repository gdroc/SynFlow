import { createForm, updateFileList } from './form.js';
import { createControlPanel } from './legend.js';
import { createGraphSection } from './draw.js';
import { setupAnalytics } from './analytics.js';
import { createInfoPanel } from './info.js';
import * as toolkit from '../../toolkit/toolkit.js';
// console.log("syri");
// Définir le comportement de zoom
// export const zoom = d3.zoom()
//     .scaleExtent([0.1, 10]) // Définir les niveaux de zoom minimum et maximum
//     .on("zoom", (event) => {
//     d3.select('#zoomGroup').attr("transform", event.transform);
// });

document.addEventListener('DOMContentLoaded', () => {

    const mainContainer = document.getElementById('main-container');
    createForm().then(form => {                 
        mainContainer.appendChild(form);
        mainContainer.appendChild(createControlPanel());
        mainContainer.appendChild(createGraphSection());
        mainContainer.appendChild(createInfoPanel());
    });

    setupAnalytics();

    //check si l'url contient un toolkitID exemple :
    // https://synflow.southgreen.fr/?id=toolkit_jD1prpcgQajoO2umAAAV
    // https://dev-visusnp.southgreen.fr/synflow/?id=toolkit_aryvzv9jHAIWUBSVAAZ4
    const urlParams = new URLSearchParams(window.location.search);
    const toolkitID = urlParams.get('id');
    if (toolkitID) {
        console.log('Toolkit ID trouvé dans l\'URL :', toolkitID);

        //init toolkit
        toolkit.loadSocketIOScript()
            .then(() => {
                console.log('Socket.IO chargé avec succès.');
                toolkit.initSocketConnection();  // Initialiser la connexion après le chargement
            })
            .then(() => {
                console.log('envoieeeeeeee');
                //declenche un event vers toolkit.js
                const event = new CustomEvent('toolkitID', { detail: toolkitID });
                document.dispatchEvent(event);
            });

    }       

    document.addEventListener('toolkitFilesFromID', async (event) => {
        const files = event.detail;
        console.log('Fichiers reçus de l\'ID du toolkit :', files);
        
        // Sélectionne et affiche l'onglet 'upload'
        const menuColumn = document.querySelector('[data-option="upload"]');
        if (menuColumn) menuColumn.click();

        const bandFiles = await Promise.all(files.map(async path => {
            const response = await fetch(path);
            const text = await response.text();
            const fileName = path.split('/').pop();
            return new File([text], fileName, { type: 'text/plain' });
        }));

        // Creating DataTransfer objects to simulate file upload
        const bandDataTransfer = new DataTransfer();

        // Add files to the DataTransfer objects
        bandFiles.forEach(file => bandDataTransfer.items.add(file));

        // Set the files to the input fields
        const bandInput = document.getElementById('band-files');

        // chrLenInput.files = chrLenDataTransfer.files;
        bandInput.files = bandDataTransfer.files;

        // Update the file lists
        updateFileList(bandInput, document.getElementById('band-file-list'));
    });


});

