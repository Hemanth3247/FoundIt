from database import usersdb

def authenticate(doc, passhash):

    response = usersdb.fetch_user(doc)
    password_hash = response['password_hash']

    if passhash == password_hash:
        return True
    else:
        return False
print(1)