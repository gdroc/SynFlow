# Installation Guide — SynFlow

This document provides instructions to install and run **SynFlow**, a web-based genome synteny visualization tool, using Docker.

---

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/SouthGreenPlatform/SynFlow.git
cd SynFlow
```

### 2. Build the Docker Image

```bash
docker build -t synflow .
```

This command builds a lightweight Nginx-based Docker image containing the full SynFlow web application and some example data files.

### 3. Run the Application

```bash
docker run --rm -p 8080:80 synflow
```

Then open your browser and navigate to:

```
http://localhost:8080
```

---

## Example Data Included

When building the Docker image, two example files are automatically downloaded to the `/public/data/` directory:

- `example.syri.out`

These allow you to test the interface immediately.

---

## Using Your Own Data

You can mount your own directory at runtime to replace or extend the `public/data` folder:

```bash
docker run --rm -p 8080:80 \
  -v $(pwd)/my_data:/usr/share/nginx/html/public/data \
  synflow
```

---

## Advanced (Optional)

To customize the behavior of the Nginx server (e.g., headers, caching), you can provide your own `nginx.conf` and modify the Dockerfile accordingly.

---

## Requirements

- [Docker](https://docs.docker.com/get-docker/) version 20.x or higher

---

## Support

If you encounter issues, feel free to open an [Issue on GitHub](https://github.com/SouthGreenPlatform/SynFlow/issues).
