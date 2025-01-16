import { genomeLengths, loadAllChromosomeLengths, calculateGlobalMaxChromosomeLengths, 
	parseSyriData, orderFilesByGenomes,
	reorderFileList } from './form.js';
import { drawChromosomes, drawStackedChromosomes, drawCorrespondenceBands, resetDrawGlobals, drawMiniChromosome } from './draw.js';
import { generateLegend, createSlider, createLengthChart, updateBandsVisibility } from './filter.js';
import { Spinner } from './spin.js';

export let refGenome; // Définir globalement
export let queryGenome; // Définir globalement
export let genomeColors = {};
let uniqueGenomes;
let orderedFileObjects = []; // Défini globalement
let previousChromosomePositions = null;
let globalMaxChromosomeLengths = {};
let currentFile; // Défini globalement
const CHUNK_SIZE = 20000; // Nombre de lignes à traiter à la fois
let numGenomes; //nombre de génomes à traiter

//spinner
const opts = {
    lines: 20, length: 120, width: 50, radius: 1, scale: 0.3,
    corners: 1, speed: 1, rotate: 0, animation: 'spinner-line-shrink',
    direction: 1, color: 'grey', fadeColor: 'transparent', top: '20%',
    left: '50%', shadow: '0 0 1px transparent', zIndex: 2000000000,
    className: 'spinner', position: 'absolute'
};
var target = document.getElementById('spinner');
var spinner = new Spinner(opts);

function resetGlobals() {
    refGenome = null;
    queryGenome = null;
    genomeColors = {};
    uniqueGenomes = null;
    orderedFileObjects = [];
    previousChromosomePositions = null;
    globalMaxChromosomeLengths = {};
    currentFile = null;
    numGenomes = null;
    resetDrawGlobals(); // Réinitialiser currentYOffset

}

function generateColor(index) {
    const colors = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
        '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    return colors[index % colors.length];
}

function readFileInChunks(file, isFirstFile) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = event.target.result;
        console.log("File read successfully: " + file.name);
        const lines = data.split('\n');
        processChunks(lines, isFirstFile);
    };

    reader.onerror = function(event) {
        console.error('Erreur lors de la lecture du fichier:', event.target.error);
    };

    reader.readAsText(file);
}

function processChunks(lines, isFirstFile) {
    console.log(isFirstFile, refGenome, queryGenome);
    let offset = 0;
    let parsedData = [];

    function processNextChunk() {
        const chunk = lines.slice(offset, offset + CHUNK_SIZE);
        offset += CHUNK_SIZE;

        const chunkData = parseSyriData(chunk.join('\n'));
        parsedData = parsedData.concat(chunkData);

        const stackMode = document.getElementById('stack-mode').checked;

        if (offset < lines.length) {
            requestAnimationFrame(processNextChunk);
        } else {
            const refChromosomeLengths = genomeLengths[refGenome];
            const queryChromosomeLengths = genomeLengths[queryGenome];
            console.log(refChromosomeLengths);
            console.log(queryChromosomeLengths);

            let chromPositions;
            if(stackMode){
                const fileIndex = orderedFileObjects.indexOf(currentFile);
                chromPositions = drawStackedChromosomes(refChromosomeLengths, queryChromosomeLengths, globalMaxChromosomeLengths, fileIndex, numGenomes)
            }else{
                chromPositions = drawChromosomes(refChromosomeLengths, queryChromosomeLengths, globalMaxChromosomeLengths, isFirstFile);
            }
            
            drawCorrespondenceBands(parsedData, chromPositions, isFirstFile);
            previousChromosomePositions = chromPositions;
            window.fullParsedData = parsedData; // Sauvegarder les données complètes dans une variable globale
            processNextFile(); // Traiter le fichier suivant
        }
    }

    processNextChunk();
}

function processNextFile() {
    const fileIndex = orderedFileObjects.indexOf(currentFile);
    if (fileIndex < orderedFileObjects.length - 1) {
        currentFile = orderedFileObjects[fileIndex + 1];
        console.log("Current file: " + currentFile.name);
        refGenome = uniqueGenomes[fileIndex + 1];
        queryGenome = uniqueGenomes[fileIndex + 2];
        readFileInChunks(currentFile, false);
    } else {
        allDone();
        spinner.stop();
    }
}

function updateChromList(globalMaxChromosomeLengths) {
    const chromListDiv = document.getElementById('chrom-list');
    chromListDiv.innerHTML = ''; // Clear the previous list

    // Mise à jour de la liste des chromosomes
    const chromNames = Object.keys(globalMaxChromosomeLengths);
    const chromPositions = {};

    chromNames.forEach(chromName => {
        const chromElement = document.getElementById(chromName + "_ref");
        if (chromElement) {
            const bbox = chromElement.getBBox();
            chromPositions[chromName] = { refX: bbox.x, refY: bbox.y, width: bbox.width, height: bbox.height };
        }
    });
    

    const svgElement = document.getElementById('viz');
    const svgGroup = d3.select('#zoomGroup');

    chromNames.forEach(chromName => {
        const listItem = document.createElement('div');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';

        // Create eye icon
        const eyeIcon = document.createElement('i');
        eyeIcon.setAttribute('class', 'fas fa-eye chrom-eye-icon');
        eyeIcon.setAttribute('data-chrom', chromName);
        eyeIcon.style.cursor = 'pointer';
        eyeIcon.style.marginRight = '10px';

        eyeIcon.addEventListener('click', () => {
            if (eyeIcon.classList.contains('fa-eye')) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
            updateBandsVisibility();
        });

        const arrow = document.createElement('span');
        arrow.textContent = '→'; // Flèche
        arrow.style.cursor = 'pointer';
        arrow.style.marginRight = '10px';

        arrow.addEventListener('click', () => {
            const chromPos = chromPositions[chromName];
            if (chromPos) {
                const { refX, refY, width, height } = chromPos;

                // Récupérer la transformation actuelle appliquée au groupe de zoom
                const transform = d3.zoomTransform(svgGroup.node());
                const transformedX = transform.applyX(refX);
                const transformedY = transform.applyY(refY);

                const adjustedWidth = width * transform.k +200;
                const adjustedHeight = height * transform.k;
                const adjustedX = transformedX / transform.k -100;
                const adjustedY = transformedY / transform.k + 100;

                console.log(chromPos);
                console.log(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

                // Définir la nouvelle vue avec GSAP
                gsap.to(svgElement, {
                    duration: 2,
                    attr: {
                        viewBox: `${adjustedX} ${adjustedY} ${adjustedWidth} ${adjustedHeight}`
                    },
                    ease: "power1.inOut"
                });
            }
        });

        listItem.appendChild(eyeIcon);
        listItem.appendChild(arrow);

        const text = document.createElement('span');
        text.textContent = chromName;
        listItem.appendChild(text);
        chromListDiv.appendChild(listItem);
    });
}

function allDone() {
    // Determine min and max band sizes
    const allBandLengths = d3.selectAll('path.band').nodes().map(path => parseFloat(path.getAttribute('data-length')));
    const minBandSize = d3.min(allBandLengths);
    const maxBandSize = d3.max(allBandLengths);

    // Create and add the slider to filter bands by size
    createSlider(minBandSize, maxBandSize);
    // Create the bar chart to display band size distribution
    createLengthChart(allBandLengths);

    // Remove existing chromlist container
    const vizContainer = document.getElementById('viz-container')
    const existingchromListContainer = document.getElementById('chrom-list-container');
    if (existingchromListContainer) {
        vizContainer.removeChild(existingchromListContainer);
    }

    // Container for chromosomes list
    const chromListContainer = document.createElement('div');
    chromListContainer.setAttribute('id', 'chrom-list-container');
    chromListContainer.style.marginRight = '20px';

    // Toggle button
    const toggleButton = document.createElement('div');
    toggleButton.setAttribute('id', 'toggle-button');
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '0px';
    toggleButton.style.left = '0px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '20';
    toggleButton.innerHTML = '&#x25C0;'; // Flèche gauche

    const chromListDiv = document.createElement('div');
    chromListDiv.setAttribute('id', 'chrom-list');
    chromListContainer.appendChild(toggleButton); 
    chromListContainer.appendChild(chromListDiv);

    // Append legend and chromosomes list container to viz container
    const viz = document.getElementById('viz')
    vizContainer.insertBefore(chromListContainer, viz);

    // Toggle button event listener
    let isListVisible = true;
    toggleButton.addEventListener('click', () => {
        if (isListVisible) {
            chromListDiv.style.display = 'none';
            toggleButton.innerHTML = '&#x25B6;'; // Flèche droite
        } else {
            chromListDiv.style.display = 'block';
            toggleButton.innerHTML = '&#x25C0;'; // Flèche gauche
        }
        isListVisible = !isListVisible;
    });


    updateChromList(globalMaxChromosomeLengths);
    
    // Add download buttons
    const formContainer = document.getElementById('file-upload-form');

    // Remove existing download button if it exists
    const existingDownloadButton = document.getElementById('download-svg');
    if (existingDownloadButton) {
        formContainer.removeChild(existingDownloadButton);
    }

    const downloadSvgButton = document.createElement('button');
    downloadSvgButton.id = 'download-svg';
    downloadSvgButton.textContent = 'Download SVG';
    downloadSvgButton.style.marginLeft = "10px";
    formContainer.appendChild(downloadSvgButton);
    downloadSvgButton.addEventListener('click', function(event) {
        event.preventDefault();
        downloadSvg();
    });
}

function calculateSNPDensity(data, refLengths, binSize = 100000) {
    const snpDensity = {};

    // Initialiser les densités de SNP pour chaque chromosome
    for (const chr in refLengths) {
        const chrLength = refLengths[chr];
        const numBins = Math.ceil(chrLength / binSize);
        snpDensity[chr] = Array(numBins).fill(0);
    }

    // Compter les SNP dans chaque segment
    data.forEach(d => {
        if (d.type === 'SNP') {
            const binIndex = Math.floor(d.refStart / binSize);
            snpDensity[d.refChr][binIndex]++;
        }
    });

    return snpDensity;
}

// Extraire les noms des génomes à partir des fichiers .chrlen
function extractGenomeNames(chrlenFileNames) {
    return chrlenFileNames.map(fileName => fileName.replace('.chrlen', ''));
}

// Trouver les génomes uniques à partir des fichiers de bandes
function findUniqueGenomes(bandFileNames) {
    const fileCount = bandFileNames.length;
    const uniqueNamesToFind = fileCount + 1;
    numGenomes = uniqueNamesToFind;
    let possibleNames = new Set();

    // Extraire les noms de génomes directement à partir des noms de fichiers de bandes
    bandFileNames.forEach(file => {
        const baseName = file.replace('.out', '');
        const parts = baseName.split('_');
        for (let i = 1; i < parts.length; i++) {
            possibleNames.add(parts.slice(0, i).join('_'));
            possibleNames.add(parts.slice(i).join('_'));
        }
    });

    possibleNames = Array.from(possibleNames);

    function findCombination(currentCombination, depth) {
        if (depth === uniqueNamesToFind) {
            const genomeSet = new Set(currentCombination);
            if (genomeSet.size === uniqueNamesToFind) {
                const generatedFiles = [];
                for (let i = 0; i < currentCombination.length - 1; i++) {
                    generatedFiles.push(`${currentCombination[i]}_${currentCombination[i + 1]}.out`);
                }
                const match = generatedFiles.every(f => bandFileNames.includes(f));
                if (match) {
                    return Array.from(genomeSet);
                }
            }
            return null;
        }

        for (let i = 0; i < possibleNames.length; i++) {
            if (!currentCombination.includes(possibleNames[i])) {
                currentCombination.push(possibleNames[i]);
                const result = findCombination(currentCombination, depth + 1);
                if (result) {
                    return result;
                }
                currentCombination.pop();
            }
        }

        return null;
    }

    return findCombination([], 0);
}

function handleFileUpload(bandFiles) {
    resetGlobals(); // Réinitialiser les variables globales
    spinner.spin(target);

    // console.log('Chromosome Length Files:', chrlenFiles);
    console.log('Band Files:', bandFiles);

    // Extraire les noms de fichiers des objets File
    const bandFileNames = Array.from(bandFiles).map(file => file.name);
    
    // Trouver et ordonne les génomes à partir des noms de fichiers de bandes
    uniqueGenomes = findUniqueGenomes(bandFileNames);

    // Vérifier si tous les fichiers de bandes nécessaires sont présents
    if (!uniqueGenomes || uniqueGenomes.length < 2) {
        alert('Some band files are missing or do not match the .chrlen files. Please ensure all necessary files are uploaded.');
        spinner.stop();
        return;
    }

    console.log("Unique Genomes: ", uniqueGenomes);

    // Attribuer des couleurs aux génomes
    uniqueGenomes.forEach((genome, index) => {
        genomeColors[genome] = generateColor(index);
    });

    //retrouve l'ordre des fichier 
    const orderedFiles = orderFilesByGenomes(bandFileNames, uniqueGenomes);
    console.log("Ordered Files: ", orderedFiles);

    // Vérifier si tous les fichiers de bandes nécessaires sont présents et dans l'ordre
    if (orderedFiles.length !== bandFileNames.length) {
        alert('Some band files are missing or are not in the correct order. Please ensure all necessary files are uploaded.');
        spinner.stop();
        return;
    }

    // Générer et afficher la légende
    generateLegend();

    // Réordonner les listes de fichiers
    const genomeList = document.getElementById('genome-list');
    const bandFileList = document.getElementById('band-file-list');
    reorderFileList(genomeList, uniqueGenomes, 'chrlen'); //affiche les mini chromosomes
    reorderFileList(bandFileList, orderedFiles, 'out'); // réordonne les fichier de bandes dans la div band-file-list
    
    // Utiliser les objets File pour lire les fichiers
    orderedFileObjects = orderedFiles.map(fileName => 
        Array.from(bandFiles).find(file => file.name === fileName)
    );

    currentFile = orderedFileObjects[0];

    // Définir globalement refGenome et queryGenome
    refGenome = uniqueGenomes[0];
    queryGenome = uniqueGenomes[1];

    // Lire les longueurs des chromosomes à partir du fichier band
    calculateChromosomeLengthsFromBandFiles(orderedFileObjects, uniqueGenomes).then(() => {
        console.log("Genome Lengths: ", genomeLengths);
        globalMaxChromosomeLengths = calculateGlobalMaxChromosomeLengths(genomeLengths);
        //traite les fichiers
        readFileInChunks(currentFile, true, refGenome, queryGenome);
    });
}

//calcule la taille des chromosomes a partir du fichier band
//format : genomeLengths[genome] = lengths;
async function calculateChromosomeLengthsFromBandFiles(orderedFileObjects, uniqueGenomes) {
    for (let i = 0; i < orderedFileObjects.length; i++) {
        let currentFile = orderedFileObjects[i];
        let refGenome = uniqueGenomes[i];
        let queryGenome = uniqueGenomes[i + 1];

        // Lire les longueurs des chromosomes à partir du fichier band
        const { refLengths, queryLengths } = await readChromosomeLengthsFromBandFile(currentFile);

        // Mettre à jour genomeLengths pour refGenome
        if (!genomeLengths[refGenome]) {
            genomeLengths[refGenome] = {};
        }
        Object.assign(genomeLengths[refGenome], refLengths);

        // Mettre à jour genomeLengths pour queryGenome
        if (!genomeLengths[queryGenome]) {
            genomeLengths[queryGenome] = {};
        }
        Object.assign(genomeLengths[queryGenome], queryLengths);
    }
}

function readChromosomeLengthsFromBandFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const refLengths = {};
            const queryLengths = {};
            const lines = event.target.result.split('\n');
            lines.forEach(line => {
                const parts = line.split('\t');
                if (parts.length >= 8) {
                    const refChromosome = parts[0];
                    const queryChromosome = parts[5];
                    const refPosition = +parts[2];
                    const queryPosition = +parts[7];

                    if (refChromosome !== "-") {
                        if (!refLengths[refChromosome] || refPosition > refLengths[refChromosome]) {
                            refLengths[refChromosome] = refPosition;
                        }
                    }

                    if (queryChromosome !== "-") {
                        if (!queryLengths[queryChromosome] || queryPosition > queryLengths[queryChromosome]) {
                            queryLengths[queryChromosome] = queryPosition;
                        }
                    }
                }
            });
            resolve({ refLengths, queryLengths });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

function downloadSvg() {
    const svgElement = document.getElementById('viz');
    const zoomGroup = document.getElementById('zoomGroup');
    const serializer = new XMLSerializer();

    // Calculate the bounding box of the entire SVG content
    const bbox = zoomGroup.getBBox();
    const viewBox = [bbox.x, bbox.y, bbox.width, bbox.height].join(' ');

    // Clone the SVG element to avoid modifying the original
    const clonedSvgElement = svgElement.cloneNode(true);
    clonedSvgElement.setAttribute('viewBox', viewBox);

    // Serialize and create a blob
    const source = serializer.serializeToString(clonedSvgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SynFlow.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export { generateColor, readFileInChunks, handleFileUpload };
