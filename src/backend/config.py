from decouple import config

class Settings():
    
    # Mongo
    mongo_connection_string: str = str(config('MONGO_DB_CONNECTION_STRING'))

    # Security settings
    jwt_secret: str = str(config('JWT_SECRET', cast=str))
    salt: bytes = str(config("SALT",)).encode()

CONFIG = Settings()