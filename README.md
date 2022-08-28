## Tasks

## Description

The backend repo of tasks

an application for task management for teams

- [x] A User can create workspace/s and add other users to or remove them from the workspace he created\
- [x] only the creator of the workspace can add or remove users
- [x] users in the workspace can post tasks in the workspace 
- [x] only users in the workspace can view the tasks in that workspace
- [x]  users in workspace assign it to one or more users in the same workspace
- [x] workspace creator or task poster can edit the task
- [x] workspace creator or task poster can delete the task

## Installation

```bash
$ npm install
```

## Running the app

creating the postgres database for development 

```bash
docker-compose up db -d

```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Swagger (OpenAPI)

you can access the swagger API schema through the endpoint (dev mode) 

``` localhost:8000/api ```