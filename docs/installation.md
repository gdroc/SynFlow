# Installation 

This document provides instructions to install and run **SynFlow** using Docker.

**Clone the Repository**

```bash
git clone https://github.com/SouthGreenPlatform/SynFlow.git
cd SynFlow
```

**Build the Docker Image**

```bash
docker build -t synflow .
```

This command builds a lightweight Nginx-based Docker image containing the full SynFlow web application and some example data files.

**Run the Application**

```bash
docker run --rm -p 8080:80 synflow
```

Then open your browser and navigate to:

```
http://localhost:8080
```
 
 When building the Docker image, 5 example files are automatically downloaded to the `/public/data/` directory:

- config.json
- DH-200-94_C21-464.out 
- C21-464_C23-A03.out 
- C23-A03_C45-410.out  
- C45-410_C5-126-2.out

These allow you to test the interface immediately.


**Using Your Own Data**

You can mount your own directory at runtime to replace or extend the `public/data` folder:

```bash
docker run --rm -p 8080:80 \
  -v $(pwd)/my_data:/usr/share/nginx/html/public/data \
  synflow
```

**Requirements**

- [Docker](https://docs.docker.com/get-docker/) version 20.x or higher

**Support**

If you encounter issues, feel free to open an [Issue on GitHub](https://github.com/SouthGreenPlatform/SynFlow/issues).