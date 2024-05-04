```
# Node.js Authentication Middleware

## Overview

This repository provides middleware for user authentication in Node.js applications. It includes middleware for user signup, signin, protecting routes, restricting access based on user roles, and handling forgot passwords.

For detailed information about each middleware and their functionalities, refer to the sections below.

## Installation

Follow these steps to clone the repository and install dependencies:

1. Clone the repository:

   ```bash
   git clone https://github.com/deepak-singh-jethi/authentication-in-node.git
   ```

2. Navigate to the project directory:
   ```bash
   cd authentication-in-node
   ```

3. Install dependencies using npm:
   ```bash
   npm install
   ```

## Signup Middleware

### Validation:
- Ensures that the incoming request body contains all the necessary fields required for user signup, such as name, email, and password.
- Validates the email format using a validation library like validator.
- Checks if the password meets minimum length requirements.

### Hash Password:
- Utilizes a hashing library like bcryptjs to securely hash the user's password before storing it in the database.
- Ensures that the plaintext password is not stored directly in the database for security reasons.
- Typically implemented as a pre-save hook in the user schema to automatically hash the password before saving it.

### Create User:
- Creates a new user document in the database with the provided user details.
- Uses the User model to interact with the database and insert the new user.

### Generate JWT:
- Upon successful creation of the user, generates a JSON Web Token (JWT) for the newly registered user.
- Signs the token with a secret key and includes relevant user data (e.g., user ID) in the token payload.
- Returns the JWT token to the client, allowing the user to authenticate and access protected routes.

## Signin Middleware

### Validation:
- Validates the incoming request body to ensure it contains the required fields for user signin, typically email and password.

### Verify Credentials:
- Queries the database to find the user with the provided email.
- Compares the hashed password stored in the database with the provided plaintext password to verify the user's credentials.

### Generate JWT:
- If the user's credentials are valid, generates a JWT for the authenticated user.
- Signs the token with a secret key and includes relevant user data (e.g., user ID) in the token payload.
- Returns the JWT token to the client for subsequent authenticated requests.

## Protect Middleware

### Token Extraction:
- Extracts the JWT from the request headers, commonly from the Authorization header.
- Ensures that the JWT is present and properly formatted (e.g., starts with 'Bearer').

### Token Verification:
- Verifies the JWT signature to ensure it has not been tampered with.
- Decodes the JWT payload to extract user information, such as the user ID.

### Check User Existence:
- Queries the database to find the user associated with the extracted user ID.
- Ensures that the user exists in the database and is authorized to access protected routes.

### Check Token Expiry:
- Verifies if the JWT is expired by checking the token expiration timestamp.
- If the token is expired, denies access and prompts the user to re-authenticate.

## Restrict Middleware

### Check User Role:
- Retrieves the user's role from the authenticated user object extracted from the JWT payload.

### Role Authorization:
- Compares the user's role against the roles allowed to access the protected route.
- Denies access if the user's role does not match any of the allowed roles, indicating insufficient privileges.

## Forgot Password Middleware

### Find User:
- Queries the database to find the user associated with the provided email address.
- Verifies that the user exists in the database before initiating the password reset process.

### Generate Reset Token:
- Generates a unique token for password reset using a cryptographic library like crypto.
- Hashes the reset token and stores it in the user document in the database with an expiration time.

### Send Reset Token:
- Sends the generated reset token to the user via email, allowing them to reset their password securely.
- Utilizes an email service or SMTP server to send the reset token email to the user's registered email address.
```
