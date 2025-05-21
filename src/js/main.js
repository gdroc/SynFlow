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
    createLegendContainer();
    createToolkitContainer();

    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', () => {

        const visualizationContainer = document.getElementById('viz');
        visualizationContainer.innerHTML = ''; // Efface le contenu existant

        d3.select("#viz").call(zoom);

        // Ajoutez un groupe à l'intérieur de l'élément SVG pour contenir les éléments zoomables
        d3.select("#viz").append("g").attr("id", "zoomGroup");

        ///////////////changement
        const bandFiles = document.getElementById('band-files').files;
        handleFileUpload(bandFiles);
    });



    ///////////////
    //TOOLKIT
    ///////////////
    
    // //crée le container pour le module toolkit
    // const toolkitContainer = document.createElement("div");
    // toolkitContainer.id = "toolkitContainer";    
    // document.body.appendChild(toolkitContainer);

    // // Option pour générer le selecteur de service ou appeler un service spécifique
    // const generateSelect = true;
    // const serviceName = 'synflow';

    // // Chargement des services lors du chargement de la page
    // toolkit.loadServices()
    //   .then(() => {
    //     if(generateSelect){
    //       // Appeler la fonction populateServiceSelect après le chargement
    //       toolkit.populateServiceSelect();
    //     }else{
    //       toolkit.generateForm(serviceName);
    //     }
        
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
    
});

