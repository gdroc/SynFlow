//Fonction pour les contrôles et paramètres
export function createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.setAttribute('id', 'control-panel');
    controlPanel.style.cssText = `
        margin-top: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    
    // Créer la barre de titre
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
    title.textContent = 'Control Panel';
    title.style.margin = '0';
    headerBar.appendChild(title);

    // Ajout de l'icône de fermeture
    const chevronIcon = document.createElement('i');
    chevronIcon.className = 'fas fa-chevron-up';
    chevronIcon.style.color = '#666';
    headerBar.appendChild(chevronIcon);

    // Créer le conteneur pour le contenu
    const panelContent = document.createElement('div');
    panelContent.setAttribute('id', 'control-panel-content');
    panelContent.style.cssText = `
        background-color: white;
        border-radius: 0 0 8px 8px;
        transition: max-height 0.3s ease-out;
        overflow: hidden;
        max-height: 0px;  // Initialement caché
    `;

    // Conteneur de la grille
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
        padding: 20px;
        background-color: #f5f5f5;
        display: grid;
        grid-template-columns: 300px 600px 300px;
        gap: 20px;
    `;

    // Event listener sur headerBar
    headerBar.addEventListener('click', (event) => {
        event.preventDefault();
        if(panelContent.style.maxHeight === '0px' || !panelContent.style.maxHeight) {
            panelContent.style.maxHeight = panelContent.scrollHeight + 'px';
            chevronIcon.className = 'fas fa-chevron-up';
        } else {
            panelContent.style.maxHeight = '0px';
            chevronIcon.className = 'fas fa-chevron-down';
        }
    });

    // Création des sections
    const legendSection = document.createElement('div');
    legendSection.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    legendSection.innerHTML = '<h5><i class="fas fa-info-circle"></i> Legend</h5>';
    legendSection.appendChild(createLegendContainer());

    const filtersSection = document.createElement('div');
    filtersSection.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    filtersSection.innerHTML = '<h5><i class="fas fa-filter"></i> Filters</h5>';
    filtersSection.appendChild(createFiltersContent());

    const paramsSection = document.createElement('div');
    paramsSection.style.cssText = `
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.1);
    `;
    paramsSection.innerHTML = '<h5><i class="fas fa-cog"></i> Parameters</h5>';
    paramsSection.appendChild(createParametersContent());

    // Ajout des sections à la grille
    gridContainer.appendChild(legendSection);
    gridContainer.appendChild(filtersSection);
    gridContainer.appendChild(paramsSection);
    // Ajout de la grille au contenu
    panelContent.appendChild(gridContainer);
    // Assemblage final
    controlPanel.appendChild(headerBar);
    controlPanel.appendChild(panelContent);

    // // Ajouter un écouteur d'événements à la case à cocher
    // const stackModeCheckbox = document.getElementById('stack-mode');
    // const submitButton = document.querySelector('#submit-button');
    // stackModeCheckbox.addEventListener('change', () => {
    //     submitButton.click(); // Simuler un clic sur le bouton "Draw"
    // });

    return controlPanel;
}

// Ajouter une nouvelle fonction pour rendre visible le panel
export function showControlPanel() {
    const panelContent = document.getElementById('control-panel-content');
    if (panelContent) {
        panelContent.style.maxHeight = panelContent.scrollHeight + 'px';
        // Mettre à jour l'icône du bouton
        const hideButton = document.querySelector('#control-panel button');
        if (hideButton) {
            hideButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    }
}

// Fonctions helpers pour créer le contenu des onglets
function createFiltersContent() {
    const filters = document.createElement('div');
    filters.innerHTML = `
        <div class="filter-section">
            <div style="margin: 10px 0;">
                <!-- Les filtres de type de bandes seront ajoutés ici dynamiquement -->
            </div>
            <div style="margin: 10px 0;">
                <!-- Les filtres de chromosomes seront ajoutés ici -->
            </div>
        </div>
    `;
    return filters;
}

function createParametersContent() {
    const params = document.createElement('div');
    params.style = 'margin-top: 20px;';
    params.className = 'params-section';

    // Container pour la checkbox
    const stackDiv = document.createElement('div');
    stackDiv.style.margin = '10px 0';

    // Label + checkbox
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'stack-mode';

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' Stack chromosomes vertically'));
    stackDiv.appendChild(label);

    // Event listener directement ici si besoin :
    checkbox.addEventListener('change', () => {
         const submitButton = document.querySelector('#submit');
        console.log('submitButton', submitButton);
        if (submitButton) submitButton.click();
    });

    // Zone d'upload
    const uploadDiv = document.createElement('div');
    uploadDiv.id = 'file-upload';
    uploadDiv.style.margin = '10px 0';

    // Ajout au conteneur principal
    params.appendChild(stackDiv);
    params.appendChild(uploadDiv);

    return params;
}






















//globale
let sliderMinValue = 0;
let sliderMaxValue = Infinity;

export function createLegendContainer() {
    // Container for legend
    const legendContainer = document.createElement('div');
    legendContainer.setAttribute('id', 'legend-container');
    legendContainer.setAttribute('style', 'margin-top:20px;');

    const legendContent = document.createElement('div');
    legendContent.setAttribute('id', 'legend-content');
    legendContent.setAttribute('style', 'display:flex;');

    // Container for genome names and order
    const genomeList = document.createElement('div');
    genomeList.setAttribute('id', 'genome-list');
    genomeList.setAttribute('style', 'margin-bottom:20px; margin-right:30px;');

    const legendDiv = document.createElement('div');
    legendDiv.setAttribute('id', 'legend');
    
    legendContent.appendChild(genomeList);
    legendContent.appendChild(legendDiv);

    legendContainer.appendChild(legendContent);

    // // Append legend container to input container
    // const inputContainer = document.getElementById('input-container');
    // inputContainer.appendChild(legendContainer);
    return legendContainer;
}

export function generateBandTypeFilters() {
    const filterDiv = document.querySelector('.filter-section'); 
    filterDiv.innerHTML = ''; // Clear previous legend
    filterDiv.style = 'margin-top: 20px;';

    // Créer un conteneur pour les deux colonnes
    const columnsContainer = document.createElement('div');
    columnsContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-bottom: 15px;
    `;

    // Première colonne pour les types de bandes
    const typeColumn = document.createElement('div');
    // typeColumn.innerHTML = '<h5 style="margin-bottom: 10px;">Types de bandes</h5>';

    const colors = [
        { type: 'Syntenic region', color: '#d3d3d3', attr: 'SYN' },
        { type: 'Inverted region', color: '#ffa500', attr: 'INV' },
        { type: 'Translocated region', color: '#008000', attr: 'TRANS' },
        { type: 'Duplicated region', color: '#0000ff', attr: 'DUP' }
    ];

    colors.forEach(entry => {
        const legendItem = document.createElement('div');
        legendItem.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            border-radius: 4px;
        `;

        // Create eye icon
        const eyeIcon = document.createElement('i');
        eyeIcon.setAttribute('class', 'fas fa-eye');
        eyeIcon.setAttribute('data-type', entry.attr);
        eyeIcon.style.cursor = 'pointer';
        eyeIcon.style.marginRight = '20px';
        eyeIcon.addEventListener('click', function() {
            if (eyeIcon.classList.contains('fa-eye')) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
            updateBandsVisibility();
        });

        // Create SVG for mini band
        const miniBandSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        miniBandSvg.setAttribute("width", "20");
        miniBandSvg.setAttribute("height", "20");
        miniBandSvg.style.marginRight = "10px";

        let refStartX = 1;
        let refEndX = 10;
        let refY = 1;

        let queryStartX = 10;
        let queryEndX = 19;
        let queryY = 19;

        // Inverser les positions queryStart et queryEnd pour les types d'inversion
        if (entry.type === 'Inverted region') {
            [queryStartX, queryEndX] = [queryEndX, queryStartX];
        }

        // Dessiner une bande courbée pour la correspondance
        const pathData = `
            M${refStartX},${refY}
            C${refStartX},${(refY + queryY) / 2} ${queryStartX},${(refY + queryY) / 2} ${queryStartX},${queryY}
            L${queryEndX},${queryY}
            C${queryEndX},${(refY + queryY) / 2} ${refEndX},${(refY + queryY) / 2} ${refEndX},${refY}
            Z
        `;

        const miniBand = document.createElementNS("http://www.w3.org/2000/svg", "path");
        miniBand.setAttribute("d", pathData);
        miniBand.setAttribute("fill", entry.color);
        miniBand.setAttribute("opacity", 0.5);

        miniBandSvg.appendChild(miniBand);

        const label = document.createElement('span');
        label.textContent = entry.type;

        legendItem.appendChild(eyeIcon);
        legendItem.appendChild(miniBandSvg);
        legendItem.appendChild(label);
        typeColumn.appendChild(legendItem);
    });

    // Deuxième colonne pour les filtres inter/intra
    const positionColumn = document.createElement('div');
    // positionColumn.innerHTML = '<h5 style="margin-bottom: 10px;">Position des bandes</h5>';

    // Créer le conteneur pour les filtres inter/intra
    const positionFilters = document.createElement('div');
    positionFilters.style.cssText = `
        display: flex;
        flex-direction: column;
    `;

    // Inter chromosomal
    const interDiv = document.createElement('div');
    interDiv.style.cssText = `
        display: flex;
        align-items: center;
        border-radius: 4px;
    `;

    // Checkbox for filtering bands
    const filterInterLabel = document.createElement('label');
    filterInterLabel.setAttribute('for', 'interchromosomal-filter');
    filterInterLabel.textContent = 'Interchromosomal bands';

    const filterInterCheckbox = document.createElement('i');
    filterInterCheckbox.setAttribute('class', 'fas fa-eye');
    filterInterCheckbox.setAttribute('id', 'interchromosomal-filter');
    filterInterCheckbox.style.cursor = 'pointer';
    filterInterCheckbox.style.marginRight = '20px';
    filterInterCheckbox.addEventListener('click', function() {
        if (filterInterCheckbox.classList.contains('fa-eye')) {
            filterInterCheckbox.classList.remove('fa-eye');
            filterInterCheckbox.classList.add('fa-eye-slash');
        } else {
            filterInterCheckbox.classList.remove('fa-eye-slash');
            filterInterCheckbox.classList.add('fa-eye');
        }
        updateBandsVisibility();
    });

    interDiv.appendChild(filterInterCheckbox);
    interDiv.appendChild(filterInterLabel);


    // Intra chromosomal
    const intraDiv = document.createElement('div');
    intraDiv.style.cssText = `
        display: flex;
        align-items: center;
        border-radius: 4px;
    `;

    const filterIntraLabel = document.createElement('label');
    filterIntraLabel.setAttribute('for', 'intrachromosomal-filter');
    filterIntraLabel.textContent = 'Intrachromosomal bands';

    const filterIntraCheckbox = document.createElement('i');
    filterIntraCheckbox.setAttribute('class', 'fas fa-eye');
    filterIntraCheckbox.setAttribute('id', 'intrachromosomal-filter');
    filterIntraCheckbox.style.cursor = 'pointer';
    filterIntraCheckbox.style.marginRight = '20px';
    filterIntraCheckbox.addEventListener('click', function() {
        if (filterIntraCheckbox.classList.contains('fa-eye')) {
            filterIntraCheckbox.classList.remove('fa-eye');
            filterIntraCheckbox.classList.add('fa-eye-slash');
        } else {
            filterIntraCheckbox.classList.remove('fa-eye-slash');
            filterIntraCheckbox.classList.add('fa-eye');
        }
        updateBandsVisibility();
    });

    intraDiv.appendChild(filterIntraCheckbox);
    intraDiv.appendChild(filterIntraLabel);

    // Assemblage des éléments
    positionFilters.appendChild(interDiv);
    positionFilters.appendChild(intraDiv);
    positionColumn.appendChild(positionFilters);

    // Ajouter les colonnes au conteneur
    columnsContainer.appendChild(typeColumn);
    columnsContainer.appendChild(positionColumn);
    
    // Ajouter le conteneur à la section des filtres
    filterDiv.appendChild(columnsContainer);
}


export function updateBandsVisibility() {
    const showIntra = !document.getElementById('intrachromosomal-filter').classList.contains('fa-eye-slash');
    const showInter = !document.getElementById('interchromosomal-filter').classList.contains('fa-eye-slash');

    const eyeIcons = document.querySelectorAll('i[data-type]');
    const selectedTypes = Array.from(eyeIcons)
        .filter(icon => !icon.classList.contains('fa-eye-slash'))
        .map(icon => icon.getAttribute('data-type'));

    const chromEyeIcons = document.querySelectorAll('i.chrom-eye-icon');
    const visibleChromosomes = Array.from(chromEyeIcons)
        .filter(icon => icon.classList.contains('fa-eye'))
        .map(icon => icon.getAttribute('data-chrom'));
        
    // Définir les dépendances des types
    const typeDependencies = {
        'INVTR': ['INV', 'TRANS'],  // INVTR nécessite que INV ET TRANS soient visibles
        'SYN': ['SYN'],
        'INV': ['INV'],
        'TRANS': ['TRANS'],
        'DUP': ['DUP']
    };

    d3.selectAll('path.band').each(function() {
        const band = d3.select(this);
        const bandPosType = band.attr('data-pos');
        const bandType = band.attr('data-type');
        const bandRef = band.attr('data-ref');
        const bandRefNum = band.attr('data-ref-num');
        const bandQuery = band.attr('data-query');
        const bandQueryNum = band.attr('data-query-num');
        const bandLength = parseInt(band.attr('data-length'));

        //modif pour fix bug = bandRefNum au lieu de bandRef
        const isVisibleChrom = visibleChromosomes.includes(bandRefNum) && visibleChromosomes.includes(bandQueryNum);
        // const isVisibleBandType = selectedTypes.includes(bandType);
        // Dans updateBandsVisibility()
        const isVisibleBandType = selectedTypes.some(type => type === bandType) || // Type directement visible
            (typeDependencies[bandType] && // Si c'est un type dépendant
            typeDependencies[bandType].every(parentType => // TOUS ses parents doivent être visibles
                selectedTypes.includes(parentType)
            ));
        const isVisibleBandPos = (bandPosType === 'intra' && showIntra) || (bandPosType === 'inter' && showInter);
        const isVisibleBandLength = bandLength >= sliderMinValue && bandLength <= sliderMaxValue;

        if (isVisibleChrom && isVisibleBandType && isVisibleBandPos && isVisibleBandLength) {
            band.attr('display', null);
        } else {
            band.attr('display', 'none');
        }
    });
    d3.selectAll('.chrom').each(function() {
        const chrom = d3.select(this);
        // const chromName = chrom.attr('id').split('_')[0];
        const chromNum = chrom.attr('chromNum');

        // if (visibleChromosomes.includes(chromName)) {
        if (visibleChromosomes.includes(chromNum)) {
            chrom.attr('display', null);
        } else {
            chrom.attr('display', 'none');
        }
    });
}

export function createSlider(minBandSize, maxBandSize) {
    console.log('create slider from ' + minBandSize + ' to ' + maxBandSize);

    //efface s'il existe déjà un slider
    const existingSliderContainer = document.getElementById('slider-container');
    if (existingSliderContainer) {
        existingSliderContainer.remove();
    }
    
    const sliderContainer = document.createElement('div');
    sliderContainer.setAttribute('id', 'slider-container');
    
    const sliderTitle = document.createElement('h5');
    sliderTitle.textContent = 'Band Length Filter';
    sliderTitle.style.margin = '20px 5px';

    const sliderElement = document.createElement('div');
    sliderElement.setAttribute('id', 'slider');

    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('id', 'chart-container');

    sliderContainer.appendChild(sliderTitle);
    sliderContainer.appendChild(sliderElement);
    sliderContainer.appendChild(chartContainer);

    // Trouver la section des filtres et ajouter le slider
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.appendChild(sliderContainer);
    }

    rangeSlider(sliderElement, {
        min: minBandSize - 10000,
        max: maxBandSize + 10000,
        step: 10000,
        value: [minBandSize - 10000, maxBandSize + 10000],
        disabled: false,
        rangeSlideDisabled: false,
        thumbsDisabled: [false, false],
        orientation: 'horizontal',
        onInput: function(valueSet) {
            sliderMinValue = valueSet[0];
            sliderMaxValue = valueSet[1];
            updateBandsVisibility();
        },
    });
}

export function createMergeSlider(min, max) {
    console.log('create slider from ' + min + ' to ' + max);

    //efface s'il existe déjà un slider
    const existingSliderContainer = document.getElementById('merge-slider-container');
    if (existingSliderContainer) {
        existingSliderContainer.remove();
    }
    
    const mergeSliderContainer = document.createElement('div');
    mergeSliderContainer.setAttribute('id', 'merge-slider-container');
    
    const sliderTitle = document.createElement('h5');
    sliderTitle.textContent = 'Merge band';
    sliderTitle.style.margin = '20px 5px';

    const sliderElement = document.createElement('div');
    sliderElement.setAttribute('id', 'merge-slider');

    // Ajoute un conteneur pour l'axe
    const axisContainer = document.createElement('div');
    axisContainer.setAttribute('id', 'merge-slider-axis');
    axisContainer.style.width = '100%';
    axisContainer.style.height = '30px';

    mergeSliderContainer.appendChild(sliderTitle);
    mergeSliderContainer.appendChild(sliderElement);
    mergeSliderContainer.appendChild(axisContainer);

    // Trouver la section des filtres et ajouter le slider
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.appendChild(mergeSliderContainer);
    }

    rangeSlider(sliderElement, {
        min: min,
        max: max,
        step: 1000,
        value: [min, max],
        disabled: false,
        rangeSlideDisabled: true,
        thumbsDisabled: [false, true],
        orientation: 'horizontal',
        onInput: function(valueSet) {
            sliderMinValue = valueSet[0];
            // updateBandsVisibility();
            console.log('Merge slider values:', sliderMinValue);
            // bands = tableau de toutes les bandes originales (non fusionnées)
            const mergedBands = mergeBands(bands, seuilMerge);
            console.log('Merged bands:', mergedBands);
        },
    });

    //supprime le slider de droite #merge-slider > .range-slider__thumb[data-upper
    const upperThumb = document.querySelector('#merge-slider > .range-slider__thumb[data-upper]');
    if (upperThumb) {
        upperThumb.style.display = 'none';
    }

    // Ajoute l'axe sous le slider
    createMergeSliderAxis(min, max, axisContainer);
}

function createMergeSliderAxis(min, max, container) {
    // Efface le contenu précédent
    container.innerHTML = '';

    const width = container.clientWidth || 300;
    const height = 30;
    const margin = { top: 0, right: 10, bottom: 0, left: 10 };

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const x = d3.scaleLinear()
        .domain([min, max])
        .range([margin.left, width - margin.right]);

    svg.append('g')
        .call(d3.axisBottom(x)
            .ticks(10)
            .tickFormat(d => `${(d / 1000).toFixed(0)} kb`)
        );
}

export function createLengthChart(bandLengths) {
    const barChartContainer = d3.select('#chart-container');
    barChartContainer.selectAll('*').remove(); // Efface tout le contenu existant

    barChartContainer.style('width', '100%');
    barChartContainer.style('height', '30px');

    const width = barChartContainer.node().clientWidth;
    const height = 30;
    const margin = { top: 10, right: 0, bottom: 30, left: 0 };

    const svg = barChartContainer.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(bandLengths)])
        .range([0, width - margin.left - margin.right]);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(500)); // Augmentez le nombre de seuils

    const bins = histogram(bandLengths);

    const colorScale = d3.scaleSequential(d3.interpolateRgb("white", "black"))
        .domain([0, d3.max(bins, d => d.length) / 1000]);

    // Créer le gradient linéaire pour le slider
    const gradientId = `sliderGradient`;
    const gradient = svg.append('defs').append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

    bins.forEach((bin, i) => {
        gradient.append('stop')
            .attr('offset', `${(x(bin.x0) / (width - margin.left - margin.right)) * 100}%`)
            .attr('stop-color', colorScale(bin.length));
    });

    // Appliquer le gradient fixe au slider
    const slider = d3.selectAll("#slider.range-slider");
    slider.style('background', `linear-gradient(to right, ${bins.map((bin, i) => `${colorScale(bin.length)} ${(x(bin.x0) / (width - margin.left - margin.right)) * 100}%`).join(', ')})`);

    // axe x
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x)
        .tickFormat(d => `${(d / 1000000).toFixed(1)}Mb`)); // Conversion en Mb
}


// Fusionne les bandes consécutives de même type et chromosomes si elles sont proches (distance ≤ threshold)
export function mergeBands(bands, threshold) {
    if (!bands || bands.length === 0 || threshold <= 0) return bands;

    // On trie pour que les bandes proches soient consécutives
    const sorted = [...bands].sort((a, b) => {
        if (a.refChr !== b.refChr) return a.refChr.localeCompare(b.refChr);
        if (a.queryChr !== b.queryChr) return a.queryChr.localeCompare(b.queryChr);
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.refStart - b.refStart;
    });

    const merged = [];
    let current = null;

    for (const band of sorted) {
        if (
            current &&
            band.refChr === current.refChr &&
            band.queryChr === current.queryChr &&
            band.type === current.type &&
            (band.refStart - current.refEnd <= threshold) &&
            (band.queryStart - current.queryEnd <= threshold)
        ) {
            // Fusionne la bande courante avec la précédente
            current.refEnd = band.refEnd;
            current.queryEnd = band.queryEnd;
            // (optionnel) tu peux aussi fusionner d'autres propriétés si besoin
        } else {
            if (current) merged.push(current);
            current = { ...band };
        }
    }
    if (current) merged.push(current);

    return merged;
}