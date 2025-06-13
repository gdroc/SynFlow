import * as toolkit from '../../../toolkit/toolkit.js';
import { createLegendContainer } from './legend.js';
import { zoom } from './draw.js';
import { handleFileUpload } from './process.js';

export function createForm() {
    const form = document.createElement('form');
    form.setAttribute('id', 'file-upload-form');

    // Créer un conteneur pour le titre qui reste toujours visible
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
    title.textContent = 'Input Selection';
    title.style.margin = '0';
    headerBar.appendChild(title);

    // Ajout de l'icône de fermeture
    const chevronIcon = document.createElement('i');
    chevronIcon.className = 'fas fa-chevron-up';
    chevronIcon.style.color = '#666';
    headerBar.appendChild(chevronIcon);

    // Créer un conteneur pour le contenu
    const formContent = document.createElement('div');
    formContent.setAttribute('id', 'form-content');
    formContent.style.cssText = `
        background-color: white;
        transition: max-height 0.3s ease-out;
        overflow: hidden;
        max-height: 1000px; // Valeur initiale suffisamment grande
    `;

    // Event listener sur headerBar
    headerBar.addEventListener('click', (event) => {
        event.preventDefault();
        if(formContent.style.maxHeight === '0px' || !formContent.style.maxHeight) {
            formContent.style.maxHeight = formContent.scrollHeight + 'px';
            chevronIcon.className = 'fas fa-chevron-up';
        } else {
            formContent.style.maxHeight = '0px';
            chevronIcon.className = 'fas fa-chevron-down';
        }
    });

    // Container principal avec CSS Grid
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 20px;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 0 0 8px 8px;
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

    // Ajouter le bouton et le contenu au formulaire    
    form.appendChild(headerBar);
    form.appendChild(formContent);
    formContent.appendChild(gridContainer);  // Ne garder que cette ligne

    // Afficher le formulaire "existing" par défaut
    // Ajouter la classe active à l'item sélectionné
    //selectionne la dive "existing" par défaut
    const selectedItem = menuColumn.querySelector(`div[data-option="existing"]`);
    selectedItem.style.backgroundColor = 'black';
    selectedItem.style.color = 'white';
    showForm('existing');
    return form;
}

//fonction hide form
export function hideForm() {
    const formContent = document.getElementById('form-content');
    if (formContent) {
        formContent.style.maxHeight = '0px';
        const chevronIcon = document.querySelector('#file-upload-form i');
        chevronIcon.className = 'fas fa-chevron-down';

    }
}

// Fonctions helpers pour créer les différents formulaires
function createExistingFilesForm() {
    const div = document.createElement('div');
    div.innerHTML = `
        <h5>Select Existing Files</h5>
        <select id="existing-files" style="width: 100%">
            <option value="">Choose a file...</option>
        </select>
    `;
    return div;
}

// Fonction helper pour créer la section upload (votre code existant)
function createUploadSection() {
    const uploadSection = document.createElement('div');
    uploadSection.setAttribute('id', 'file-upload-form');
    uploadSection.style.display = 'flex';
    uploadSection.style.gap = '20px';

    // Container pour le formulaire (partie gauche)
    const formContainer = document.createElement('div');
    formContainer.style.flex = '1';

    // Container pour l'aide (partie droite)
    const helpContainer = document.createElement('div');
    helpContainer.style.flex = '0 0 600px'; // Largeur fixe de 400px
    helpContainer.style.padding = '15px';
    helpContainer.style.backgroundColor = '#f8f9fa';
    helpContainer.style.borderRadius = '5px';
    helpContainer.style.border = '1px solid #dee2e6';
    helpContainer.style.maxHeight = '600px'; // Hauteur maximale
    helpContainer.style.overflowY = 'auto'; // Scroll si le contenu dépasse

    // Contenu de l'aide
    helpContainer.innerHTML = `
        <h5>File Requirements</h5>
        <div style="margin-top: 15px;">
            <h6>Syri Output Files (.out)</h6>
            <ul style="padding-left: 20px;">
                <li>Files must be in Syri output format</li>
                <li>The file names should follow the pattern: genome1_genome2.out</li>
                <li>Files can be chained for multiple genome comparisons:</li>
            </ul>
            
            <div style="margin: 15px 0; padding: 10px; background-color: #fff; border-radius: 4px;">
                <strong>Example of file chain:</strong>
                <ul style="padding-left: 20px;">
                    <li>A_thaliana_C_rubella.out</li>
                    <li>C_rubella_B_rapa.out</li>
                    <li>B_rapa_O_sativa.out</li>
                </ul>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    This will create a visualization chain: A_thaliana → C_rubella → B_rapa → O_sativa
                </p>
            </div>

            <div style="margin-top: 15px;">
                <h6>File Format Example:</h6>
                <pre style="background-color: #eee; padding: 10px; border-radius: 4px; font-size: 12px;">
    #type  source  chr_source  start_source  end_source  target  chr_target  start_target  end_target  comments
    SYN    A_tha   1          1000          2000        C_rub   1          1200          2200        ID=1
    INV    A_tha   2          3000          4000        C_rub   2          5000          6000        ID=2</pre>
            </div>
        </div>
    `;

    // Container for the file inputs and legend
    const inputContainer = document.createElement('div');
    inputContainer.setAttribute('id', 'input-container');
    inputContainer.style.display = 'flex';
    inputContainer.style.justifyContent = 'space-between';
    inputContainer.style.alignItems = 'flex-start';

    // Container for band files
    const bandContainer = document.createElement('div');

    const bandH5 = document.createElement('h5');
    bandH5.textContent = 'Upload Syri output files';

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
    customButton.classList.add('btn-simple');
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

    bandContainer.appendChild(bandH5);
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
    loadTestButton.classList.add('btn-simple');
    loadTestButton.setAttribute('id', 'load-test');
    loadTestButton.textContent = 'Load Test Data';

    // Event listener for the load test button
    loadTestButton.addEventListener('click', loadTestData);

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'button');
    submitButton.classList.add('btn-magic');
    submitButton.setAttribute('style', 'margin-bottom:20px');
	submitButton.setAttribute('id', 'submit');
    submitButton.style.marginLeft = '10px';
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

    bandInput.addEventListener('change', (event) => {
        updateFileList(bandInput, bandFileList);
    });


     // Boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.appendChild(loadTestButton);
    buttonContainer.appendChild(submitButton);

    // Assemblage final
    formContainer.appendChild(inputContainer);
    formContainer.appendChild(buttonContainer);
    
    uploadSection.appendChild(document.createElement('br'));
    uploadSection.appendChild(formContainer);
    uploadSection.appendChild(helpContainer);

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
        // const serviceName = 'synflow-galaxy';
        const serviceName = 'synflow';

        //init toolkit
        toolkit.initToolkit(generateSelect, serviceName);

        //reception des resultats de toolkit
        document.addEventListener('ToolkitResultEvent', (event) => {
            const data = event.detail;
            console.log('Data received in other script:', data);

            //C'etait pour galaxy, c'est géré dans toolkit maintenant
            //data to path
            // data type = /opt/projects/gemo.southgreen.fr/prod/tmp/toolkit_run/toolkit_AmC0Yl-V3-bZ4f9OAAFq/ref_querry.txt
            //path type = https://gemo.southgreen.fr/tmp/toolkit_run/toolkit_AmC0Yl-V3-bZ4f9OAAFq/ref_querry.txt
            // const toolkitID = data.split('/')[7];
            // const fileName = data.split('/')[8];
            // const path = `https://gemo.southgreen.fr/tmp/toolkit_run/${toolkitID}/${fileName}`;
            // console.log(path);

            const path = data;

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

                    // Sélectionne et affiche l'onglet 'upload'
                    const menuColumn = document.querySelector('[data-option="upload"]');
                    if (menuColumn) menuColumn.click();

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