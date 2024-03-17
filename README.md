## News

Hosted version: https://news-1-ejzq.onrender.com.api

## Project summary:

This project is a news blog where users can create and share articles on various topics. Users can also engage in discussions by posting comments on articles.

## Getting started:

To run this project locally, follow these steps:

## Prerequisites:

Make sure you have the following installed:

Node.js (minimum version: 10.13.0. )
Postgresql (minimum version: "8.7.3")

## Clone the repository

git clone https://github.com/ziani96/news.git

## Install dependencies

npm install

## Database setup

1.create a local Postgresql database

2.seed the database with the sample date

## Enviroment variables

create 2 .env files in the project root
For development: .env.development
For testing: .env.test

Open each .env file and add the following variables:

## .env.development

DATABASE_URL= <'your database url'>
SECRET_KEY=your_secret_key

## .env.test

DATABASE_URL= <'your database url'>
SECRET_KEY=test_secret_key

## Ensure these files are .gitignored

# Run test

npm run test

# Start server

npm start
