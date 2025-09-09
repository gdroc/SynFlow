import { showInfoPanel, showInfoUpdatedMessage} from "./info.js";
import { refGenome, queryGenome, genomeColors, genomeData, scale, allParsedData, isFirstDraw } from "./process.js";
import { anchorsFiles, bedFiles, jbrowseLinks } from "./form.js";

export let currentYOffset = 0; // Définir globalement

// Définir les couleurs pour chaque type
export const bandeTypeColors = {
    'SYN': '#d3d3d3', // gris clair
    'INV': '#ffa500', // orange
    'INVTR': '#008000', // vert
    'TRANS': '#008000', // vert
    'DUP': '#0000ff', // bleu
};

const typeColors = {
    // Synténies (gris)
    'SYN': '#d3d3d3',
    'SYNAL': '#d3d3d3',
    'CPL': '#a0a0a0',
    
    // Inversions et combinaisons (nuances d'orange)
    'INV': '#ffa500',
    'INVAL': '#ffa500',
    'INVDP': 'linear-gradient(90deg, #ffa500, #4169e1)', // orange vers bleu
    'INVDPAL': 'linear-gradient(90deg, #ffa500, #4169e1)', 
    'INVTR': 'linear-gradient(90deg, #ffa500, #2e8b57)', // orange vers vert
    'INVTRAL': 'linear-gradient(90deg, #ffa500, #2e8b57)',

    // Translocations (vert)
    'TRANS': '#2e8b57',
    'TRANSAL': '#2e8b57',
    
    // Duplications (bleu)
    'DUP': '#4169e1',
    'DUPAL': '#4169e1',
    
    // HDR (violet)
    'HDR': '#9370db',
    
    // Autres modifications (rouge)
    'INS': '#dc143c',
    'DEL': '#b22222'
};

export function resetDrawGlobals() {
    currentYOffset = 0;
}
export let zoom; // Déclarer zoom ici pour l'utiliser dans d'autres fonctions

export function createGraphSection() {
    // Création du conteneur principal
    const graphSection = document.createElement('div');
    graphSection.setAttribute('id', 'graph-section');
    graphSection.style.cssText = `
        margin-top: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    
    
    // Créer la barre d'en-tête
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
    title.textContent = 'Graph Visualization';
    title.style.margin = '0';
    headerBar.appendChild(title);

    // Ajout de l'icône de fermeture
    const chevronIcon = document.createElement('i');
    chevronIcon.className = 'fas fa-chevron-up';
    chevronIcon.style.color = '#666';
    headerBar.appendChild(chevronIcon);

    // Créer le conteneur pour le contenu
    const graphContent = document.createElement('div');
    graphContent.setAttribute('id', 'graph-content');
    graphContent.style.cssText = `
        background-color: #f5f5f5;
        border-radius: 0 0 8px 8px;
        transition: max-height 0.3s ease-out;
        overflow: hidden;
        max-height: 1000px;
        padding: 20px;
    `;

    // Créer le conteneur pour la visualisation
    const vizContainer = document.createElement('div');
    vizContainer.setAttribute('id', 'viz-container');
    vizContainer.className = 'svg-container';
    vizContainer.style.cssText = `
        background-color: white;
        width: 100%;
        height: 600px;
        position: relative;
        overflow: hidden;
    `;

    // Créer l'élément SVG dès le début
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'viz');
    svg.setAttribute('viewBox', '0 0 1000 600'); // Vue initiale
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Créer le groupe pour le zoom
    const zoomGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    zoomGroup.setAttribute('id', 'zoomGroup');

    zoom = d3.zoom()
        .scaleExtent([0.5, 15]) // Définir les niveaux de zoom minimum et maximum
        .on("zoom", (event) => {
            // console.log("Zoom event triggered");
            // console.log(event.transform);
            d3.select('#zoomGroup').attr("transform", event.transform);
    });
    
    // Assembler les éléments SVG
    svg.appendChild(zoomGroup);
    vizContainer.appendChild(svg);

    // Créer le conteneur pour le spinner
    const spinnerContainer = document.createElement('div');
    spinnerContainer.setAttribute('id', 'spinner');
    spinnerContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `;

    // Ajouter les conteneurs au contenu
    graphContent.appendChild(vizContainer);
    graphContent.appendChild(spinnerContainer);

    // Event listener pour le pliage/dépliage
    headerBar.addEventListener('click', () => {
        if(graphContent.style.maxHeight === '0px') {
            graphContent.style.maxHeight = graphContent.scrollHeight + 'px';
            chevronIcon.className = 'fas fa-chevron-up';
        } else {
            graphContent.style.maxHeight = '0px';
            chevronIcon.className = 'fas fa-chevron-down';
        }
    });

    // Assemblage final
    graphSection.appendChild(headerBar);
    graphSection.appendChild(graphContent);

    return graphSection;
}

export function drawMiniChromosome(genome, svg) {
    const width = 40;
    const height = 10;
    const radius = 2;

    // Chemin pour le mini chromosome avec des bouts arrondis
    // Chemin premier bras
    let path = "M" + 5 + "," + 10; // Déplacer vers x y
    path += "h" + width; // Ligne horizontale
    path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius; // Arc
    path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius; // Arc
    path += "h" + -width; // Ligne horizontale
    path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius; // Arc
    path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius; // Arc
    path += "Z";

    svg.append("path")
        .attr("d", path)
        .attr("fill", "rgba(0, 0, 0, 0)")
        .style("fill-opacity", "0")
        .attr("stroke", genomeColors[genome]);
}

export function drawChromosomes(genomeData, maxLengths, refGenome, queryGenome, isFirstFile, scale) {
    console.log("Draw chromosomes"); 
    console.log(refGenome, queryGenome);

    const svgGroup = d3.select('#zoomGroup');
    const width = +d3.select('#viz').attr('width');
    const height = 300;
    
    const margin = { top: 30, bottom: 30, left: 50, right: 50 };
    const yRefPosition = currentYOffset + margin.top + (height - margin.top - margin.bottom) / 4;
    const yQueryPosition = currentYOffset + margin.top + 3 * (height - margin.top - margin.bottom) / 4;

    const spaceBetween = 50;
    const totalLength = Object.values(maxLengths).reduce((a, b) => a + b, 0);
    const totalWidth = (totalLength / scale) + spaceBetween * (Object.keys(maxLengths).length) + margin.left + margin.right;

    // d3.select('#viz').attr('width', totalWidth);
    d3.select('#viz')
    .attr('viewBox', `0 0 ${totalWidth} ${height}`)
    .attr('width', totalWidth);

    const radius = 5; // Exemple de radius pour les extrémités des chromosomes, moitié de la hauteur

    let currentX = margin.left; // Position de départ en X
    const chromPositions = {};
    // console.log(genomeData);
    // console.log(genomeData[refGenome]);
    for (const chrom in genomeData[refGenome]) {
        //chrom est le numéro du chromosome ex: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        const refWidth = (genomeData[refGenome][chrom].length || 0) / scale;
        const queryWidth = (genomeData[queryGenome][chrom].length || 0) / scale;
        const chromWidth = maxLengths[chrom] / scale;

        // console.log(chrom, refWidth, queryWidth, chromWidth);

        if (!isNaN(chromWidth) && chromWidth > 0) {
            if (isFirstFile) {
                drawChromPathNoArm(currentX, yRefPosition, refWidth, radius, chrom, genomeData[refGenome][chrom].name + "_ref", refGenome, svgGroup, scale);
                // Ajouter les noms des chromosomes
                if (isFirstFile) {
                    svgGroup.append('text')
                        .attr('x', currentX + chromWidth / 2)
                        .attr('y', yRefPosition - 10) // Position au-dessus des chromosomes de référence
                        .attr('text-anchor', 'middle')
                        .attr('class', 'chrom-title')
                        .attr("data-chrom-num", chrom)
                        .text(genomeData[refGenome][chrom].name);
                }
            }
            drawChromPathNoArm(currentX, yQueryPosition, queryWidth, radius, chrom, genomeData[queryGenome][chrom].name + "_query", queryGenome, svgGroup, scale);

            //change le format de chromPositions pour integrer le numéro du chromosome
            // ancien format = {chromName: {refX: currentX, queryX: currentX, refY: yRefPosition, queryY: yQueryPosition}}
            // nouveau format = {chromNum: {refX: currentX, queryX: currentX, refY: yRefPosition, queryY: yQueryPosition}}
            chromPositions[chrom] = { refX: currentX, queryX: currentX, refY: yRefPosition, queryY: yQueryPosition };
            currentX += chromWidth + spaceBetween; // Ajouter un espace entre les chromosomes
        } else {
            console.error(`Invalid chromosome width for ${genomeData[refGenome][chrom].name}: ${chromWidth}`);
        }
    }

    currentYOffset = yQueryPosition - 90; // Mettre à jour la position Y pour le fichier suivant
    // console.log(chromPositions);
    return chromPositions; // Retourner les positions des chromosomes
}

export function drawStackedChromosomes(genomeData, maxLengths, fileIndex, totalGenomes, scale) {
    console.log("Draw stacked chromosomes"); 
    const svgGroup = d3.select('#zoomGroup');
    const margin = { top: 30, bottom: 30, left: 50, right: 50 };
    const spaceBetween = 100;
    const totalSpaceBetween = totalGenomes * 100;
    const maxLength = Math.max(...Object.values(maxLengths));
    const totalWidth = (maxLength / scale) + margin.left + margin.right;

    const radius = 5;

    let currentX = margin.left;
    let currentY = margin.top + (fileIndex + 1) * spaceBetween;

    const chromPositions = {};

    for (const chrom in maxLengths) {
        const refLength = genomeData[refGenome][chrom]?.length;
        const queryLength = genomeData[queryGenome][chrom]?.length;
        const refWidth = (refLength || 0) / scale;
        const queryWidth = (queryLength || 0) / scale;
        const chromWidth = maxLengths[chrom] / scale;

        if (!isNaN(chromWidth) && chromWidth > 0) {
            if (fileIndex === 0) {
                // Dessin chromosome référence
                drawChromPathNoArm(currentX, currentY, refWidth, radius, chrom, genomeData[refGenome][chrom].name + "_ref", refGenome, svgGroup, scale);
                // Label du chromosome (nom réel)
                svgGroup.append('text')
                    .attr('x', currentX + chromWidth / 2)
                    .attr('y', currentY - 10)
                    .attr('text-anchor', 'middle')
                    .text(genomeData[refGenome][chrom].name);
            }
            // Dessin chromosome query
            drawChromPathNoArm(currentX, currentY + spaceBetween, queryWidth, radius, chrom, genomeData[queryGenome][chrom].name + "_query", queryGenome, svgGroup, scale);

            // Stockage des positions avec le numéro du chromosome comme clé
            chromPositions[chrom] = {
                refX: currentX,
                queryX: currentX,
                refY: currentY,
                queryY: currentY + spaceBetween
            };

            currentY += totalSpaceBetween;
        } else {
            console.error(`Invalid chromosome width for ${chrom}: ${chromWidth}`);
        }
    }

    return chromPositions;
}




//dessin d'un chromosome sans bras
function drawChromPathNoArm(x, y, width, radius, chromNum, chromName, genome, svg, scale) {
    // Inclus la taille du radius dans le chromosome
    x = parseInt(x + radius);
    // Longueur des bras sans les radius
    width = parseInt(width - radius - radius);

    // Chemin premier bras
    let path = "M" + x + "," + y; // Déplacer vers
    path += "h" + width; // Ligne horizontale
    path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius; // Arc
    path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius; // Arc
    path += "h" + -width; // Ligne horizontale
    path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius; // Arc
    path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius; // Arc
    path += "Z";

    //ajoute un tooltip pour le chromosome
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (event, d) {
            return `
                <strong>Genome:</strong> <span>${genome}</span><br>
                <strong>Chromosome:</strong> <span>${chromName.split('_ref')[0].split('_query')[0]}</span><br>
            `;
        });

    svg.call(tip);

    const gradientId = `gradient-${genome}-${chromName.split('_ref')[0].split('_query')[0]}`; // Générer un ID de gradient unique

    svg.append("path")
        .attr("d", path)
        .attr("class", "chrom") // Ajoute une classe chrom
        .attr("id", chromName)
        .attr("data-chrom-num", chromNum)
        .style("stroke", genomeColors[genome]) // Utiliser la couleur du génome
        // .style("fill", "rgba(0, 0, 0, 0)")
        //fill avec le gradient s'il existe
        // #gradient-m-AA-pisangmadu-h1-Macmad_h1_01
        .style('fill', `url(#${gradientId})`)
        .on('mouseover', function (event, d) {
                 tip.show(event, d); // Afficher le tooltip
            })
            .on('mouseout', function (event, d) {
                tip.hide(event, d); // Masquer le tooltip
            });
}


function drawSNPDensityHeatmap(snpDensity, refLengths, chromPositions, binSize = 1000000) {
    const svgGroup = d3.select('#zoomGroup');
    const colorScale = d3.scaleSequential(d3.interpolateOrRd)
        .domain([0, d3.max(Object.values(snpDensity).flat())]);

    for (const chr in snpDensity) {
        const chrDensity = snpDensity[chr];
        const chrLength = refLengths[chr];
        const numBins = chrDensity.length;

        const x = chromPositions[chr].refX;
        const y = chromPositions[chr].refY;
        const width = chrLength / scale; // Same scaling as chromosomes
        const binWidth = width / numBins;
        const height = 10; // Height of the heatmap bar

        // Créer le gradient linéaire
        const gradientId = `grad-${chr}`;
        const gradient = svgGroup.append('defs').append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        chrDensity.forEach((density, i) => {
            gradient.append('stop')
                .attr('offset', `${(i + 1) * (100 / numBins)}%`)
                .attr('stop-color', colorScale(density));
        });

        // // Appliquer le gradient au chromosome
        // svgGroup.append('rect')
        //     .attr('x', x)
        //     .attr('y', y) // Position au-dessus du chromosome
        //     .attr('width', width)
        //     .attr('height', height)
        //     .attr('fill', `url(#${gradientId})`);
        
        //attribut le gradient au chromosome
        const monChromColor = d3.selectAll("#" + chr + "_ref.chrom");
        monChromColor.style('fill', null); // Supprimer le style existant
        monChromColor.style('fill', `url(#${gradientId})`);
    }
}

export function drawCorrespondenceBands(data, chromPositions, isFirstFile, scale, mergeThreshold = 500000) {
    console.log("Draw correspondence bands");
    // console.log(mergeThreshold);
    const svgGroup = d3.select('#zoomGroup');

    // Types à merger
    const mergeTypes = ['INVTR', 'TRANS'];
    // Types à dessiner normalement
    const normalTypes = ['SYN', 'INV', 'DUP'];

    // Sépare les bandes à merger et les autres
    const bandsToMerge = data.filter(d => mergeTypes.includes(d.type));
    const bandsNormal = data.filter(d => normalTypes.includes(d.type));

   // Fusionne les bandes à merger en tenant compte des autres bandes
    const mergedBands = mergeBands(bandsToMerge, bandsNormal, mergeThreshold);

    // Concatène tout pour le dessin
    const allBands = bandsNormal.concat(mergedBands);    

    allBands.forEach(d => {
        drawOneBand(svgGroup, d, chromPositions, refGenome, queryGenome);
    });
}

function mergeBands(bandsToMerge, otherBands, threshold) {
    if (!bandsToMerge || bandsToMerge.length === 0 || threshold <= 0) return bandsToMerge;

    const merged = [];
    let current = null;

    for (const band of bandsToMerge) {
        if (!current) {
            current = { ...band };
            continue;
        }

        // Vérifie s'il y a des bandes d'autres types entre current et band
        const hasOtherBandsBetween = otherBands.some(other => 
            other.refChr === current.refChr &&
            other.queryChr === current.queryChr &&
            (other.refStart > current.refEnd &&
            other.refStart < band.refStart) ||
            (other.queryStart > current.queryEnd &&
            other.queryStart < band.queryStart)
        );

        const distRef = band.refStart - current.refEnd;
        const distQuery = current.queryStart - band.queryEnd;

        if (
            !hasOtherBandsBetween &&
            band.refChr === current.refChr &&
            band.queryChr === current.queryChr &&
            band.type === current.type &&
            distRef <= threshold &&
            distQuery <= threshold
        ) {
            // On fusionne en étendant current
            current.refStart = Math.min(current.refStart, current.refEnd, band.refStart, band.refEnd);
            current.refEnd = Math.max(current.refStart, current.refEnd, band.refStart, band.refEnd);
            current.queryStart = Math.min(current.queryStart, current.queryEnd, band.queryStart, band.queryEnd);
            current.queryEnd = Math.max(current.queryStart, current.queryEnd, band.queryStart, band.queryEnd);
        } else {
            // On ne peut pas fusionner : on sauvegarde current et on passe à band
            merged.push(current);
            current = { ...band };
        }
    }

    if (current) {
        merged.push(current);
    }

    // console.log(`Merged ${bandsToMerge.length} INVTR bands into ${merged.length} bands`);
    return merged;
}

function drawOneBand(svgGroup, d, chromPositions, refGenome, queryGenome) {

    let display = 'null';
    //Si c'est un redraw alors on vérifie les filtres de bandes
    if(!isFirstDraw){
        if (!isBandVisible(d)) {
            display = 'none';
        }
    }
    
    let refChromNum = Object.values(genomeData[refGenome]).findIndex(item => item.name === d.refChr) + 1;
    let queryChromNum = Object.values(genomeData[queryGenome]).findIndex(item => item.name === d.queryChr) + 1;
    const refX = chromPositions[[refChromNum]]?.refX;
    const queryX = chromPositions[[queryChromNum]]?.queryX;

    // Tooltip
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (event, d) {
            return `
                <div style="min-width:220px; font-size:15px;">
                    <div style="margin-bottom:6px;">
                        <span style="font-weight:bold;">Ref</span> : 
                        <span>${d.refChr}</span> 
                        <span>[${d.refStart}..${d.refEnd}]</span>
                    </div>
                    <div style="margin-bottom:6px;">
                        <span style="font-weight:bold;">Query</span> : 
                        <span>${d.queryChr}</span> 
                        <span>[${d.queryStart}..${d.queryEnd}]</span>
                    </div>
                    <div>
                        <span style="font-weight:bold;">Type :</span> 
                        <span style="background:${typeColors[d.type]}; border-radius:6px; padding:2px 8px; margin-left:4px;">${d.type}</span>
                    </div>
                </div>
            `;
    });

    svgGroup.call(tip);

    if (refX !== undefined && queryX !== undefined) {

        const refStartX = refX + (d.refStart / scale);
        const refEndX = refX + (d.refEnd / scale);
        let queryStartX = queryX + (d.queryStart / scale);
        let queryEndX = queryX + (d.queryEnd / scale);
        const color = bandeTypeColors[d.type] || '#ccc'; // Utiliser la couleur définie ou gris clair par défaut

        const refY = chromPositions[[refChromNum]]?.refY + 10; // Ajuster pour aligner sur le chromosome de référence
        // const queryY = chromPositions[d.queryChr]?.queryY; // Ajuster pour aligner sur le chromosome de requête
        const queryY = chromPositions[[queryChromNum]]?.queryY; // Ajuster pour aligner sur le chromosome de requête

        // Inverser les positions queryStart et queryEnd pour les types d'inversion
        if (d.type === 'INV' || d.type === 'INVDPAL' || d.type === 'INVTR' || d.type === 'INVTRAL') {
            [queryStartX, queryEndX] = [queryEndX, queryStartX];
        }

        // Calculer la longueur de la bande
        const bandLength = d.refEnd - d.refStart;

        // Déterminer le type de bande (inter ou intra)
        // const bandPos = d.refChr === d.queryChr ? 'intra' : 'inter';
        const bandPos = refChromNum === queryChromNum ? 'intra' : 'inter';

        // Dessiner une bande courbée pour la correspondance
        const pathData = `
            M${refStartX},${refY}
            C${refStartX},${(refY + queryY) / 2} ${queryStartX},${(refY + queryY) / 2} ${queryStartX},${queryY}
            L${queryEndX},${queryY}
            C${queryEndX},${(refY + queryY) / 2} ${refEndX},${(refY + queryY) / 2} ${refEndX},${refY}
            Z
        `;

        svgGroup.append('path')
            .datum(d) // Associer les données à l'élément
            .attr('d', pathData)
            .attr('fill', color)
            .attr('opacity', 0.5)
            .attr('display', display) //gère le filtre isVisible
            .attr('class', 'band')
            .attr('data-length', bandLength) // Ajouter l'attribut de longueur
            .attr('data-pos', bandPos) // Ajouter l'attribut de position inter ou intra
            .attr('data-type', d.type) // Ajouter l'attribut de type de bande
            .attr('data-ref-genome', refGenome) // Ajouter l'attribut de génome
            .attr('data-ref', d.refChr) //ajoute l'attribut ref
            .attr('data-ref-num', refChromNum) // ajoute l'attribut ref-num
            .attr('data-query-num', queryChromNum) // ajoute l'attribut query
            .attr('data-query', d.queryChr) // ajoute l'attribut query
            .attr('data-query-genome', queryGenome) // ajoute l'attribut query-genome
            .on('mouseover', function (event, d) {
                d3.select(this).attr('opacity', 1); // Mettre en gras au survol
                tip.show(event, d); // Afficher le tooltip
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('opacity', 0.5); // Réinitialiser après le survol
                tip.hide(event, d); // Masquer le tooltip
            })
            .on('click', async function (event, d) {
                // Cherche le bon jeu de données dans allParsedData
                const parsedSet = allParsedData.find(set =>
                    set.refGenome === refGenome && set.queryGenome === queryGenome
                );
                if (!parsedSet) {
                    d3.select('#info').html('<p>No data found for this band.</p>');
                    return;
                }
                 //affiche la section info
                showInfoPanel();
                showInfoUpdatedMessage()
                const linesInRange = getLinesInRange(parsedSet.data, d.refChr, d.queryChr, d.refStart, d.refEnd, d.queryStart, d.queryEnd);
                const tableHtml = await convertLinesToTableHtml(linesInRange, d.refStart, d.refEnd, d.queryStart, d.queryEnd, refGenome, queryGenome);               
                d3.select('#info').html(`${tableHtml}`);

                // Récupérer les données d'anchors
                const anchorsResult = await createAnchorsSection(linesInRange, d.refStart, d.refEnd, d.queryStart, d.queryEnd, refGenome, queryGenome);
                // Afficher le HTML des anchors
                const anchorsHtml = anchorsResult.html; 
                d3.select('#orthology-table').html(`<br>${anchorsHtml}`);
                // Utiliser les données pour créer la vue zoomée
                const orthologPairs = anchorsResult.data;
                createZoomedSyntenyView(orthologPairs, refGenome, queryGenome, d.refStart, d.refEnd, d.queryStart, d.queryEnd);
                
            });
        ;
    }else {
        console.error(`Invalid chromosome position for ref: ${d.refChr} or query: ${d.queryChr}`);
    }
}


function getLinesInRange(parsedData, refChr, queryChr, refStart, refEnd, queryStart, queryEnd) {
    // console.log("getLinesInRange", refChr, queryChr, refStart, refEnd, queryStart, queryEnd);
    return parsedData.filter(d => d.refChr === refChr && d.queryChr === queryChr && d.refStart >= refStart && d.refEnd <= refEnd && d.queryStart >= queryStart && d.queryEnd <= queryEnd);
}

// function convertLinesToTableHtml(lines) {
//     if (lines.length === 0) return "<p>Aucune donnée disponible</p>";

//     // Calculer le nombre de chaque type dans les lignes filtrées
//     const typeCounts = {};
//     lines.forEach(d => {
//         if (typeCounts[d.type]) {
//             typeCounts[d.type]++;
//         } else {
//                 typeCounts[d.type] = 1;
//         }
//     });
//     const typeCountsHtml = Object.keys(typeCounts).map(type => {
//         return `<strong>${type}:</strong>${typeCounts[type]}<br>`;
//     }).join('');
    
//     const headers = Object.keys(lines[0]);
//     const headerHtml = headers.map(header => `<th>${header}</th>`).join('');
//     const rowsHtml = lines.map(line => {
//         const rowHtml = headers.map(header => `<td class="table-cell">${line[header]}</td>`).join('');
//         return `<tr>${rowHtml}</tr>`;
//     }).join('');

//     return `
//         ${typeCountsHtml}
//         <table class="table table-striped">
//             <thead>
//                 <tr>${headerHtml}</tr>
//             </thead>
//             <tbody>
//                 ${rowsHtml}
//             </tbody>
//         </table>
//     `;
// }

async function convertLinesToTableHtml(lines, refStart, refEnd, queryStart, queryEnd, refGenome, queryGenome) {
    if (lines.length === 0) return "<p>Aucune donnée disponible</p>";
    const summary = createSummarySection(lines, refStart, refEnd, queryStart, queryEnd, refGenome, queryGenome);
    const table = createDetailedTable(lines, refGenome, queryGenome);

    // Retourner le HTML avec une structure améliorée
    const html = `
            <div class="summary-section">
                <h4>Summary</h4>
                ${summary}
            </div>
            <div class="detailed-table">
                <h4>Details</h4>
                ${table}
            </div>
    `;

    // Initialiser le filtrage après l'insertion dans le DOM
    setTimeout(() => {
        initializeTableFiltering();
    }, 0);

    return html;
}


async function createAnchorsSection(lines, refStart, refEnd, queryStart, queryEnd, refGenome, queryGenome) {
    const refChr = lines[0].refChr;
    const queryChr = lines[0].queryChr;

    try {
        // Récupère les data du fichier anchors correspondant aux coordonnées choisies
        const anchorFileName = refGenome + '_' + queryGenome + '.anchors';
        // Cherche le fichier dans anchorsFiles
        const anchorFile = anchorsFiles.find(file => file.name === anchorFileName);
        
        if (!anchorFile) {
            console.warn(`Anchors file ${anchorFileName} not found`);
            return { html: '<div class="anchors-refquery">Anchors file not found</div>', data: [] };
        }

        // Récupère les fichiers BED pour ref et query
        const refBedFile = bedFiles.find(file => file.name === refGenome + '.bed');
        const queryBedFile = bedFiles.find(file => file.name === queryGenome + '.bed');

        if (!refBedFile || !queryBedFile) {
            console.warn('Missing BED file');
            return { html: '<div class="anchors-refquery">Missing BED file</div>', data: [] };
        }

        // Récupère le contenu des fichiers
        const [anchorText, refBedText, queryBedText] = await Promise.all([
            anchorFile.text(),
            refBedFile.text(),
            queryBedFile.text()
        ]);

        // Parse les lignes des fichiers BED
        const refBedLines = refBedText.split('\n').filter(line => line.trim());
        const queryBedLines = queryBedText.split('\n').filter(line => line.trim());
        const anchorLines = anchorText.split('\n').filter(line => line.trim());

        // Filtre les gènes du BED ref dans la région d'intérêt
        const refGenesInRegion = refBedLines.filter(line => {
            const [chr, start, end] = line.split('\t');
            const geneStart = parseInt(start);
            const geneEnd = parseInt(end);
            
            // Vérifie si le gène est dans la région spécifiée
            return chr === refChr && 
                geneStart >= refStart && 
                geneEnd <= refEnd;
        });

        // Pour chaque gène du bed ref, cherche son orthologue dans le fichier anchors
        const orthologPairs = [];
        refGenesInRegion.forEach(refBedLine => {
            const [refChr, refStart, refEnd, refGeneName, refScore, refStrand] = refBedLine.split('\t');
            
            // Filtre les anchors pour ce gène
            const foundAnchors = anchorLines.filter(line => 
                line.split('\t')[0] === refGeneName
            );

            foundAnchors.forEach(anchorLine => {
                const [refAnchor, queryAnchor, score, score2] = anchorLine.split('\t');
                // Trouve les coordonnées du gène query correspondant
                const queryBedLine = queryBedLines.find(line => {
                    const bedQueryGeneName = line.split('\t')[3];
                    const cleanQueryAnchor = queryAnchor;
                    return bedQueryGeneName === cleanQueryAnchor || bedQueryGeneName === queryAnchor;
                });
                
                if (queryBedLine) {
                    const [queryChr, queryStart, queryEnd, queryName, queryScore, queryStrand] = queryBedLine.split('\t');
                    orthologPairs.push({
                        ref: {
                            name: refGeneName,
                            chr: refChr,
                            start: parseInt(refStart),
                            end: parseInt(refEnd),
                            strand: refStrand || '+'
                        },
                        query: {
                            name: queryName,
                            chr: queryChr,
                            start: parseInt(queryStart),
                            end: parseInt(queryEnd),
                            strand: queryStrand || '+'
                        },
                        score: parseFloat(score) || 0,
                        anchorRef: refAnchor,
                        anchorQuery: queryAnchor
                    });
                }
            });
        });

        console.log('Paires orthologues trouvées:', orthologPairs);

        const orthologsHtml = createOrthologsTable(orthologPairs, refGenome, queryGenome );


        const anchorsHtml = `
            <div class="anchors-refquery">
                <h4 style="margin-bottom:10px;">Orthologs found: (${orthologPairs.length})</h4>
                ${orthologsHtml || '<div style="padding:10px; text-align:center; color:#666;">No orthologs found in this region</div>'}
            </div>
        `;

        // Retourner à la fois le HTML et les données
        return {
            html: anchorsHtml,
            data: orthologPairs
        };

    } catch (error) {
        console.error('Erreur dans createAnchorsSection:', error);
        return { 
            html: '<div class="anchors-refquery">Error while loading data</div>',
            data: []
        };
    }
}

/////////////////////////////////////////////////
function createZoomedSyntenyView(orthologPairs, refGenome, queryGenome, refStart, refEnd, queryStart, queryEnd) {
    
    // Vérifier si on a des données
    if (!orthologPairs || orthologPairs.length === 0) {
        d3.select('#zoomed-synteny').html('<div>No orthologs found</div>');
        return;
    }

    // Configuration du dessin
    const margin = { top: 10, right: 30, bottom: 0, left: 30 };
    const width = 1200 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;
    const chromosomeHeight = 10;
    const geneHeight = 10;
    const refY = 50;
    const queryY = 200;

    // Créer le conteneur SVG
    const svg = d3.select('#zoomed-synteny')
        .html('') // Nettoyer le contenu précédent
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles pour positionner les gènes
    const refScale = d3.scaleLinear()
        .domain([refStart, refEnd])
        .range([0, width]);

    const queryScale = d3.scaleLinear()
        .domain([queryStart, queryEnd])
        .range([0, width]);

    // Dessiner les chromosomes de référence
    g.append('rect')
        .attr('x', 0)
        .attr('y', refY - chromosomeHeight/2)
        .attr('width', width)
        .attr('height', chromosomeHeight)
        .attr('stroke', genomeColors[refGenome] || '#666')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('fill', 'white')
        .attr('rx', 5);

    // Label chromosome ref
    g.append('text')
        .attr('x', 0)
        .attr('y', refY - 45)
        .attr('font-weight', 'bold')
        .text(`${refGenome}`);

    // Dessiner le chromosome query
    g.append('rect')
        .attr('x', 0)
        .attr('y', queryY - chromosomeHeight/2)
        .attr('width', width)
        .attr('height', chromosomeHeight)
        .attr('stroke', genomeColors[queryGenome] || '#666')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('fill', 'white')
        .attr('rx', 5);

    // Label chromosome query
    g.append('text')
        .attr('x', 0)
        .attr('y', queryY + 55)
        .attr('font-weight', 'bold')
        .text(`${queryGenome}`);

    // Créer un tooltip
    let tooltip = d3.select('.gene-tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'gene-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden')
            .style('z-index', '1000');
    }

    // Dessiner les genes et les connection
    orthologPairs.forEach((d, i) => {
        drawGene(g, d.ref, refScale, refY, geneHeight, genomeColors[refGenome], 'black', tooltip, 'ref');
        drawGene(g, d.query, queryScale, queryY, geneHeight, genomeColors[queryGenome], 'black', tooltip, 'query');
        drawConnection(g, d.ref, d.query, refScale, queryScale, refY, queryY, geneHeight, d.score, tooltip);

    });


    // Ajouter des échelles de coordonnées
    const refAxis = d3.axisTop(refScale)
        .tickSize(5)
        .tickFormat(d => (d / 1000000).toFixed(1) + 'Mb');
    
    g.append('g')
        .attr('class', 'ref-axis')
        .attr('transform', `translate(0, ${refY - chromosomeHeight/2 - 10})`)
        .call(refAxis);

    const queryAxis = d3.axisBottom(queryScale)
        .tickSize(5)
        .tickFormat(d => (d / 1000000).toFixed(1) + 'Mb');
    
    g.append('g')
        .attr('class', 'query-axis')
        .attr('transform', `translate(0, ${queryY + chromosomeHeight/2 + 10})`)
        .call(queryAxis);

    // Ajouter une légende
    const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 160}, 20)`);

    return svg.node();
}


function drawGene(g, geneData, scale, y, geneHeight, color, strokeColor, tooltip, position = 'ref') {
    const x = scale(geneData.start);
    const geneWidth = Math.max(3, scale(geneData.end) - scale(geneData.start));
    const strand = geneData.strand || '+';

    const gene = g.append('g').attr('class', `${position}-gene`);

    const arrowSize = Math.min(5, geneWidth / 3);
    const points = strand === '+' || strand === '1'
        ? [
            [x, y - geneHeight/2],
            [x + geneWidth - arrowSize, y - geneHeight/2],
            [x + geneWidth, y],
            [x + geneWidth - arrowSize, y + geneHeight/2],
            [x, y + geneHeight/2]
        ]
        : [
            [x + arrowSize, y - geneHeight/2],
            [x + geneWidth, y - geneHeight/2],
            [x + geneWidth, y + geneHeight/2],
            [x + arrowSize, y + geneHeight/2],
            [x, y]
        ];

    gene.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', color)
        .attr('opacity', 0.7)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1);

    // Tooltip
    gene.style('cursor', 'pointer')
        .on('mouseover', function(event) {
            tooltip.style('visibility', 'visible')
                .html(`<strong>${geneData.name}</strong><br>
                    ${geneData.chr}:${geneData.start.toLocaleString()}-${geneData.end.toLocaleString()}<br>
                    Strand: ${strand}`);
        })
        .on('mousemove', function(event) {
            tooltip.style('top', (event.pageY + 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('visibility', 'hidden');
        });
}



function drawConnection(g, refGene, queryGene, refScale, queryScale, refY, queryY, geneHeight, score, tooltip) {
    const refStartX = refScale(refGene.start);
    const refEndX = refScale(refGene.end);
    const queryStartX = queryScale(queryGene.start);
    const queryEndX = queryScale(queryGene.end);

    const refBottom = refY + geneHeight/2;      // Bas du gène de référence
    const queryTop = queryY - geneHeight/2;                  // Haut du gène query

    const midY = (refBottom + queryTop) / 2;

    const pathData = `
        M${refStartX},${refBottom}
        C${refStartX},${midY} ${queryStartX},${midY} ${queryStartX},${queryTop}
        L${queryEndX},${queryTop}
        C${queryEndX},${midY} ${refEndX},${midY} ${refEndX},${refBottom}
        Z
    `;

    const bandId = `conn-${CSS.escape(refGene.name)}-${CSS.escape(queryGene.name)}`;

    g.append('path')
        .attr('class', 'ortholog-connection')
        .attr('id', bandId) // Ajoute un ID unique pour chaque bande pour le survol
        .attr('d', pathData)
        .attr('fill', '#ccc')
        .attr('opacity', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
            d3.select(this).attr('opacity', 1);
            tooltip.style('visibility', 'visible')
                .html(`<strong>Orthologs</strong><br>
                    ${refGene.name} ↔ ${queryGene.name}<br>
                    Score: ${score.toFixed(3)}`);
        })
        .on('mousemove', function(event) {
            tooltip.style('top', (event.pageY + 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.5);
            tooltip.style('visibility', 'hidden');
        });
}



// Fonction pour highlight des bandes entre les genes orthologues au survol du tableau
function highlightBand(bandId) {
    // Sauvegarde l'opacité d'origine
    const band = d3.select(`#${CSS.escape(bandId)}`);
    if (!band.empty()) {
        band
            .style('opacity', 1)
            .raise(); // Amène la bande au premier plan
    }
}

function unhighlightBand(bandId) {
    const band = d3.select(`#${CSS.escape(bandId)}`);
    if (!band.empty()) {
        band
            .style('opacity', 0.5)
    }
}

function createOrthologsTable(orthologPairs, refGenome, queryGenome) {
    const headers = [
        { key: 'refName', label: 'Ref gene' },
        { key: 'refPos', label: 'Ref position' },
        { key: 'refLink', label: '' },
        { key: 'queryName', label: 'Query gene' },
        { key: 'queryPos', label: 'Query position' },
        { key: 'queryLink', label: '' },
        { key: 'score', label: 'Score' }
    ];

    const headerHtml = headers
        .map(h => `<th>${h.label}</th>`)
        .join('');

    const rowsHtml = orthologPairs.map((pair, i) => {
        const isEven = i % 2 === 0;
        const backgroundColor = isEven ? '#f9f9f9' : '#ffffff';
        // ID unique pour chaque bande pour le survol
        const bandId = `conn-${CSS.escape(pair.ref.name)}-${CSS.escape(pair.query.name)}`;

        // liens JBrowse (si dispo)
        let refLink = '', queryLink = '';
        if (typeof jbrowseLinks !== "undefined") {
            const refBase = jbrowseLinks[refGenome];
            const queryBase = jbrowseLinks[queryGenome];

            if (refBase) {
                const refLoc = `${pair.ref.chr}:${pair.ref.start}..${pair.ref.end}`;
                const refUrl = refBase.includes('?')
                    ? `${refBase}&loc=${refLoc}`
                    : `${refBase}?loc=${refLoc}`;
                refLink = `<a href="${refUrl}" target="_blank" title="Go to JBrowse">
                    <i class="fas fa-external-link-alt"></i>
                </a>`;
            }

            if (queryBase) {
                const queryLoc = `${pair.query.chr}:${pair.query.start}..${pair.query.end}`;
                const queryUrl = queryBase.includes('?')
                    ? `${queryBase}&loc=${queryLoc}`
                    : `${queryBase}?loc=${queryLoc}`;
                queryLink = `<a href="${queryUrl}" target="_blank" title="Go to JBrowse">
                    <i class="fas fa-external-link-alt"></i>
                </a>`;
            }
        }

        return `
            <tr style="background-color:${backgroundColor};"
                data-band-id="${bandId}">
                <td>${pair.ref.name}</td>
                <td>${pair.ref.chr}:${pair.ref.start.toLocaleString()}-${pair.ref.end.toLocaleString()}</td>
                <td>${refLink}</td>
                <td>${pair.query.name}</td>
                <td>${pair.query.chr}:${pair.query.start.toLocaleString()}-${pair.query.end.toLocaleString()}</td>
                <td>${queryLink}</td>
                <td>${pair.score}</td>
            </tr>
        `;
    }).join('');

    // Ajoute les event listeners après avoir inséré le tableau
    setTimeout(() => {
        document.querySelectorAll('tr[data-band-id]').forEach(row => {
            const bandId = row.dataset.bandId;
            row.addEventListener('mouseover', () => highlightBand(bandId));
            row.addEventListener('mouseout', () => unhighlightBand(bandId));
        });
    }, 0);

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="thead-light">
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
}

















function createSummarySection(lines, refStart, refEnd, queryStart, queryEnd, refGenome, queryGenome) {
    if (!lines || lines.length === 0) return '';

    // Affichage ref/query sans tirets
    const refLabel = refGenome.replace(/-/g, ' ');
    const queryLabel = queryGenome.replace(/-/g, ' ');

    // Génère les liens JBrowse pour la ref et la query (sur la région sélectionnée)
    let refJBrowseLink = '', queryJBrowseLink = '';
    if (typeof jbrowseLinks !== "undefined") {
        const refBase = jbrowseLinks[refGenome];
        if (refBase) {
            const refLoc = `${lines[0].refChr}:${refStart}..${refEnd}`;
            const refUrl = refBase.includes('?')
                ? `${refBase}&loc=${refLoc}`
                : `${refBase}?loc=${refLoc}`;
            refJBrowseLink = `<a href="${refUrl}" target="_blank" title="See reference region in JBrowse" class="jbrowse-link">
                <i class="fas fa-external-link-alt"></i>
            </a>`;
        }
        const queryBase = jbrowseLinks[queryGenome];
        if (queryBase) {
            const queryLoc = `${lines[0].queryChr}:${queryStart}..${queryEnd}`;
            const queryUrl = queryBase.includes('?')
                ? `${queryBase}&loc=${queryLoc}`
                : `${queryBase}?loc=${queryLoc}`;
            queryJBrowseLink = `<a href="${queryUrl}" target="_blank" title="See query region in JBrowse" class="jbrowse-link">
                <i class="fas fa-external-link-alt"></i>
            </a>`;
        }
    }

    // Bloc résumé ergonomique
    const summaryHtml = `
        <div class="summary-refquery" style="display:flex; gap:10em; align-items:center; margin-bottom:8px;">
            <div>
                <b>Ref :</b> ${refLabel}<br>
                <b>Chr:</b> ${lines[0].refChr}<br>
                <b>Pos:</b> ${refStart}..${refEnd} ${refJBrowseLink}
            </div>
            <div>
                <b>Query :</b> ${queryLabel}<br>
                <b>Chr:</b> ${lines[0].queryChr}<br>
                <b>Pos:</b> ${queryStart}..${queryEnd} ${queryJBrowseLink}
            </div>
        </div>
    `;

    // Comptage des types
    const typeCounts = {};
    lines.forEach(d => {
        typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
    });

    // Badges
    const typeCountsHtml = Object.keys(typeColors)
        .filter(type => typeCounts[type])
        .map(type => {
            const count = typeCounts[type];
            const background = typeColors[type] || '#ccc';
            const style = background.includes('gradient') 
                ? `background: ${background}` 
                : `background-color: ${background}`;
            return `
                <div class="type-badge" data-type="${type}" data-active="true" style="${style}">
                    <span class="type-label">${type}</span>
                    <span class="type-count">${count}</span>
                </div>
            `;
        }).join('');

    return `
        ${summaryHtml}
                    
        <div><p style="margin-top:20px; margin-bottom:6px;">Click on the badges to filter the table</p></div>

        <div class="type-badges-container" style="margin-top:8px;">
            ${typeCountsHtml}
        </div>
    `;
}
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDetailedTable(lines, refGenome, queryGenome) {
    const headers = [
        { key: 'refChr', label: 'Ref chr' },
        { key: 'refStart', label: 'Ref start' },
        { key: 'refEnd', label: 'Ref end' },
        { key: 'refJBrowse', label: '' },   
        { key: 'queryChr', label: 'Query chr' },
        { key: 'queryStart', label: 'Query start' },
        { key: 'queryEnd', label: 'Query end' },
        { key: 'queryJBrowse', label: '' } ,
        { key: 'type', label: 'Type' }
        
    ];

    const headerHtml = headers
        .map(header => `<th>${header.label}</th>`)
        .join('');

    const rowsHtml = lines.map(line => {
        const background = typeColors[line.type] || '#ccc';
        const hasGradient = background.includes('gradient');
        
        let style;
        if (hasGradient) {
            // Extraire les deux couleurs du gradient
            const colors = background.match(/#[0-9a-f]{6}/g);
            const color1 = hexToRgba(colors[0], 0.3);
            const color2 = hexToRgba(colors[1], 0.3);
            style = `background: linear-gradient(90deg, ${color1}, ${color2})`;
        } else {
            style = `background-color: ${background}30`;
        }
            
        // Construction des liens JBrowse
        let refLink = '', queryLink = '';
        if (typeof jbrowseLinks !== "undefined") {
            // console.log(jbrowseLinks, refGenome, queryGenome);
            // Génère l'URL avec la position pour la ref
            const refBase = jbrowseLinks[refGenome];
            if (refBase) {
                const refLoc = `${line.refChr}:${line.refStart}..${line.refEnd}`;
                const refUrl = refBase.includes('?') 
                    ? `${refBase}&loc=${refLoc}` 
                    : `${refBase}?loc=${refLoc}`;
                refLink = `<a href="${refUrl}" target="_blank" title="Go to JBrowse">
                    <i class="fas fa-external-link-alt"></i>
                </a>`;
            }
            // Génère l'URL avec la position pour la query
            const queryBase = jbrowseLinks[queryGenome];
            if (queryBase) {
                const queryLoc = `${line.queryChr}:${line.queryStart}..${line.queryEnd}`;
                const queryUrl = queryBase.includes('?') 
                    ? `${queryBase}&loc=${queryLoc}` 
                    : `${queryBase}?loc=${queryLoc}`;
                queryLink = `<a href="${queryUrl}" target="_blank" title="Go to JBrowse">
                    <i class="fas fa-external-link-alt"></i>
                </a>`;
            }
        }

        const rowHtml = [
            `<td class="table-cell">${line.refChr}</td>`,
            `<td class="table-cell">${line.refStart}</td>`,
            `<td class="table-cell">${line.refEnd}</td>`,
            `<td class="table-cell">${refLink}</td>`,
            `<td class="table-cell">${line.queryChr}</td>`,
            `<td class="table-cell">${line.queryStart}</td>`,
            `<td class="table-cell">${line.queryEnd}</td>`,
            `<td class="table-cell">${queryLink}</td>`,
            `<td class="table-cell">${line.type}</td>`

        ].join('');
            
        return `
            <tr style="${style}">
                ${rowHtml}
            </tr>
        `;
    }).join('');

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="thead-light">
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
}

function initializeTableFiltering() {
    const badges = document.querySelectorAll('.type-badge');
    const tableRows = document.querySelectorAll('tbody tr');
    
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            // Basculer l'état actif du badge
            const isActive = badge.dataset.active === 'true';
            badge.dataset.active = !isActive;
            
            // Récupérer tous les types actifs
            const activeTypes = [...badges]
                .filter(b => b.dataset.active === 'true')
                .map(b => b.dataset.type);
            
            // Filtrer les lignes du tableau
            tableRows.forEach(row => {
                const rowType = row.querySelector('td:last-child').textContent;
                row.style.display = activeTypes.includes(rowType) ? '' : 'none';
            });
        });
    });
}

function isBandVisible(d) {
    // Types visibles
    const eyeIcons = document.querySelectorAll('i[data-type]');
    const selectedTypes = Array.from(eyeIcons)
        .filter(icon => !icon.classList.contains('fa-eye-slash'))
        .map(icon => icon.getAttribute('data-type'));

    // Dépendances de types (copie depuis legend.js si besoin)
    const typeDependencies = {
        'INVTR': ['INV', 'TRANS'],
        'SYN': ['SYN'],
        'INV': ['INV'],
        'TRANS': ['TRANS'],
        'DUP': ['DUP']
    };

    // Chromosomes visibles
    const chromEyeIcons = document.querySelectorAll('i.chrom-eye-icon');
    const visibleChromosomes = Array.from(chromEyeIcons)
        .filter(icon => icon.classList.contains('fa-eye'))
        .map(icon => icon.getAttribute('data-chrom'));

    // Inter/intra
    const showIntra = !document.getElementById('intrachromosomal-filter').classList.contains('fa-eye-slash');
    const showInter = !document.getElementById('interchromosomal-filter').classList.contains('fa-eye-slash');

    // Slider
    const bandLength = d.refEnd - d.refStart;
    const min = window.sliderMinValue ?? 0;
    const max = window.sliderMaxValue ?? Infinity;

    // Numéros de chromosomes (attention à la conversion)
    const refChromNum = Object.values(genomeData[refGenome]).findIndex(item => item.name === d.refChr) + 1;
    const queryChromNum = Object.values(genomeData[queryGenome]).findIndex(item => item.name === d.queryChr) + 1;

    // Vérifications
    const isVisibleChrom = visibleChromosomes.includes(String(refChromNum)) && visibleChromosomes.includes(String(queryChromNum));
    const isVisibleBandType = selectedTypes.some(type => type === d.type) ||
        (typeDependencies[d.type] && typeDependencies[d.type].every(parentType => selectedTypes.includes(parentType)));
    const bandPos = refChromNum === queryChromNum ? 'intra' : 'inter';
    const isVisibleBandPos = (bandPos === 'intra' && showIntra) || (bandPos === 'inter' && showInter);
    
    const isVisibleBandLength = bandLength >= min && bandLength <= max;
    return isVisibleChrom && isVisibleBandType && isVisibleBandPos && isVisibleBandLength;

}















