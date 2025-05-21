import { createForm, createToolkitContainer } from './form.js';
import { createLegendContainer } from './legend.js';
import { handleFileUpload} from './process.js';
// import * as toolkit from '../../../toolkit/toolkit.js';

console.log("syri");
 // Définir le comportement de zoom
export const zoom = d3.zoom()
    .scaleExtent([0.1, 10]) // Définir les niveaux de zoom minimum et maximum
    .on("zoom", (event) => {
    d3.select('#zoomGroup').attr("transform", event.transform);
});

document.addEventListener('DOMContentLoaded', () => {
    createForm();
    
});

