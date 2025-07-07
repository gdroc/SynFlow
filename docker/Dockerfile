# Dockerfile pour servir SynFlow avec Nginx

FROM nginx:alpine 

# Copier tous les fichiers du repo dans le répertoire de Nginx
COPY . /usr/share/nginx/html/

# Créer le dossier de données s'il n'existe pas
RUN mkdir -p /usr/share/nginx/html/public/data && \
    # Télécharger des fichiers d'exemple (optionnels)
    wget -q -O /usr/share/nginx/html/public/data/C21-464_C23-A03.out  https://synflow.southgreen.fr/public/data/C21-464_C23-A03.out && \
    wget -q -O /usr/share/nginx/html/public/data/C23-A03_C45-410.out  https://synflow.southgreen.fr/public/data/C23-A03_C45-410.out && \
    wget -q -O /usr/share/nginx/html/public/data/C45-410_C5-126-2.out  https://synflow.southgreen.fr/public/data/C45-410_C5-126-2.out && \
    wget -q -O /usr/share/nginx/html/public/data/DH-200-94_C21-464.out  https://synflow.southgreen.fr/public/data/DH-200-94_C21-464.out && \
    wget -q -O /usr/share/nginx/html/public/data/config.json  https://synflow.southgreen.fr/public/data/config.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
