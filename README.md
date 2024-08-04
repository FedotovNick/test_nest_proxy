# NestJS HTTP Proxy Server

This project is an HTTP proxy server built using NestJS and `http-proxy-middleware`. The server redirects requests with specific paths to a target server. The project is packaged in a Docker container for easy deployment.

## Hosts:

- Target host - http://localhost:3000
- Source host - https://docs.nestjs.com

## Requirements

- Node.js (v20 or higher)
- Docker
- Docker Compose

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:FedotovNick/test_nest_proxy.git
   cd test_nest_proxy

   ```

2. Install dependencies:

   ```bash
   npm install

   ```

3. Run the server
   ```bash
   docker-compose up --build
   ```

## Project Structure

src/: Source files of the project.

docker/: Docker configuration files.

docker-compose.yml: Configuration file for Docker Compose.
