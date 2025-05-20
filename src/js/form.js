import * as toolkit from '../../../toolkit/toolkit.js';

export function createForm() {
    const form = document.createElement('form');
    form.setAttribute('id', 'file-upload-form');

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

    // Bouton pour lancer le calcul
    const runCalculationButton = document.createElement('button');
    runCalculationButton.setAttribute('type', 'button');
    runCalculationButton.setAttribute('id', 'runCalculation');
    runCalculationButton.textContent = 'Lancer le calcul';
    runCalculationButton.style.marginLeft = '10px';

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

    // Event listener pour envoyer l'événement de calcul au serveur
    runCalculationButton.addEventListener('click', () => {

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
    });

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'button');
    submitButton.setAttribute('style', 'margin-bottom:20px');
	submitButton.setAttribute('id', 'submit');
    submitButton.textContent = 'Draw';

    

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

    form.appendChild(inputContainer);
    form.appendChild(stackModeLabel);
    form.appendChild(stackModeCheckbox);
    form.appendChild(document.createElement('br'));

    form.appendChild(submitButton);
    form.appendChild(loadTestButton);
    form.appendChild(runCalculationButton); 
    // form.appendChild(consoleTitle);  
    // form.appendChild(consoleDiv);
    form.appendChild(toolkitContainer);

    const formContainer = document.getElementById('form-container');
	formContainer.appendChild(form);

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

// export function calculateGlobalMaxChromosomeLengths(genomeLengths) {
//     const globalMaxLengths = {};
//     for (const genome in genomeLengths) {
//         const lengths = genomeLengths[genome];
//         for (const chr in lengths) {
//             if (!globalMaxLengths[chr] || lengths[chr] > globalMaxLengths[chr]) {
//                 globalMaxLengths[chr] = lengths[chr];
//             }
//         }
//     }
//     return globalMaxLengths;
// }

async function loadTestData() {
    // Define paths to your test files
    // const testChrLenFiles = [
    //     'public/data/C5_126_2.chrlen',
    //     'public/data/C21_464.chrlen',
    //     'public/data/C23_A03.chrlen',
    //     'public/data/C45_410.chrlen',
    //     'public/data/DH_200_94.chrlen'
    // ];

    const testBandFiles = [
        'public/data/C21_464_C23_A03.out',
        'public/data/C23_A03_C45_410.out',
        'public/data/C45_410_C5_126_2.out',
        'public/data/DH_200_94_C21_464.out'
    ];

    // Fetch file contents and create File objects
    // const chrLenFiles = await Promise.all(testChrLenFiles.map(async path => {
    //     const response = await fetch(path);
    //     const text = await response.text();
    //     const fileName = path.split('/').pop();
    //     return new File([text], fileName, { type: 'text/plain' });
    // }));

    const bandFiles = await Promise.all(testBandFiles.map(async path => {
        const response = await fetch(path);
        const text = await response.text();
        const fileName = path.split('/').pop();
        return new File([text], fileName, { type: 'text/plain' });
    }));

    // Creating DataTransfer objects to simulate file upload
    // const chrLenDataTransfer = new DataTransfer();
    const bandDataTransfer = new DataTransfer();

    // Add files to the DataTransfer objects
    // chrLenFiles.forEach(file => chrLenDataTransfer.items.add(file));
    bandFiles.forEach(file => bandDataTransfer.items.add(file));

    // Set the files to the input fields
    // const chrLenInput = document.getElementById('chrlen-files');
    const bandInput = document.getElementById('band-files');

    // chrLenInput.files = chrLenDataTransfer.files;
    bandInput.files = bandDataTransfer.files;

    // Update the file lists
    // updateFileList(chrLenInput, document.getElementById('chrlen-file-list'));
    updateFileList(bandInput, document.getElementById('band-file-list'));
}