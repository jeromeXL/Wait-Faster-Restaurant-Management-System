from decouple import config


class Settings():

    # Mongo
    mongo_connection_string: str = str(config('WF_MONGO_DB_CONNECTION_STRING'))

    # Security settings
    jwt_secret: str = str(config('WF_JWT_SECRET', cast=str))
    salt: bytes = str(config("WF_SALT",)).encode()
    cors: str = str(config('WF_CORS'))

    # Default User
    default_user_username: str = str(config('WF_DEFAULT_USER_USERNAME'))
    default_user_password: str = str(config('WF_DEFAULT_USER_PASSWORD'))


CONFIG = Settings()
