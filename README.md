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
`docker run --name WaitFaster-MongoDb -p 27017:27017 -d mongo:latest`

- The cli for accessing the database is `mongosh` if you need it.

## Notes on the python api

Development (hot reload): `uvicorn main:app --reload --root-path ./src/backend/`

- Technology choices:
	- Beanie for the ODM (https://github.com/roman-right/beanie)
	- Pydantic for validation (Beanie uses pydantic under the hood too)
- Gotchas:
	- You need to place an empty `__init__.py` file at every level of the file structure if you want that file to be treated like a module.
- Structure for project copied from `https://github.com/flyinactor91/fastapi-beanie-jwt/`
- About Beanie
	- Beanie is a ODM that maps python objects to mongo db collections.
	- When you want to make a new document in mongo, you declare a new class inheriting from the `Document` class. (See `./src/backend/models/User.py`)
