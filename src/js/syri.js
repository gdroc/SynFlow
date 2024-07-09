import { createForm,  } from './form.js';
import { handleFileUpload} from './process.js';

console.log("syri");

document.addEventListener('DOMContentLoaded', () => {
    createForm();

    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', () => {
        const chrlenFiles = document.getElementById('chrlen-files').files;
        const bandFiles = document.getElementById('band-files').files;
        handleFileUpload(chrlenFiles, bandFiles);
    });
    
    // Définir le comportement de zoom
    const zoom = d3.zoom()
    .scaleExtent([0.1, 10]) // Définir les niveaux de zoom minimum et maximum
    .on("zoom", (event) => {
        d3.select('#zoomGroup').attr("transform", event.transform);
    });

    d3.select("#viz").call(zoom);

    // Ajoutez un groupe à l'intérieur de l'élément SVG pour contenir les éléments zoomables
    d3.select("#viz").append("g").attr("id", "zoomGroup");
});

