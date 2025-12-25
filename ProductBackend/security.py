from datetime import datetime, timedelta
from jose import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

password_hash = PasswordHash([BcryptHasher()])

SECRET_KEY = "crv360-super-secure-key-change-this-in-production-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

def get_password_hash(password: str):
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    try:
        return password_hash.verify(plain_password, hashed_password)
    except:
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)