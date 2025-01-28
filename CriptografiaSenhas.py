from argon2 import PasswordHasher

Hasher = PasswordHasher()

Password = '123'.encode()

print(Hasher.hash(Password))