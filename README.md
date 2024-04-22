# News

Hosted version: https://news-1-ejzq.onrender.com/api

## Project summary:

This project uses Node.js and PostgreSQL to construct a backend database and API. It handles client requests at different endpoints, providing the necessary data sourced from the news database in response.

> **_NOTE:_** : The minimum versions of Node.js and Postgres needed to run the project:

> - `Node.js:` v10.13.0
> - `Postgres` (PostgreSQL) : v8.7.3

### 1. Getting started

Clone the repository:

```
$ git clone https://github.com/ziani96/scoop.git
```

Navigate to the repository:

```
$ cd scoop
```

## 2. Enviroment variables

Create the files .env.development and .env.test in the root directory of the project.

Inside of .env.development, write `PGDATABASE=nc_news`

Inside of .env.test, write `PGDATABASE=nc_news_test`

If your local database needs a password for access, include it in the files by adding "PGPASSWORD=your-password-here". You can skip this if no password is needed.

### 3. Install the dependencies

Use the `npm install` command to install the dependencies:

```
$ npm install
```

### 4. Setup Local database

Run the following scripts to setup and seed the databases locally:

• To create the database:

```
$ npm run setup-dbs
```

• To seed the database:

```
$ npm run run seed
```

### 5. Run server

Listen to incoming requests by running the following:

```
$ node listen.js
```

This enables you to make requests to the API via localhost:9090/api. You may use tools such as Insomnia to send requests containing JSON.

# Run test

```
$ npm run test
```
