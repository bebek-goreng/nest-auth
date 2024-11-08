# API Spec Auth

## SignUp User

Endpoint: POST /api/auth/signup

- Request Body

```json
{
  "name": "example",
  "email": "example@mail.com",
  "password": "password" //password must be at least 6 character
}
```

Response Body Success:

```json
{
  "token": "token"
}
```

Response Body Failed:

```json
{
    "statusCode": 400,
    "message": "Email already registered"
},
{
    "message": [
        "password must be longer than or equal to 6 characters"
    ],
    "error": "Bad Request",
    "statusCode": 400
}
```

## SignIn User

Endpoint: POST /api/auth/signin

Request Body:

```json
{
  "email": "example@mail.com",
  "password": "password"
}
```

Response Body (Success):

```json
{
  "token": "token"
}
```

Response Body (Failed):

```json
{
  "message": "Invalid Credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Response Body (Success):

```json
{
    "token": "token"
}
```
