const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();

// Charger les certificats SSL
const options = {
    key: fs.readFileSync('/opt/httpd/conf/ssl/star_southgreen_fr.key'),
    cert: fs.readFileSync('/opt/httpd/conf/ssl/star_southgreen_fr_cert.pem')
};

// Créer un serveur HTTPS
const server = https.createServer(options, app);

// Configurer socket.io pour fonctionner avec HTTPS
const io = socketIo(server);

// Servir les fichiers statiques
app.use(express.static('public'));

// Gérer les connexions WebSocket
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

	socket.on('clientInfo', data => {
        console.log(`Le client s'est connecté depuis l'URL : ${data.url}`);
    });

    socket.on('sendData', (data) => {
        console.log('Données reçues :', data);
        io.emit('receiveData', data); // Diffuser les données à tous les clients
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté :', socket.id);
    });
});

// Démarrer le serveur sur le port 3000 
// config apache proxy reverse vers 443 (https)
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur HTTPS en cours d'exécution sur le port ${PORT}`);
});
