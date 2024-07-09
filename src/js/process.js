import { genomeLengths, loadAllChromosomeLengths, calculateGlobalMaxChromosomeLengths, 
	parseSyriData, orderFilesByGenomes,
	reorderFileList } from './form.js';
import { drawChromosomes, drawStackedChromosomes, drawCorrespondenceBands } from './draw.js';
import { generateLegend, createSlider, createLengthChart } from './filter.js';
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

function allDone() {
    // Determine min and max band sizes
    const allBandLengths = d3.selectAll('path.band').nodes().map(path => parseFloat(path.getAttribute('data-length')));
    const minBandSize = d3.min(allBandLengths);
    const maxBandSize = d3.max(allBandLengths);

    // Create and add the slider to filter bands by size
    createSlider(minBandSize, maxBandSize);
    // Create the bar chart to display band size distribution
    createLengthChart(allBandLengths);

    // Add download buttons
    const formContainer = document.getElementById('file-upload-form');
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
function findUniqueGenomes(bandFileNames, genomeNames) {
    const fileCount = bandFileNames.length;
    const uniqueNamesToFind = fileCount + 1;
    numGenomes = uniqueNamesToFind;
    let possibleNames = new Set();
    bandFileNames.forEach(file => {
        const baseName = file.replace('.out', '');
        const parts = baseName.split('_');
        for (let i = 1; i < parts.length; i++) {
            possibleNames.add(parts.slice(0, i).join('_'));
            possibleNames.add(parts.slice(i).join('_'));
        }
    });

    possibleNames = Array.from(possibleNames);

    // Filtrer les possibleNames pour ne garder que ceux qui existent dans les fichiers chrlen
    possibleNames = possibleNames.filter(name => genomeNames.includes(name));

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


function handleFileUpload(chrlenFiles, bandFiles) {
    spinner.spin(target);

    console.log('Chromosome Length Files:', chrlenFiles);
    console.log('Band Files:', bandFiles);

    // Extraire les noms de fichiers des objets File
    const bandFileNames = Array.from(bandFiles).map(file => file.name);
    const chrlenFileNames = Array.from(chrlenFiles).map(file => file.name);
    const genomeNames = extractGenomeNames(chrlenFileNames);

    // Vérifier si tous les fichiers .chrlen nécessaires sont présents
    if (genomeNames.length < 2) {
        alert('Some .chrlen files are missing. Please ensure all necessary files are uploaded.');
        spinner.stop();
        return;
    }

    // Trouver et ordonne les génomes à partir des noms de fichiers de bandes
    uniqueGenomes = findUniqueGenomes(bandFileNames, genomeNames);

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
    const chrLenFileList = document.getElementById('chrlen-file-list');
    const bandFileList = document.getElementById('band-file-list');
    reorderFileList(chrLenFileList, uniqueGenomes.map(genome => `${genome}.chrlen`), 'chrlen');
    reorderFileList(bandFileList, orderedFiles, 'out');

    // Utiliser les objets File pour lire les fichiers
    orderedFileObjects = orderedFiles.map(fileName => 
        Array.from(bandFiles).find(file => file.name === fileName)
    );

    currentFile = orderedFileObjects[0];

    // Définir globalement refGenome et queryGenome
    refGenome = uniqueGenomes[0];
    queryGenome = uniqueGenomes[1];

    // Traiter les fichiers ordonnés
    loadAllChromosomeLengths(chrlenFiles).then(() => {
        globalMaxChromosomeLengths = calculateGlobalMaxChromosomeLengths(genomeLengths);
        readFileInChunks(currentFile, true, refGenome, queryGenome);
    });
}

function downloadSvg() {
    const svgElement = document.getElementById('viz');
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'visualization.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export { generateColor, readFileInChunks, handleFileUpload };
