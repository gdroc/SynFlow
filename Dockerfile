FROM condaforge/mambaforge:latest  
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    git \
    wget \
    curl \
    fuse-overlayfs \
    squashfs-tools \
    uidmap \
    nginx \
    supervisor \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN mamba install -y -c conda-forge apptainer \
    && mamba clean -afy


RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
# Web directory
WORKDIR /app

# Clone Snakemake workflow first to access envs/synflow.yaml
RUN git clone https://gitlab.cirad.fr/agap/cluster/snakemake/synflow.git /app/workflow

# Create conda environment with mamba
WORKDIR /app/workflow/containers
RUN wget -q -O diamond.2.13.sif https://depot.galaxyproject.org/singularity/diamond%3A2.1.13--h13889ed_0 && \
wget -q -O minimap2.2.28.sif https://depot.galaxyproject.org/singularity/minimap2%3A2.28--he4a0461_3 && \
wget -q -O gffread.0.12.7.sif https://depot.galaxyproject.org/singularity/gffread%3A0.12.7--hdcf5f25_4 && \
wget -q -O syri.1.7.0.sif https://depot.galaxyproject.org/singularity/syri%3A1.7.0--py310hdbdd923_0 && \
wget -q -O mummer4.sif https://depot.galaxyproject.org/singularity/mummer4%3A4.0.1--pl5321h9948957_0 && \
wget -q -O mcscan.1.0.0.sif https://depot.galaxyproject.org/singularity/mcscanx%3A1.0.0--h9948957_0
 

# Clone the SynFlow application (vanilla JavaScript)
RUN git clone https://github.com/SouthGreenPlatform/SynFlow.git /var/www/html/synflow

WORKDIR /var/www/html/synflow
RUN npm install  
# Create directories for shared volumes

RUN mkdir -p /data/comparisons \
    /data/comparisons/sample \
    /data/input \
    /data/output \
    /data/uploads && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-acuminata-malaccensis.bed https://hpc.cirad.fr/bank/banana/synflow/m-acuminata-malaccensis.bed && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-balbisiana.bed https://hpc.cirad.fr/bank/banana/synflow/m-balbisiana.bed && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-acuminata-malaccensis_m-balbisiana.anchors https://hpc.cirad.fr/bank/banana/synflow/m-acuminata-malaccensis_m-balbisiana.anchors && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-acuminata-malaccensis_m-balbisiana.out https://hpc.cirad.fr/bank/banana/synflow/m-acuminata-malaccensis_m-balbisiana.out && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-balbisiana_m-acuminata-malaccensis.anchors https://hpc.cirad.fr/bank/banana/synflow/m-balbisiana_m-acuminata-malaccensis.anchors && \
    wget  --no-check-certificate -q -O /data/comparisons/sample/m-balbisiana_m-acuminata-malaccensis.out https://hpc.cirad.fr/bank/banana/synflow/m-balbisiana_m-acuminata-malaccensis.out

# Create directory data if it doesn't exist and create the symbolic link
RUN mkdir -p /var/www/html/synflow/data && \
    ln -sf /data/comparisons /var/www/html/synflow/data/comparisons

# Create Node.js server to handle uploads and trigger the pipeline
RUN mkdir -p /app/nodejs-server

RUN echo 'const express = require("express");\n\
const fileUpload = require("express-fileupload");\n\
const fs = require("fs");\n\
const path = require("path");\n\
const cors = require("cors");\n\
\n\
const app = express();\n\
const PORT = 3000;\n\
\n\
app.use(cors());\n\
app.use(express.json());\n\
app.use(fileUpload({\n\
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max\n\
    useTempFiles: true,\n\
    tempFileDir: "/tmp/"\n\
}));\n\
\n\
// Upload de génomes\n\
app.post("/api/upload", (req, res) => {\n\
    if (!req.files || !req.files.genome) {\n\
        return res.status(400).json({ error: "No file uploaded" });\n\
    }\n\
    const file = req.files.genome;\n\
    const uploadPath = path.join("/data/input", file.name);\n\
    \n\
    file.mv(uploadPath, (err) => {\n\
        if (err) return res.status(500).json({ error: err.message });\n\
        res.json({ success: true, filename: file.name });\n\
    });\n\
});\n\
\n\
// Déclencher le pipeline\n\
app.post("/api/trigger-pipeline", (req, res) => {\n\
    const config = req.body;\n\
    const configPath = "/data/input/run_pipeline.json";\n\
    \n\
    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {\n\
        if (err) return res.status(500).json({ error: err.message });\n\
        res.json({ success: true, message: "Pipeline triggered" });\n\
    });\n\
});\n\
\n\
// Statut du pipeline\n\
app.get("/api/pipeline-status", (req, res) => {\n\
    const triggerExists = fs.existsSync("/data/input/run_pipeline.json");\n\
    res.json({ running: triggerExists });\n\
});\n\
\n\
app.listen(PORT, "0.0.0.0", () => {\n\
    console.log(`Node.js API server running on port ${PORT}`);\n\
});\n\
' > /app/nodejs-server/server.js

# Install dependencies Node.js
#WORKDIR /app/nodejs-server
#RUN npm init -y && \
#    npm install express express-fileupload cors

# Configure Nginx to serve static application and proxy to Node.js
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /var/www/html/synflow;\n\
    index index.html;\n\
    client_max_body_size 500M;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Proxy pour l API Node.js\n\
    location /api/ {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    # Autoriser l accès aux fichiers de comparaison\n\
    location /data/comparisons {\n\
        alias /data/comparisons;\n\
        autoindex on;\n\
        autoindex_format json;\n\
        add_header Access-Control-Allow-Origin *;\n\
    }\n\
\n\
    # Upload de fichiers\n\
    location /uploads {\n\
        alias /data/uploads;\n\
    }\n\
}\n\
' > /etc/nginx/sites-available/default

# Configure Supervisor to manage Nginx, Node.js and the Snakemake worker
RUN echo '[supervisord]\n\
nodaemon=true\n\
\n\
[program:nginx]\n\
command=/usr/sbin/nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:nodejs]\n\
command=/usr/bin/node  /var/www/html/synflow/src/server.js\n\
directory=/var/www/html/synflow/\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:snakemake_watcher]\n\
command=/app/snakemake_watcher.sh\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Script for monitoring and executing the Snakemake workflow with the conda environment activated
RUN echo '#!/bin/bash\n\
echo "Snakemake watcher started..."\n\
\n\ 
\n\
echo "Python: $(which python)"\n\
echo "Snakemake: $(which snakemake)"\n\
\n\
while true; do\n\
    # Vérifier si un fichier trigger existe\n\
    if [ -f /data/input/run_pipeline.json ]; then\n\
        echo "Pipeline trigger detected, starting Snakemake..."\n\
        cd /app/workflow\n\
        \n\
        # Exécuter le workflow avec l environnement conda activé\n\
        snakemake --cores 4 --directory /data/output --configfile /data/input/run_pipeline.json --use-conda\n\
        \n\
        # Copier les résultats vers le répertoire comparisons\n\
        if [ $? -eq 0 ]; then\n\
            echo "Pipeline completed successfully"\n\
            cp /data/output/*.out /data/comparisons/ 2>/dev/null || true\n\
            echo "Results copied to /data/comparisons/"\n\
        else\n\
            echo "Pipeline failed"\n\
        fi\n\
        \n\
        # Supprimer le trigger\n\
        rm /data/input/run_pipeline.json\n\
    fi\n\
    sleep 5\n\
done\n\
' > /app/snakemake_watcher.sh && chmod +x /app/snakemake_watcher.sh


# Show port configuration
EXPOSE 80 3000

# Define volumes
VOLUME ["/data/comparisons", "/data/input", "/data/output", "/data/uploads"]

WORKDIR /app

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
