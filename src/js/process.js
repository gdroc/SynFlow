import { drawChromosomes, drawStackedChromosomes, drawCorrespondenceBands, resetDrawGlobals, drawMiniChromosome } from './draw.js';
import { generateBandTypeFilters, createSlider, createLengthChart, updateBandsVisibility, showControlPanel } from './legend.js';
import { Spinner } from './spin.js';
import { zoom } from './main.js';

export let refGenome; // Définir globalement
export let queryGenome; // Définir globalement
export let genomeColors = {};
let genomeLengths; // taille des chromosomes
export let genomeData; // Données des chromosomes
let maxAlignments; //duo de chromosomes ref/query avec le plus grand alignement
let uniqueGenomes;
let orderedFileObjects = []; // Défini globalement
let previousChromosomePositions = null;
let globalMaxChromosomeLengths = {};
let currentFile; // Défini globalement
const CHUNK_SIZE = 20000; // Nombre de lignes à traiter à la fois
let numGenomes; //nombre de génomes à traiter
export let scale = 100000; // diviseur pour la taille des chromosomes

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
            // const refChromosomeLengths = genomeLengths[refGenome];
            // const queryChromosomeLengths = genomeLengths[queryGenome];
            // console.log(refChromosomeLengths);
            // console.log(queryChromosomeLengths);

            let chromPositions;
            if(stackMode){
                const fileIndex = orderedFileObjects.indexOf(currentFile);
                chromPositions = drawStackedChromosomes(genomeData, globalMaxChromosomeLengths, fileIndex, numGenomes, scale);
            }else{
                chromPositions = drawChromosomes(genomeData, globalMaxChromosomeLengths, refGenome, queryGenome, isFirstFile, scale);

            }
            
            drawCorrespondenceBands(parsedData, chromPositions, isFirstFile, scale);
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

// Mise à jour de la liste des chromosomes à filtrer
// event listener pour afficher / cacher les chromosomes 
function updateChromList(globalMaxChromosomeLengths) {
    console.log(globalMaxChromosomeLengths);
    const chromListDiv = document.getElementById('chrom-list');
    chromListDiv.innerHTML = ''; // Clear the previous list

    // Mise à jour de la liste des chromosomes
    const chromNums = Object.keys(globalMaxChromosomeLengths);
    const chromPositions = {};

    chromNums.forEach(chromNum => {
        // const chromElement = document.getElementById(chromNum + "_ref");
        //get path elements with attr chromnum
        const chromElement = document.querySelector(`path[chromnum="${chromNum}"]`);
        if (chromElement) {
            const bbox = chromElement.getBBox();
            chromPositions[chromNum] = { refX: bbox.x, refY: bbox.y, width: bbox.width, height: bbox.height };
        }
    });
    

    const svgElement = document.getElementById('viz');
    const svgGroup = d3.select('#zoomGroup');

    chromNums.forEach(chromNum => {
        const listItem = document.createElement('div');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';

        // Create eye icon
        const eyeIcon = document.createElement('i');
        eyeIcon.setAttribute('class', 'fas fa-eye chrom-eye-icon');
        eyeIcon.setAttribute('data-chrom', chromNum);
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

        const goto = document.createElement('span');
        goto.setAttribute('class', 'fas fa-crosshairs');
        goto.style.cursor = 'pointer';
        goto.style.marginRight = '10px';

        goto.addEventListener('click', () => {
            const chromPos = chromPositions[chromNum];
            if (chromPos) {
                const { refX, refY, width, height } = chromPos;
                const margin = 10;

                // Calculer le facteur de zoom pour que le chromosome occupe ~80% de la largeur du SVG
                const svg = d3.select('#viz');
                const svgWidth = +svg.attr('width');
                const svgHeight = +svg.attr('height');
                const targetWidth = width + 2 * margin;
                const targetHeight = height + 2 * margin;
                const scale = Math.min(svgWidth / targetWidth, svgHeight / targetHeight, 10); // 10 = zoom max

                // Calculer la translation pour centrer le chromosome
                const centerX = refX + width / 2;
                const centerY = refY + height / 2;
                // Calculer la translation pour aligner le chromosome en haut de la vue
                const translateX = svgWidth / 2 - scale * centerX;
                // Place le haut du chromosome à une petite marge du haut du SVG
                const translateY = margin - 2 * scale * refY;

                console.log("translateX:", translateX, "translateY:", translateY, "scale:", scale);

                // Animer le zoom D3 (transition douce)
                svg.transition()
                    .duration(1200)
                    .call(
                        zoom.transform,
                        d3.zoomIdentity
                            .translate(translateX, translateY)
                            .scale(scale)
                    );
            }
        });

        listItem.appendChild(eyeIcon);
        listItem.appendChild(goto);

        const text = document.createElement('span');
        text.textContent = chromNum;
        listItem.appendChild(text);
        chromListDiv.appendChild(listItem);
    });
}

function allDone() {

    // Après avoir chargé les données et dessiné le graphique, détecter les bornes
    const zoomGroup = d3.select('#zoomGroup');

    if (zoomGroup.empty()) {
        console.error('zoomGroup not found');
        return;
    }

    const graphBounds = zoomGroup.node().getBBox();
    const width = graphBounds.width;
    const height = graphBounds.height;

    console.log("*************"+width, height);

    // Mettre à jour les limites de translation du zoom
    zoom.translateExtent([[0, 0], [width, height]]);
    d3.select("#viz").call(zoom);

    // Determine min and max band sizes
    const allBandLengths = d3.selectAll('path.band').nodes().map(path => parseFloat(path.getAttribute('data-length')));
    const minBandSize = d3.min(allBandLengths);
    const maxBandSize = d3.max(allBandLengths);

    // Create and add the slider to filter bands by size
    createSlider(minBandSize, maxBandSize);
    // Create the bar chart to display band size distribution
    createLengthChart(allBandLengths);

    //Affiche la légende
    showControlPanel();

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
            chromListDiv.style.display = 'flex'; // Réappliquer flex pour garder l'affichage en ligne
            toggleButton.innerHTML = '&#x25C0;'; // Flèche gauche
        }
        isListVisible = !isListVisible;
    });


    updateChromList(globalMaxChromosomeLengths);
    
    // Add download buttons
    const formContainer = document.getElementById('file-upload');

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
    generateBandTypeFilters();

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
    calculateChromosomeDataFromBandFiles(orderedFileObjects, uniqueGenomes).then((data) => {
        genomeData = data;
        console.log(genomeData)
        globalMaxChromosomeLengths = calculateGlobalMaxChromosomeLengths(genomeData);
        scale = calculateScale(globalMaxChromosomeLengths);
        console.log("Global Max Chromosome Lengths: ", globalMaxChromosomeLengths);
        //traite les fichiers
        readFileInChunks(currentFile, true, refGenome, queryGenome);
    });
}

//calcul le scale a partir des tailles des chromosomes globalMaxChromosomeLengths
        // {
        //     "1": 70856583,
        //     "2": 54676892,
        //     "3": 47271773,
        //     "4": 82204888,
        //     "5": 50696038,
        //     "6": 61498972,
        //     "7": 55122646,
        //     "8": 77822268,
        //     "9": 47989177,
        //     "10": 61339363,
        //     "11": 47069596
        // }
        // ici max = 82204888 donc scale = 100000
        // {
        //     "1": 562643,
        //     "2": 230218,
        //     "3": 813184,
        //     "4": 316620,
        //     "5": 1531933,
        //     "6": 576874,
        //     "7": 279643,
        //     "8": 1090940,
        //     "9": 439888,
        //     "10": 745751,
        //     "11": 666816,
        //     "12": 1556556,
        //     "13": 924431,
        //     "14": 784333,
        //     "15": 1091291,
        //     "16": 948066
        // }
        //ici max = 1556556 donc scale = 10000
        // Selon l'ordre de grandeur des chromosomes, on peut ajuster le scale
        function calculateScale(chromosomeLengths) {
            // Trouver la longueur maximale parmi les chromosomes
            const maxLength = Math.max(...Object.values(chromosomeLengths));
            
            // Calculer l'ordre de grandeur du plus grand chromosome
            const orderOfMagnitude = Math.pow(10, Math.floor(Math.log10(maxLength)));
            
            // Ajuster le scale en fonction de l'ordre de grandeur
            const scale = orderOfMagnitude / 100;
            // console.log(scale);
            return scale;
        }
        
        // // Exemple d'utilisation
        // const globalMaxChromosomeLengths1 = {
        //     "1": 70856583,
        //     "2": 54676892,
        //     "3": 47271773,
        //     "4": 82204888,
        //     "5": 50696038,
        //     "6": 61498972,
        //     "7": 55122646,
        //     "8": 77822268,
        //     "9": 47989177,
        //     "10": 61339363,
        //     "11": 47069596
        // };
        
        // const globalMaxChromosomeLengths2 = {
        //     "1": 562643,
        //     "2": 230218,
        //     "3": 813184,
        //     "4": 316620,
        //     "5": 1531933,
        //     "6": 576874,
        //     "7": 279643,
        //     "8": 1090940,
        //     "9": 439888,
        //     "10": 745751,
        //     "11": 666816,
        //     "12": 1556556,
        //     "13": 924431,
        //     "14": 784333,
        //     "15": 1091291,
        //     "16": 948066
        // };
        
        // const scale1 = calculateScale(globalMaxChromosomeLengths1);
        // console.log("Scale 1: ", scale1);
        
        // const scale2 = calculateScale(globalMaxChromosomeLengths2);
        // console.log("Scale 2: ", scale2);

// Calcule la taille des chromosomes à partir des fichiers band
// Format : genomeData[genomeName][index] = { name: chrName, length: chrLength };
async function calculateChromosomeDataFromBandFiles(orderedFileObjects, uniqueGenomes) {
    //format des données
    //genomeData[genomeName][index] = { name: chrName, length: chrLength };
    const genomeData = {};

    for (let i = 0; i < orderedFileObjects.length; i++) {
        let currentFile = orderedFileObjects[i];
        let refGenome = uniqueGenomes[i];
        let queryGenome = uniqueGenomes[i + 1];
    
        // Lire les longueurs des chromosomes à partir du fichier band
        const { refLengths, queryLengths, alignments } = await readChromosomeLengthsFromBandFile(currentFile);
        //format des données
        //refLengths = { "1": { name: "chr1", length: 70856583 }, "2": { name: "chr2", length: 54676892 }, ... }
        //queryLengths = { "1": { name: "chr1", length: 70856583 }, "2": { name: "chr2", length: 54676892 }, ... }
        //alignments = { "chr1": { "chr1": 1000, "chr2": 2000, ... }, "chr2": { "chr1": 3000, "chr2": 4000, ... }, ... }
        // console.log(refLengths);
        // console.log(queryLengths);
        // console.log(alignments);

        //Crée la structure de données finale
        //pour chaque chromosome ref
        for (let i=1; i<=Object.keys(refLengths).length; i++) {
            //contient chr1 : chr1 : 68465168415, chr2 : 68465168415, ...
            let refChr = refLengths[i].name;
            //cherche son binome = le chromosome query qui à l'alignement le plus long
            let queryChr = Object.keys(alignments[refChr]).reduce((a, b) => alignments[refChr][a] > alignments[refChr][b] ? a : b);
            // console.log("binome de ", refChr, " est ", queryChr);
            //cherche l'index de queryChr dans queryLengths
            let queryIndex = Object.keys(queryLengths).find(key => queryLengths[key].name === queryChr);
            // console.log("index de ", queryChr, " est ", queryIndex);
            
            //sauvegarde les données finales
            if (!genomeData[refGenome]) {
                genomeData[refGenome] = {};
            }
            genomeData[refGenome][i] = refLengths[i];
            if (!genomeData[queryGenome]) {
                genomeData[queryGenome] = {};
            }
            genomeData[queryGenome][i] = queryLengths[queryIndex];
        }
    }
    // console.log("genomeData ");
    // console.log(genomeData);
    return genomeData;
}

// lis la longueur des chromosomes à partir du fichier band
// pour les fichiers ref et query
// calcul pour chaque chrom ref la longueur des alignements avec chaque chrom querry
// retourne 3 tableaux
// refLengths = { "1": { name: "chr1", length: 70856583 }, "2": { name: "chr2", length: 54676892 }, ... }
// queryLengths = { "1": { name: "chr1", length: 70856583 }, "2": { name: "chr2", length: 54676892 }, ... }
// alignments = { "chr1": { "chr1": 1000, "chr2": 2000, ... }, "chr2": { "chr1": 3000, "chr2": 4000, ... }, ... }
function readChromosomeLengthsFromBandFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const refLengths = {};
            const queryLengths = {};
            const alignments = {};
            const lines = event.target.result.split('\n');
            let refIndex = 0;
            let queryIndex = 1;
            let lastRefChromosome = null;
            let lastQueryChromosome = null;

            lines.forEach(line => {
                const parts = line.split('\t');
                if (parts.length >= 8) {
                    const refChromosome = parts[0];
                    const queryChromosome = parts[5];
                    const refStart = +parts[1];
                    const refEnd = +parts[2];
                    const queryStart = +parts[6];
                    const queryEnd = +parts[7];
                    const alignmentLength = refEnd - refStart;

                    if (refChromosome !== "-") {
                        if (refChromosome !== lastRefChromosome) {
                            lastRefChromosome = refChromosome;
                            refIndex++;
                        }
                        if (!refLengths[refIndex] || refEnd > refLengths[refIndex].length) {
                            refLengths[refIndex] = { name: refChromosome, length: refEnd };
                        }
                    }

                    if (queryChromosome !== "-") {
                        let found = false;
                        for (const key in queryLengths) {
                            if (queryLengths[key].name === queryChromosome) {
                                queryIndex = key;
                                found = true;
                                if (queryEnd > queryLengths[queryIndex].length) {
                                    queryLengths[queryIndex] = { name: queryChromosome, length: queryEnd };
                                }
                                break;
                            }
                        }
                        if (!found) {
                            queryIndex = Object.keys(queryLengths).length + 1;
                            queryLengths[queryIndex] = { name: queryChromosome, length: queryEnd };
                        }
                    }

                    if (!alignments[refChromosome]) {
                        alignments[refChromosome] = {};
                    }
                    if (!alignments[refChromosome][queryChromosome]) {
                        alignments[refChromosome][queryChromosome] = 0;
                    }
                    alignments[refChromosome][queryChromosome] += alignmentLength;
                }
            });

            resolve({ refLengths, queryLengths, alignments });
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

function reorderFileList(fileListElement, orderedFileNames, fileType) {
    console.log(fileListElement);
    console.log(orderedFileNames);
    console.log(fileType);

    fileListElement.classList.add('reordering');

    setTimeout(() => {
        fileListElement.innerHTML = '';

        orderedFileNames.forEach((fileName, index) => {
            const listItem = document.createElement('div');
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'center';
            listItem.style.cursor = 'grab';
            listItem.setAttribute('draggable', 'true');
            listItem.dataset.fileName = fileName;

            // Ajouter les événements de drag and drop
            listItem.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', fileName);
            });

            listItem.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            listItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingItem = fileListElement.querySelector('.dragging');
                const siblings = [...fileListElement.querySelectorAll('[draggable]:not(.dragging)')];
                const nextSibling = siblings.find(sibling => {
                    const rect = sibling.getBoundingClientRect();
                    return e.clientY < rect.top + rect.height / 2;
                });

                if (nextSibling) {
                    fileListElement.insertBefore(draggingItem, nextSibling);
                } else {
                    fileListElement.appendChild(draggingItem);
                }
            });

            const genome = fileName.replace(`.${fileType}`, '');

            if (fileType === 'chrlen') {
                const miniChromosomeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                miniChromosomeSvg.setAttribute("width", "50");
                miniChromosomeSvg.setAttribute("height", "20");
                miniChromosomeSvg.style.marginRight = "10px";
                
                drawMiniChromosome(genome, d3.select(miniChromosomeSvg));

                listItem.appendChild(miniChromosomeSvg);
            }

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = fileName;

            listItem.appendChild(fileNameSpan);
            fileListElement.appendChild(listItem);
        });

        void fileListElement.offsetWidth;

        fileListElement.classList.remove('reordering');
        fileListElement.classList.add('reordered');

        // Ajouter un événement pour détecter les changements d'ordre
        fileListElement.addEventListener('dragend', () => {
            const newOrder = [...fileListElement.querySelectorAll('[draggable]')].map(item => 
                item.dataset.fileName.replace(`.${fileType}`, '')
            );
            console.log('Nouvel ordre:', newOrder);
            // Mettre à jour uniqueGenomes avec le nouvel ordre
            uniqueGenomes = newOrder;
            // Réorganiser les fichiers de bandes en conséquence
            const bandFileList = document.getElementById('band-file-list');
            const newBandFiles = orderFilesByGenomes(
                [...bandFileList.querySelectorAll('[draggable]')].map(item => item.dataset.fileName),
                newOrder
            );
            reorderFileList(bandFileList, newBandFiles, 'out');
        });
    }, 10);
}


// function reorderFileList(fileListElement, orderedFileNames, fileType) {
//     console.log(fileListElement);
//     console.log(orderedFileNames);
//     console.log(fileType);

//     // Marquer l'élément comme en train de se réorganiser
//     fileListElement.classList.add('reordering');

//     // Attendre que les transitions CSS prennent effet
//     setTimeout(() => {
//         fileListElement.innerHTML = ''; // Clear the previous file list

//         orderedFileNames.forEach((fileName, index) => {
//             const listItem = document.createElement('div');
//             listItem.style.display = 'flex';
//             listItem.style.alignItems = 'center';

//             const genome = fileName.replace(`.${fileType}`, '');

//             if (fileType === 'chrlen') {
//                 // Créer un SVG pour le mini chromosome
//                 const miniChromosomeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//                 miniChromosomeSvg.setAttribute("width", "50");
//                 miniChromosomeSvg.setAttribute("height", "20");
//                 miniChromosomeSvg.style.marginRight = "10px";

//                 drawMiniChromosome(genome, d3.select(miniChromosomeSvg));
//                 // genomeColors[genome] = generateColor(index);

//                 listItem.appendChild(miniChromosomeSvg);
//             }

//             const fileNameSpan = document.createElement('span');
//             fileNameSpan.textContent = fileName;

//             listItem.appendChild(fileNameSpan);
//             fileListElement.appendChild(listItem);
//         });

//         // Forcer le reflow pour les animations
//         void fileListElement.offsetWidth;

//         // Marquer l'élément comme réorganisé pour les transitions
//         fileListElement.classList.remove('reordering');
//         fileListElement.classList.add('reordered');
//     }, 10); // Ajoutez un léger délai pour garantir que la transition se déclenche
// }


function orderFilesByGenomes(files, genomes) {
    const orderedFiles = [];
    for (let i = 0; i < genomes.length - 1; i++) {
        const fileName = `${genomes[i]}_${genomes[i + 1]}.out`;
        if (files.includes(fileName)) {
            orderedFiles.push(fileName);
        }
    }
    return orderedFiles;
}

function calculateGlobalMaxChromosomeLengths(genomeData) {
    const globalMaxLengths = {};

    for (const genome in genomeData) {
        const chromosomes = genomeData[genome];
        for (const index in chromosomes) {
            const chrData = chromosomes[index];
            if (!globalMaxLengths[index]) {
                globalMaxLengths[index] = chrData.length;
            } else {
                if (chrData.length > globalMaxLengths[index]) {
                    globalMaxLengths[index] = chrData.length;
                }
            }
        }
    }

    return globalMaxLengths;
}

function parseSyriData(data) {
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