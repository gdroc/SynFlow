// Déclarer la variable socket globalement pour qu'elle soit accessible partout dans le script
let socket = null;
let servicesData = {};  // Contiendra les services et databases
let databasesData = {};  // Stocke les databases séparément
let serviceName = '';  // Nom du service sélectionné


/**
 * Fonction pour initier toolkit
 * @param {boolean} generateSelect - Booléen pour déterminer si l'on génère le selecteur de service ou pas
 * @param {string} serviceName - Nom du service sélectionné, si pas de selecteur
 * 
 * Exécute les étapes suivantes :
 * 1. Charge le script Socket.IO
 * 2. Initialise la connexion Socket.IO
 * 3. Charge le JSON avec les services et les bases de données
 * 4. Selon generateSelect, génère le formulaire ou appelle la fonction populateServiceSelect
 */
export function initToolkit(generateSelect, serviceName) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.fontSize = '18px';
    loadingIndicator.style.fontWeight = 'bold';
    loadingIndicator.style.color = '#333';
    loadingIndicator.style.backgroundColor = '#fff';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '10px';
    loadingIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    loadingIndicator.style.fontFamily = 'Montserrat, sans-serif'; // Ajouter une police moderne
    loadingIndicator.textContent = 'Loading toolkit...';
    const toolkitContainer = document.getElementById("toolkitContainer");
    toolkitContainer.appendChild(loadingIndicator);

    console.log('1Initializing toolkit...');
    // Charger et initialiser Socket.IO
    loadSocketIOScript()
        .then(() => {
            console.log('2Socket.IO chargé avec succès.');
            initSocketConnection();  // Initialiser la connexion après le chargement
        })
        .then(() => {
            console.log('3Loading services...');
            // Charger le JSON avec les services et les bases de données
            return loadServices();
        })
        .then(() => {
            if(generateSelect){
                console.log('4Generating select...');
                // Appeler la fonction populateServiceSelect aprés le chargement
                populateServiceSelect();
                toolkitContainer.removeChild(loadingIndicator); // Supprimer le message de chargement

            }else{
                console.log('5Generating form...');
                generateForm(serviceName);
                toolkitContainer.removeChild(loadingIndicator); // Supprimer le message de chargement

            }
        })
        .catch(error => {
            console.error('Error initializing toolkit:', error);
            toolkitContainer.removeChild(loadingIndicator); // Supprimer le message de chargement

        });
}


/**
 * Fonction pour injecter le script Socket.IO dans le document
 * @return {Promise} Une promesse qui se résout lorsque le script est chargé
 */
export function loadSocketIOScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        // URL du script Socket.IO
        script.src = 'https://cdn.socket.io/4.0.0/socket.io.min.js';

        // Fonction callback pour lorsque le script est chargé
        script.onload = () => resolve();

        // Fonction callback pour lorsque le script n'a pas pu être chargé
        script.onerror = () => reject(new Error('Erreur lors du chargement de Socket.IO'));

        // Ajouter le script au document
        document.head.appendChild(script);
    });
}

/**
 * Fonction pour initialiser la connexion Socket.IO après le chargement du script
 * @return {void} N'a pas de valeur de retour
 */
export function initSocketConnection() {
    // Créer la connexion Socket.IO
    socket = io('https://wsp1453.southgreen.fr', { transports: ['websocket'] });
    
    // Envoyer les infos du client au serveur
    socket.emit('clientInfo', { url: window.location.href });

    // Écouter les messages du serveur
    socket.on('consoleMessage', function(message) {
        // Ajouter le message à la console
        addToConsole(`<pre>${message}<pre>`);
    });

    // Gérer les erreurs de connexion
    socket.on('connect_error', (error) => {
        // Afficher l'erreur de connexion
        console.error('Erreur de connexion à Socket.IO :', error);
    });

    socket.on('outputResult', (data) => {
        // Ajouter le message à la console
        console.log(`${data}`);
        const toolkitID = data.split('/')[7];
        const fileName = data.split('/')[8];
        const path = `https://gemo.southgreen.fr/tmp/toolkit_run/${toolkitID}/${fileName}`;
        // Créer et déclencher un événement personnalisé
        const event = new CustomEvent('ToolkitResultEvent', { detail: path });
        document.dispatchEvent(event);
    });

    socket.on('outputResultOpal', (data) => {
        // Ajouter le message à la console
        console.log(`${data}`);
        //transforme le path en URL
        //exemple : path = /opt/projects/gemo.southgreen.fr/prod/tmp/toolkit_run/toolkit_mPyhtgJXDWApk9wvAAAL/ref_querry.out
        //exemple url = https://gemo.southgreen.fr/tmp/toolkit_run/toolkit_mPyhtgJXDWApk9wvAAAL/ref_querry.out
        const toolkitID = data.split('/')[7];
        const fileName = data.split('/')[8];
        const path = `https://gemo.southgreen.fr/tmp/toolkit_run/${toolkitID}/${fileName}`;
        // Créer et déclencher un événement personnalisé
        const event = new CustomEvent('ToolkitResultEvent', { detail: path });
        document.dispatchEvent(event);
    });
}

/**
 * Loads the services and databases from the specified JSON file.
 * @return {Promise<void>} A promise that resolves when the services and databases are loaded.
 */
export function loadServices() {
    return new Promise((resolve, reject) => {
        // Fetch the services and databases from the JSON file
        fetch('/toolkit/services.json')
            .then(response => response.json())  // Parse the JSON response
            .then(data => {
                // Store the parsed services and databases in global variables
                servicesData = data.services;
                databasesData = data.databases;
                console.log(servicesData);
                resolve();
            })
            .catch(error => {
                // Log any errors that occur during the fetch operation
                console.error('Error loading services:', error);
                reject(error);
            });
    });
}

/**
 * Génère le menu déroulant des services
 * @return {void} N'a pas de valeur de retour
 */
export function populateServiceSelect() {
    console.log('populateServiceSelect() called');
    const toolkitContainer = document.getElementById("toolkitContainer");

    // Crée le select element
    const serviceSelect = document.createElement("select");
    serviceSelect.id = "serviceSelect";    
    serviceSelect.innerHTML = '<option value="">--Select a service--</option>'; // Reset de la liste

    // Loop through the services and create an option for each one
    console.log('servicesData:', servicesData);
    for (const serviceKey in servicesData) {
        console.log('serviceKey:', serviceKey);
        const option = document.createElement("option");
        option.value = serviceKey;
        option.textContent = servicesData[serviceKey].label;
        serviceSelect.appendChild(option);
    }

    // Ajoutez l'événement onchange
    serviceSelect.onchange = function() {
        const selectedService = serviceSelect.value;
        console.log('selectedService:', selectedService);
        // Faites quelque chose lorsque l'utilisateur sélectionne un nouveau service
        console.log(`Service sélectionné : ${selectedService}`);
        generateForm(selectedService);
    };

    // Append the select element to the DOM
    toolkitContainer.appendChild(serviceSelect);
    console.log('serviceSelect appended to toolkitContainer');
}

// Fonction pour générer le formulaire en fonction du service sélectionné
/**
 * Génère le formulaire en fonction du service sélectionné
 * @param {string} selectedService Le nom du service sélectionné
 * @return {void} N'a pas de valeur de retour
 */
export function generateForm(selectedService) {
    const toolkitContainer = document.getElementById("toolkitContainer");
    serviceName = selectedService;

    // Vérifier si le conteneur du formulaire existe déjà
    let formContainer = document.getElementById("formContainer");

    // Si le conteneur n'existe pas, le créer
    if (!formContainer) {
        formContainer = document.createElement("div");
        formContainer.id = "formContainer";  // Assign the ID
        toolkitContainer.appendChild(formContainer);  // Append it to the body or a specific parent element
    }

    // Vérifier si la console existe déjà
    let consoleDiv = document.getElementById("console");

    // Si la console n'existe pas, la créer
    if (!consoleDiv) {
        consoleDiv = document.createElement("div");
        consoleDiv.id = "console";
        // consoleDiv.style.border = "1px solid #000";
        // consoleDiv.style.padding = "10px";
        // consoleDiv.style.marginTop = "20px";
        // consoleDiv.style.height = "200px";
        // consoleDiv.style.overflowY = "scroll";  // Pour permettre le défilement
        toolkitContainer.appendChild(consoleDiv);  // Ajouter la console au body ou un autre élément
    }

    // On vide le conteneur du formulaire à chaque fois
    formContainer.innerHTML = "";
    consoleDiv.innerHTML = "<p>Console :</p>";

    // Vérification si un service est sélectionné
    if (selectedService && servicesData[selectedService]) {
        const service = servicesData[selectedService];
        const fields = service.arguments.inputs;

        // Pour chaque champ dans le service sélectionné, on génère un input
        fields.forEach(field => {
            const label = document.createElement("label");
            label.textContent = field.label;
            label.htmlFor = field.name;

            let input;
            // Si c'est un select (par exemple pour la base de données)
            if (field.type === "select") {
                input = document.createElement("select");
                input.name = field.name;

                // Récupérer les options à partir de la source dans databases
                const options = databasesData[field.optionsSource];  // Référence à la bonne liste de databases
                options.forEach(optionValue => {
                    const option = document.createElement("option");
                    option.value = optionValue;
                    option.textContent = optionValue;
                    input.appendChild(option);
                });
            } else if (field.type === "text") {
                input = document.createElement("input");
                input.type = "text";
                input.name = field.name;
                input.value = field.default || "";
            } else if (field.type === "file") {
                input = document.createElement("input");
                input.type = "file";
                input.name = field.name;
            }

            // Ajouter l'attribut "required" si nécessaire
            if (field.required) {
                input.required = true;
            }

            // Ajout du label et de l'input au formulaire
            formContainer.appendChild(label);
            formContainer.appendChild(input);
            formContainer.appendChild(document.createElement("br"));
        });

        // Ajout du bouton submit
        const submitButton = document.createElement("button");
        submitButton.id = "submitBtn";
        submitButton.textContent = "Submit";
        submitButton.onclick = (event) => {
            event.preventDefault();
            // Faites quelque chose lorsque le bouton est cliqué
            submitForm();
            console.log("Bouton cliqué !");      
        };  
        formContainer.appendChild(submitButton);
    }
}

/**
 * Ajouter un message à la console HTML
 * @param {string} message - Le message à ajouter
 */
function addToConsole(message) {
    const consoleDiv = document.getElementById("console");
    const messageElement = document.createElement("p");

    // Utilisation de innerHTML pour que les balises HTML (comme <pre>) soient interprétées
    // Par exemple, si le message est "<pre>hello</pre>", cela ajoutera un élément <pre> contenant le texte "hello" au messageElement
    messageElement.innerHTML = message;

    // Ajouter le messageElement à la fin de la consoleDiv
    consoleDiv.appendChild(messageElement);

    // Faire défiler vers le bas pour afficher le dernier message
    // La propriété scrollHeight contient la hauteur totale de l'élément, y compris la partie qui est hors de l'écran
    // La propriété scrollTop définit la position de défaut du scroll, à 0,0
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

/**
 * Fonction pour soumettre le formulaire avec les fichiers via FormData
 * 
 * @returns {void} N'a pas de valeur de retour
 */
function submitForm() {
    const serviceSelect = document.getElementById("serviceSelect");
    let selectedService;

    if (serviceSelect) {
        selectedService = serviceSelect.value;
        console.log(`Service sélectionné : ${selectedService}`);

    } else {
        selectedService = serviceName;
        console.log(`Service sélectionné : ${selectedService}`);

    }
    
    const serviceData = servicesData[selectedService];
    const formContainer = document.getElementById("formContainer");

    const formData = new FormData();

    // Récupérer tous les inputs du formulaire (y compris fichiers et sélection)
    Array.from(formContainer.querySelectorAll("input, select")).forEach(input => {
        if (input.type === "file" && input.files.length > 0) {
            formData.append(input.name, input.files[0]);  // Ajouter chaque fichier au FormData
        } else {
            formData.append(input.name, input.value);  // Ajouter les valeurs texte ou sélection
        }
    });

    // Envoyer les fichiers et paramètres via fetch
    fetch('https://wsp1453.southgreen.fr/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        addToConsole('Fichiers et paramètres envoyés avec succès:');
        addToConsole(JSON.stringify(data, null, 2));
        // Ensuite, lancer l'exécution du service via Socket.IO ou un autre mécanisme
        try {
            socket.emit('runService', selectedService, serviceData, data);
        } catch (error) {
            addToConsole('Erreur lors de run service:', error);
        }
    }).catch((error) => {
        addToConsole('Erreur lors de l\'envoi:', error);
    });
}
