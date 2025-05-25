# Findr Backend

> **The robust and secure engine powering the Findr platform, handling data, authentication, and file storage with efficiency.**

This repository contains the backend systems for Findr, a feature-rich blogging platform. It is built with a focus on performance, security, and scalability, utilizing modern technologies to provide a reliable foundation for the frontend application.

## Features
- **Secure Authentication with Better Auth:** Implements a highly secure authentication system using Better Auth, providing features like password hashing, token management, and session control.
- **RESTful API with Express.js:** Provides a well-structured and efficient RESTful API for seamless communication with the frontend, handling all data operations.
- **Fast Runtime with Bun:** Leverages Bun as the JavaScript runtime for exceptional performance and efficient resource management, ensuring fast response times.
- **Transactional Emails with Nodemailer & Resend:** Integrates Nodemailer for sending transactional emails (e.g., account verification, password resets) via Resend's reliable SMTP service.
- **Scalable File Storage with AWS S3:** Utilizes AWS S3 for secure and scalable storage of user-generated content (e.g., post images, user avatars), integrated via Bun's AWS S3 client.
- **Database Management with Drizzle ORM:** Manages database interactions efficiently and type-safely using Drizzle ORM, providing a powerful and flexible way to interact with your SQL database.

## Stack
- [Better Auth](https://www.better-auth.com/)
- [Express.js](https://expressjs.com/)
- [Bun](https://bun.sh/)
- [Nodemailer](https://nodemailer.com/)
- [Resend (for SMTP)](https://resend.com/)
  - [React Email](https://react.email/)
- [Drizzle ORM)[https://orm.drizzle.team/]
- **AWS S3 (via Bun's client)**

### Prerequisites

- [Bun](https://bun.sh/)
- A SQL database (MySQL prefered)
- AWS Account (for S3 storage)
- Resend API Key (for email services)

### Installation

```bash
# Clone the repository
git clone [https://github.com/rv-bit/findr-backend.git](https://github.com/rv-bit/findr-backend.git)

# Navigate into the project directory
cd findr-backend

# Install dependencies
bun install
```

### ENV Example
```

NODE_ENV=development
PORT=5001

MYSQLHOST=
MYSQLUSER=
MYSQL_DATABASE=
MYSQLPASSWORD=
MYSQL_URL=

BASE_URL= // client application URL
BETTER_AUTH_URL= // URL that server is running on
BETTER_AUTH_SECRET= // Secret using https://www.better-auth.com/docs/installation#set-environment-variables
BETTER_TRUSTED_ORIGINS="http://localhost:3000" // Origins, client applications

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_CLOUD_FRONT_URL=

EMAIL_SMPT_HOST=smtp.resend.com
EMAIL_SMPT_PORT=2465 # 587, 2587 for encrypted and for normal 465
EMAIL_SMPT_USER=
EMAIL_SMPT_PASSWORD=
DEFAULT_EMAIL="noreply@domain"
HELP_EMAIL="help@domain"
```
