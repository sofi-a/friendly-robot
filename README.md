# Friendly Robot

Friendly robot is a simple Gmail client application that syncs your Gmail account with a virtual assistant that suggests replies to your emails.

## Installation

### Nodejs

Check if you have [Nodejs](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/en/docs/install) installed

```bash
node -v
yarn -v
```

#### Install dependencies

```bash
yarn
```

#### Start the application

##### Development

```bash
yarn start
```

##### Production

```bash
yarn start:prod
```

### Docker

Check if you have installed [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/)

```bash
docker -v
docker-compose -v
```

#### Build and run docker image

##### Development

```bash
docker-compose -f docker-compose-dev.yml up --build
```

##### Production

```bash
docker-compose -f docker-compose-prod.yml up --build
```
