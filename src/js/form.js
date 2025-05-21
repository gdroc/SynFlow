import * as toolkit from '../../../toolkit/toolkit.js';
import { createLegendContainer } from './legend.js';
import { zoom } from './main.js';
import { handleFileUpload } from './process.js';

export function createForm() {
    const form = document.createElement('form');
    form.setAttribute('id', 'file-upload-form');

    // Container principal avec CSS Grid
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: 200px 1fr 450px;
        gap: 20px;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 8px;
    `;

    // Colonne 1 : Menu de sélection
    const menuColumn = document.createElement('div');
    menuColumn.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;

    const menuItems = [
        { id: 'existing', icon: 'fas fa-folder-open', text: 'Existing Files' },
        { id: 'upload', icon: 'fas fa-upload', text: 'Upload Files' },
        { id: 'calculate', icon: 'fas fa-cogs', text: 'Run Calculation' }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.style.cssText = `
            padding: 15px;
            margin: 5px 0;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.3s ease;
        `;
        menuItem.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
        menuItem.setAttribute('data-option', item.id);
        
        menuItem.addEventListener('click', () => {
            // Retirer la classe active de tous les items
            menuColumn.querySelectorAll('div').forEach(div => {
                div.style.backgroundColor = 'transparent';
                div.style.color = '#000';
            });
            // Ajouter la classe active à l'item sélectionné
            menuItem.style.backgroundColor = 'black';
            menuItem.style.color = 'white';
            
            // Afficher le formulaire correspondant
            showForm(item.id);
        });
        
        menuColumn.appendChild(menuItem);
    });

    // Colonne 2 : Zone de contenu dynamique
    const contentColumn = document.createElement('div');
    contentColumn.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;

    // Colonne 3 : Légende
    const legendColumn = document.createElement('div');
    legendColumn.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    legendColumn.innerHTML = `<h3><i class="fas fa-info-circle"></i> Legend</h3>`;
    legendColumn.appendChild(createLegendContainer());

    // Fonction pour afficher le bon formulaire
    function showForm(option) {
        contentColumn.innerHTML = '';
        switch(option) {
            case 'existing':
                contentColumn.appendChild(createExistingFilesForm());
                break;
            case 'upload':
                contentColumn.appendChild(createUploadSection());
                break;
            case 'calculate':
                contentColumn.appendChild(createToolkitContainer());
                break;
        }
    }

    // Ajout des colonnes au container
    gridContainer.appendChild(menuColumn);
    gridContainer.appendChild(contentColumn);
    gridContainer.appendChild(legendColumn);

    form.appendChild(gridContainer);
    const formContainer = document.getElementById('form-container');
    formContainer.appendChild(form);

    // Afficher le formulaire "existing" par défaut
    showForm('existing');
}

// Fonctions helpers pour créer les différents formulaires
function createExistingFilesForm() {
    const div = document.createElement('div');
    div.innerHTML = `
        <h3>Select Existing Files</h3>
        <select id="existing-files" style="width: 100%">
            <option value="">Choose a file...</option>
        </select>
    `;
    return div;
}

// Fonction helper pour créer la section upload (votre code existant)
function createUploadSection() {
    const uploadSection = document.createElement('div');

    // const form = document.createElement('form');
    uploadSection.setAttribute('id', 'file-upload-form');

    // Container for the file inputs and legend
    const inputContainer = document.createElement('div');
    inputContainer.setAttribute('id', 'input-container');
    inputContainer.style.display = 'flex';
    inputContainer.style.justifyContent = 'space-between';
    inputContainer.style.alignItems = 'flex-start';

    // Container for band files
    const bandContainer = document.createElement('div');

    const bandLabel = document.createElement('label');
    bandLabel.setAttribute('for', 'band-files');
    bandLabel.textContent = 'Upload Band Files:';

    const bandInput = document.createElement('input');
    bandInput.setAttribute('type', 'file');
    bandInput.setAttribute('id', 'band-files');
    bandInput.setAttribute('name', 'band-files');
    bandInput.setAttribute('multiple', true);
    bandInput.setAttribute('accept', '.out');
    bandInput.style.display = 'none'; // Cache l'input file par défaut

    // Créer un bouton personnalisé
    const customButton = document.createElement('button');
    customButton.type = 'button';
    customButton.textContent = 'Select Files';
    customButton.style.marginBottom = '10px';
    
    // Div pour afficher les fichiers sélectionnés
    const fileLabel = document.createElement('span');
    fileLabel.textContent = 'No files chosen';
    fileLabel.style.marginLeft = '10px';
    
    // Event listener pour le bouton personnalisé
    customButton.addEventListener('click', () => {
        bandInput.click();
    });
    
    // Mettre à jour le label quand des fichiers sont sélectionnés
    bandInput.addEventListener('change', () => {
        if (bandInput.files.length > 0) {
            fileLabel.textContent = `${bandInput.files.length} file(s) selected`;
        } else {
            fileLabel.textContent = 'No files chosen';
        }
    });

    const bandFileList = document.createElement('div');
    bandFileList.setAttribute('id', 'band-file-list');
    bandFileList.classList.add('file-list');

    bandContainer.appendChild(bandLabel);
    bandContainer.appendChild(document.createElement('br'));
    bandContainer.appendChild(bandInput);
    bandContainer.appendChild(customButton);
    bandContainer.appendChild(fileLabel);
    bandContainer.appendChild(bandFileList);

    // Append containers to input container
    inputContainer.appendChild(bandContainer);

    // Button to load test dataset
    const loadTestButton = document.createElement('button');
    loadTestButton.setAttribute('type', 'button');
    loadTestButton.setAttribute('id', 'load-test');
    loadTestButton.textContent = 'Load Test Data';
    loadTestButton.style.marginLeft = '10px';

    // Event listener for the load test button
    loadTestButton.addEventListener('click', loadTestData);

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'button');
    submitButton.setAttribute('style', 'margin-bottom:20px');
	submitButton.setAttribute('id', 'submit');
    submitButton.textContent = 'Draw';

    submitButton.addEventListener('click', () => {

        const visualizationContainer = document.getElementById('viz');
        visualizationContainer.innerHTML = ''; // Efface le contenu existant

        d3.select("#viz").call(zoom);

        // Ajoutez un groupe à l'intérieur de l'élément SVG pour contenir les éléments zoomables
        d3.select("#viz").append("g").attr("id", "zoomGroup");

        ///////////////changement
        const bandFiles = document.getElementById('band-files').files;
        handleFileUpload(bandFiles);
    });

    // Event listeners for file inputs
    // chrLenInput.addEventListener('change', (event) => {
    //     updateFileList(chrLenInput, genomeList);
    // });

    bandInput.addEventListener('change', (event) => {
        updateFileList(bandInput, bandFileList);
    });

    // Add stack mode checkbox
    const stackModeLabel = document.createElement('label');
    stackModeLabel.setAttribute('for', 'stack-mode');
    stackModeLabel.textContent = 'Stack chromosomes vertically';

    const stackModeCheckbox = document.createElement('input');
    stackModeCheckbox.setAttribute('type', 'checkbox');
    stackModeCheckbox.setAttribute('id', 'stack-mode');
    stackModeCheckbox.setAttribute('name', 'stack-mode');
    stackModeCheckbox.setAttribute('style', 'margin-left: 10px;');

    // Ajouter un écouteur d'événements à la case à cocher
    stackModeCheckbox.addEventListener('change', () => {
        submitButton.click(); // Simuler un clic sur le bouton "Draw"
    });

    // Append elements to form

    uploadSection.appendChild(inputContainer);
    uploadSection.appendChild(stackModeLabel);
    uploadSection.appendChild(stackModeCheckbox);
    uploadSection.appendChild(document.createElement('br'));

    uploadSection.appendChild(submitButton);
    uploadSection.appendChild(loadTestButton);
    // form.appendChild(consoleTitle);  
    // form.appendChild(consoleDiv);

    return uploadSection;
}

export function createToolkitContainer() {
    //////////////////:
    // TOOLKIT
    ///////////////////

    //crée le container pour le module toolkit
    const toolkitContainer = document.createElement("div");
    toolkitContainer.id = "toolkitContainer";    
    toolkitContainer.style.position = "relative"; // Ajout de la position relative

    // Ajout du bouton de fermeture
    const closeButton = document.createElement("div");
    closeButton.innerHTML = "&#10006;"; // Symbole croix (✖)
    closeButton.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        padding: 5px;
        cursor: pointer;
        font-size: 20px;
        color: #666;
    `;
    closeButton.addEventListener("click", () => {
        toolkitContainer.style.display = "none";
    });
    
    toolkitContainer.appendChild(closeButton);
    closeButton.style.display = "none"; // Masquer le bouton par défaut


    document.body.appendChild(toolkitContainer);

    //charge le css de toolkit
    const toolkitCSS = document.createElement("link");
    toolkitCSS.rel = "stylesheet";
    toolkitCSS.href = "../../../toolkit/toolkit.css";
    document.head.appendChild(toolkitCSS);

    // // Bouton pour lancer le calcul
    // const runCalculationButton = document.getElementById('runCalculation');

    // // Event listener pour envoyer l'événement de calcul au serveur
    // runCalculationButton.addEventListener('click', () => {

        toolkitContainer.style.display = "block"; // Afficher le container
        closeButton.style.display = "block"; // Afficher le bouton de fermeture

        // Option pour générer le selecteur de service ou appeler un service spécifique
        const generateSelect = false;
        const serviceName = 'synflow-galaxy';

        //init toolkit
        toolkit.initToolkit(generateSelect, serviceName);

        //reception des resultats de toolkit
        document.addEventListener('ToolkitResultEvent', (event) => {
            const data = event.detail;
            console.log('Data received in other script:', data);
     
            //recupère le chemin vers syri.out
            console.log(data);   

            //data to path
            // data type = /opt/projects/gemo.southgreen.fr/prod/tmp/toolkit_run/toolkit_AmC0Yl-V3-bZ4f9OAAFq/ref_querry.txt
            //path type = https://gemo.southgreen.fr/tmp/toolkit_run/toolkit_AmC0Yl-V3-bZ4f9OAAFq/ref_querry.txt
            const toolkitID = data.split('/')[7];
            const fileName = data.split('/')[8];
            const path = `https://gemo.southgreen.fr/tmp/toolkit_run/${toolkitID}/${fileName}`;
            console.log(path);

            //affiche un bouton dans la console pour charger les fichiers dans le formulaire
            const loadOutputButton = document.createElement('button');
            loadOutputButton.textContent = 'Draw Output';
            loadOutputButton.style.marginLeft = '10px';
            loadOutputButton.style.marginTop = '10px';
            loadOutputButton.style.display = 'block';
            const consoleDiv = document.getElementById('console');
            consoleDiv.appendChild(loadOutputButton);

            // event pour lancer le dessin des fichiers de sortie
            loadOutputButton.addEventListener('click', async (event) => {
                //prevent default
                event.preventDefault();
                try {

                    const response = await fetch(path);
                    const text = await response.text();
                    const fileName = path.split('/').pop();
                    const bandFile = new File([text], fileName, { type: 'text/plain' });
                
                
                    // Creating DataTransfer objects to simulate file upload
                    // const chrLenDataTransfer = new DataTransfer();
                    const bandDataTransfer = new DataTransfer();
                
                    // Add files to the DataTransfer objects
                    bandDataTransfer.items.add(bandFile);
                
                    // Set the files to the input fields
                    const bandInput = document.getElementById('band-files');
                
                    // chrLenInput.files = chrLenDataTransfer.files;
                    bandInput.files = bandDataTransfer.files;
                
                    // Update the file lists
                    // updateFileList(chrLenInput, document.getElementById('chrlen-file-list'));
                    updateFileList(bandInput, document.getElementById('band-file-list'));
                } catch (error) {
                    console.error('Error fetching the file:', error);
                }
            });
        })
    // });
    // const formContainer = document.getElementById('form-container');
    // formContainer.appendChild(toolkitContainer);
    return toolkitContainer;
}




function updateFileList(inputElement, fileListElement) {
    const files = inputElement.files;
    fileListElement.innerHTML = ''; // Clear the previous file list
    for (let i = 0; i < files.length; i++) {
        const listItem = document.createElement('div');
        listItem.textContent = files[i].name;
        fileListElement.appendChild(listItem);
    }
}




function readChromosomeLengths(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const lengths = {};
            const lines = event.target.result.split('\n');
            lines.forEach(line => {
                const parts = line.split('\t');
                if (parts.length === 2) {
                    lengths[parts[0]] = +parts[1];
                }
            });
            resolve(lengths);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

export let genomeLengths = {};

export function loadAllChromosomeLengths(files) {
    const lengthPromises = Array.from(files).map(file => {
        const genome = file.name.replace('.chrlen', ''); // Extraire le nom du génome sans l'extension
        return readChromosomeLengths(file).then(lengths => {
            genomeLengths[genome] = lengths;
        });
    });
    return Promise.all(lengthPromises);
}

async function loadTestData() {
    // Define paths to your test files
    const testBandFiles = [
        'public/data/C21_464_C23_A03.out',
        'public/data/C23_A03_C45_410.out',
        'public/data/C45_410_C5_126_2.out',
        'public/data/DH_200_94_C21_464.out'
    ];

    const bandFiles = await Promise.all(testBandFiles.map(async path => {
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
}