# Getting started

-   Ensure you have docker desktop installed for the database.
-	Use Python 3.11 or higher 

## Python Package Management

Package management is done with pip.

When you first start, make a venv by running `python -m venv .venv` in the `/src/backend` repo. You can active the venv from the root of the project by running `./src/backend/.venv/Scripts/activate`. (There are other forms of the scripts for windows)
To deactivate the venv run `deactivate`

Once in the venv, you can run `pipe install -r requirements.txt`, which will download all packages specified.

If you want to add a package, make sure to add it to the `requirements.txt`.

## Booting up the Database

Create a docker container called 'WaitFaster-MongoDb', exposed on port 27017 (Mongo default)
`docker run --name WaitFaster-MongoDb mongo:latest -p 27017:27017`

## Running Python API

Development (hot reload): `flask --app ./src/backend/__init__ run --debug`
