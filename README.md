# Getting started

-   Ensure you have docker desktop installed for the database.
-   Use Python 3.11 or higher
-   Node version 18 or higher

## Quick Start

Use `docker compose up -d` to start up the docker compose containers.

## Part One: Database.

From the root of the directory, run the command: `docker run --name wait-faster-db -p 27017:27017 -d mongo:latest`

## Part two: Backend

1. From the root of the repository, cd into the ./src/backend folder.
1. From there, run the command `python -m venv .venv` which will create a virtual environment into which we can install the relevant python packages.
1. Run `.venv/Scripts/activate` to activate the python environment.
1. Run `pip install -r requirements.txt` to install all the relevant python packages required.
1. Copy the file `.env.Template` and rename it `.env`. This file contains all the backend configuration required.
1. Run the backend using the command `uvicorn main:app` to run the app on the default port.

## Part three: Frontend

1. From the root of the repository, cd into the ./src/frontend folder.
1. From there, run `npm i` to install the relevant javascript packages.
1. Copy the file `.env.Template` and rename it `.env`. This file contains all the frontend configuration required.
1. Run the frontend using `npm run dev`

## Python Package Management

Package management is done with pip.

When you first start, make a venv by running `python -m venv .venv` in the `/src/backend` repo. You can activate the venv from the root of the project by running `./src/backend/.venv/Scripts/activate`. (There are other forms of the scripts for windows)

To deactivate the venv run `deactivate`

Once in the venv, you can run `pip install -r requirements.txt`, which will download all packages specified.

If you want to add a package, make sure to add it to the `requirements.txt`.

## Booting up the Database

Create a docker container called 'WaitFaster-MongoDb', exposed on port 27017 (Mongo default)
`docker run --name WaitFaster-MongoDb -p 27017:27017 -d mongo:latest`

-   The cli for accessing the database is `mongosh` if you need it.

## Notes on the python api

Development (hot reload): `uvicorn main:app --reload --app-dir ./src/backend/` or `python -m uvicorn main:app --reload --app-dir ./src/backend/`
If there are an errors, try renaming the .env.TEMPLATE to .env

-   Config
    -   Use the .env file for any secrets / settings. There is a .env.TEMPLATE file that needs to be renamed in order for the `decouple` [package](https://pypi.org/project/python-decouple/) to use the settings.
-   Testing
    -   Testing is done with `pytest` or `python3 -m pytest`
    -   Make files that end in `test_*.py` for pytest to pick them up. `https://docs.pytest.org/en/8.0.x/how-to/usage.html`
    -   Write
-   Technology choices:
    -   Beanie for the ODM (https://github.com/roman-right/beanie)
    -   Pydantic for validation (Beanie uses pydantic under the hood too)
-   Gotchas:
    -   You need to place an empty `__init__.py` file at every level of the file structure if you want that file to be treated like a module.
-   Structure for project copied from `https://github.com/flyinactor91/fastapi-beanie-jwt/`
-   About Beanie
    -   Beanie is a ODM that maps python objects to mongo db collections.
    -   When you want to make a new document in mongo, you declare a new class inheriting from the `Document` class. (See `./src/backend/models/User.py`)
