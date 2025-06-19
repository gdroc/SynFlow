import { createForm } from './form.js';
import { createControlPanel } from './legend.js';
import { createGraphSection } from './draw.js';
import { setupAnalytics } from './analytics.js';

console.log("syri");
 // Définir le comportement de zoom
// export const zoom = d3.zoom()
//     .scaleExtent([0.1, 10]) // Définir les niveaux de zoom minimum et maximum
//     .on("zoom", (event) => {
//     d3.select('#zoomGroup').attr("transform", event.transform);
// });

document.addEventListener('DOMContentLoaded', () => {

    const mainContainer = document.getElementById('main-container');
    mainContainer.appendChild(createForm());
    mainContainer.appendChild(createControlPanel());
    mainContainer.appendChild(createGraphSection());    

    setupAnalytics();
});

