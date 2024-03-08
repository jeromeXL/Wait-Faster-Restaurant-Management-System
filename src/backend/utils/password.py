import bcrypt

def hash_password(password: str) -> str:
    """Return a salted password hash."""
    return bcrypt.hashpw(password.encode(), b"$2b$12$WjTCIJ/eNVCUKPO58sFpV.").decode() ## TEMPORARY SALT, PLEASE UPDATE WITH .env CONFIG

def hashPassword(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    return hashed.decode()  