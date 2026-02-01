# User Management System
I have successfully built a RESTful User Management System with a Node.js/Express backend and a modern Glassmorphic frontend.

🚀 How to Run Locally
### 1. Prerequisites
Node.js installed on your machine.
MongoDB (Local installation or Atlas URI).
### 2. Setup Environment
Initialize the project and install dependencies (if not already done):

npm install
### 3. Configure Database
Update the 
.env
 file in the root directory:

PORT=3000
MONGODB_URI=mongodb+srv://birhanu1b_db_user:**pass**@cluster0.sisnjgk.mongodb.net/?appName=Cluster0

If you don't have MongoDB installed locally, you can use a free cluster on MongoDB Atlas and replace the MONGODB_URI with your connection string.

### 4. Start the Server
Run the following command:

node server.js
The server will start at http://localhost:3000.

**🛠️ Features Implemented**

**RESTful API**

POST /api/users: Create a new user (used for both registration and admin adding users).

GET /api/users: Fetch all users (Requires Basic Auth).

GET /api/users/:id: Fetch a single user (Requires Basic Auth).

PUT /api/users/:id: Update user details (Requires Basic Auth).

DELETE /api/users/:id: Delete a user (Requires Basic Auth).

**Security**

Bcrypt.js: Passwords are automatically hashed before being saved to MongoDB.

Basic Auth Middleware: Core CRUD endpoints are protected. You must register a user first, then use those credentials to log in.
