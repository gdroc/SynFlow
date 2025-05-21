//globale
let sliderMinValue = 0;
let sliderMaxValue = Infinity;

export function createLegendContainer() {
    // Container for legend
    const legendContainer = document.createElement('div');
    legendContainer.setAttribute('id', 'legend-container');

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

export function generateLegend() {
    const legendDiv = document.getElementById('legend');
    legendDiv.innerHTML = ''; // Clear previous legend

    const colors = [
        { type: 'Syntenic region', color: '#d3d3d3', attr: 'SYN' },
        { type: 'Inverted region', color: '#ffa500', attr: 'INV' },
        { type: 'Translocated region', color: '#008000', attr: 'TRANS' },
        { type: 'Duplicated region', color: '#0000ff', attr: 'DUP' }
    ];

    colors.forEach(entry => {
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.marginBottom = '5px';

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
        legendDiv.appendChild(legendItem);
    });

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

    legendDiv.appendChild(filterInterCheckbox);
    legendDiv.appendChild(filterInterLabel);
    legendDiv.appendChild(document.createElement('br'));
    legendDiv.appendChild(filterIntraCheckbox);
    legendDiv.appendChild(filterIntraLabel);
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
    
    console.log('visibleChromosomes', visibleChromosomes);

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
        const isVisibleBandType = selectedTypes.includes(bandType);
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

    const rangeNode = document.getElementById('range-slider-example');
    rangeNode.innerHTML = ''; // Supprime le contenu existant avant de réécrire

    // Supprime l'ancien titre s'il existe
    const existingTitle = document.getElementById('slider-title');
    if (existingTitle) {
        existingTitle.parentNode.removeChild(existingTitle);
    }

    const title = document.createElement('span');
    title.id = 'slider-title'; // Ajout d'un ID pour le titre
    title.textContent = "Filter band length";
    title.appendChild(document.createElement('br'));
    title.appendChild(document.createElement('br'));

    let parentDiv = rangeNode.parentNode;
    parentDiv.insertBefore(title, rangeNode);

    rangeSlider(rangeNode, {
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

export function createLengthChart(bandLengths) {
    const barChartContainer = d3.select('#bar-chart-container');
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
    const slider = d3.selectAll(".range-slider");
    slider.style('background', `linear-gradient(to right, ${bins.map((bin, i) => `${colorScale(bin.length)} ${(x(bin.x0) / (width - margin.left - margin.right)) * 100}%`).join(', ')})`);

    // axe x
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));
}
