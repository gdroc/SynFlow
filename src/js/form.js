import { drawMiniChromosome } from "./draw.js";
import * as toolkit from '../../../toolkit/toolkit.js';

export function createForm() {
    const form = document.createElement('form');
    form.setAttribute('id', 'file-upload-form');

    // Container for the file inputs and legend
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.justifyContent = 'space-between';
    inputContainer.style.alignItems = 'flex-start';

    // Container for chromosome length files
    const chrLenContainer = document.createElement('div');

    const chrLenLabel = document.createElement('label');
    chrLenLabel.setAttribute('for', 'chrlen-files');
    chrLenLabel.textContent = 'Upload Chromosome Length Files:';

    const chrLenInput = document.createElement('input');
    chrLenInput.setAttribute('type', 'file');
    chrLenInput.setAttribute('id', 'chrlen-files');
    chrLenInput.setAttribute('name', 'chrlen-files');
    chrLenInput.setAttribute('multiple', true);
    chrLenInput.setAttribute('accept', '.chrlen');

    const chrLenFileList = document.createElement('div');
    chrLenFileList.setAttribute('id', 'chrlen-file-list');
    chrLenFileList.setAttribute('style', 'margin-bottom:20px');
    chrLenFileList.classList.add('file-list');

    chrLenContainer.appendChild(chrLenLabel);
    chrLenContainer.appendChild(document.createElement('br'));
    chrLenContainer.appendChild(chrLenInput);
    chrLenContainer.appendChild(chrLenFileList);

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

    const bandFileList = document.createElement('div');
    bandFileList.setAttribute('id', 'band-file-list');
    bandFileList.classList.add('file-list');

    bandContainer.appendChild(bandLabel);
    bandContainer.appendChild(document.createElement('br'));
    bandContainer.appendChild(bandInput);
    bandContainer.appendChild(bandFileList);

    // Append containers to input container
    inputContainer.appendChild(chrLenContainer);
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
    document.body.appendChild(toolkitContainer);

    // Event listener pour envoyer l'événement de calcul au serveur
    runCalculationButton.addEventListener('click', () => {

        // Option pour générer le selecteur de service ou appeler un service spécifique
        const generateSelect = false;
        const serviceName = 'synflow';

        //init toolkit
        toolkit.initToolkit(generateSelect, serviceName);

        //reception des resultats du serveur
        socket.on('outputResult', (result) => {
            //recupère les urls des fichiers chrlen et syri.out
            //affiche un bouton dans la console pour charger les fichiers dans le formulaire
            //affiche un bouton pour dessiner le graphe            
        })
    });

    // Container for legend
    const legendContainer = document.createElement('div');
    legendContainer.setAttribute('id', 'legend-container');
    legendContainer.style.marginLeft = '20px';
    legendContainer.style.borderLeft = '1px solid #ccc';
    legendContainer.style.paddingLeft = '20px';

    const legendDiv = document.createElement('div');
    legendDiv.setAttribute('id', 'legend');

    legendContainer.appendChild(legendDiv);

    // Append legend container to input container
    inputContainer.appendChild(legendContainer);

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'button');
    submitButton.setAttribute('style', 'margin-bottom:20px');
	submitButton.setAttribute('id', 'submit');
    submitButton.textContent = 'Draw';

    

    // Event listeners for file inputs
    chrLenInput.addEventListener('change', (event) => {
        updateFileList(chrLenInput, chrLenFileList);
    });

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

export function reorderFileList(fileListElement, orderedFileNames, fileType) {
    console.log(fileListElement);
    console.log(orderedFileNames);
    console.log(fileType);

    // Marquer l'élément comme en train de se réorganiser
    fileListElement.classList.add('reordering');

    // Attendre que les transitions CSS prennent effet
    setTimeout(() => {
        fileListElement.innerHTML = ''; // Clear the previous file list

        orderedFileNames.forEach((fileName, index) => {
            const listItem = document.createElement('div');
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'center';

            const genome = fileName.replace(`.${fileType}`, '');

            if (fileType === 'chrlen') {
                // Créer un SVG pour le mini chromosome
                const miniChromosomeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                miniChromosomeSvg.setAttribute("width", "50");
                miniChromosomeSvg.setAttribute("height", "20");
                miniChromosomeSvg.style.marginRight = "10px";

                drawMiniChromosome(genome, d3.select(miniChromosomeSvg));
                // genomeColors[genome] = generateColor(index);

                listItem.appendChild(miniChromosomeSvg);
            }

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = fileName;

            listItem.appendChild(fileNameSpan);
            fileListElement.appendChild(listItem);
        });

        // Forcer le reflow pour les animations
        void fileListElement.offsetWidth;

        // Marquer l'élément comme réorganisé pour les transitions
        fileListElement.classList.remove('reordering');
        fileListElement.classList.add('reordered');
    }, 10); // Ajoutez un léger délai pour garantir que la transition se déclenche
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



export function orderFilesByGenomes(files, genomes) {
    const orderedFiles = [];
    for (let i = 0; i < genomes.length - 1; i++) {
        const fileName = `${genomes[i]}_${genomes[i + 1]}.out`;
        if (files.includes(fileName)) {
            orderedFiles.push(fileName);
        }
    }
    return orderedFiles;
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

export function calculateGlobalMaxChromosomeLengths(genomeLengths) {
    const globalMaxLengths = {};
    for (const genome in genomeLengths) {
        const lengths = genomeLengths[genome];
        for (const chr in lengths) {
            if (!globalMaxLengths[chr] || lengths[chr] > globalMaxLengths[chr]) {
                globalMaxLengths[chr] = lengths[chr];
            }
        }
    }
    return globalMaxLengths;
}

export function parseSyriData(data) {
    const lines = data.split('\n');
    const parsedData = lines.map(line => {
        const parts = line.split('\t');
        return {
            refChr: parts[0],
            refStart: +parts[1],
            refEnd: +parts[2],
            refSeq: parts[3],
            querySeq: parts[4],
            queryChr: parts[5],
            queryStart: +parts[6],
            queryEnd: +parts[7],
            type: parts[10]
        };
    });
    return parsedData.filter(d => d.refChr && d.queryChr && d.queryChr !== '-' && d.refChr !== '-'); // Filtrer les lignes invalides
}

async function loadTestData() {
    // Define paths to your test files
    const testChrLenFiles = [
        'public/data/C5_126_2.chrlen',
        'public/data/C21_464.chrlen',
        'public/data/C23_A03.chrlen',
        'public/data/C45_410.chrlen',
        'public/data/DH_200_94.chrlen'
    ];

    const testBandFiles = [
        'public/data/C21_464_C23_A03.out',
        'public/data/C23_A03_C45_410.out',
        'public/data/C45_410_C5_126_2.out',
        'public/data/DH_200_94_C21_464.out'
    ];

    // Fetch file contents and create File objects
    const chrLenFiles = await Promise.all(testChrLenFiles.map(async path => {
        const response = await fetch(path);
        const text = await response.text();
        const fileName = path.split('/').pop();
        return new File([text], fileName, { type: 'text/plain' });
    }));

    const bandFiles = await Promise.all(testBandFiles.map(async path => {
        const response = await fetch(path);
        const text = await response.text();
        const fileName = path.split('/').pop();
        return new File([text], fileName, { type: 'text/plain' });
    }));

    // Creating DataTransfer objects to simulate file upload
    const chrLenDataTransfer = new DataTransfer();
    const bandDataTransfer = new DataTransfer();

    // Add files to the DataTransfer objects
    chrLenFiles.forEach(file => chrLenDataTransfer.items.add(file));
    bandFiles.forEach(file => bandDataTransfer.items.add(file));

    // Set the files to the input fields
    const chrLenInput = document.getElementById('chrlen-files');
    const bandInput = document.getElementById('band-files');

    chrLenInput.files = chrLenDataTransfer.files;
    bandInput.files = bandDataTransfer.files;

    // Update the file lists
    updateFileList(chrLenInput, document.getElementById('chrlen-file-list'));
    updateFileList(bandInput, document.getElementById('band-file-list'));
}