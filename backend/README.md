MERN Pre-Hackathon Backend
Backend API for authentication, profile management, posts, bookmarks, user lookup, QR codes, and notifications.
Important: This README is based on the route files reviewed. Request body examples are starter examples; confirm exact field names and validation rules in each controller before production use.

Tech stack
- Node.js + Express (ES modules)
- MongoDB + Mongoose
- JWT authentication
- Cloudinary + Multer for image uploads
- Nodemailer for email flows
- Helmet and express-rate-limit for baseline API security
- QRCode generation
Requirements
- Node.js (the project was developed with Node.js v24.x)
- npm
- MongoDB Atlas or a local MongoDB instance
- Cloudinary account
- SMTP credentials if email verification/password reset is enabled
Setup
From the backend directory:
npm install
Create backend/.env and configure the values below. Do not commit .env or share secret values publicly.
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Configure these using the exact variable names read by config/cloudinary.mjs,
# authController.mjs, and the QR/share controller.
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
The environment variable names for MongoDB, Cloudinary, JWT, and SMTP must match the names actually referenced in the project's configuration/controllers. The values above are a template, not a guarantee of the exact names used in every file.

Start the server using the script defined in package.json, for example:
npm run dev
If no dev script exists, use the script currently configured in package.json or run node server.mjs.

Base URL: http://localhost:5000

Quick health check: GET / → Hello, World!
Authentication
Most protected routes require a JWT bearer token.

In Postman:
1. Sign up or log in.
2. Copy the token returned by the login response.
3. Set the collection variable token to that token.
4. Protected requests inherit Bearer Token authentication from the collection.
Do not put real passwords, tokens, API keys, or SMTP credentials in the README or public repository.
API endpoint reference
Auth — /api/auth
Method	Endpoint	Purpose	Auth
POST	/signup	Create an account	No
POST	/login	Log in	No
POST	/forgot-Password	Start password recovery	No
POST	/reset-password/:token	Reset password using token	No
POST	/verify-email/:token	Verify email using token	No
POST	/logout	Log out	Route currently has no protect middleware
GET	/me	Get current logged-in user	Bearer token


Note: preserve the exact capitalization in /forgot-Password.
Profile — /api/profile
Method	Endpoint	Purpose	Auth
GET	/	Get current profile	Bearer token
PUT	/	Update profile	Bearer token
PATCH	/change-password	Change password	Bearer token
PATCH	/picture	Upload/replace profile picture	Bearer token
DELETE	/picture	Remove profile picture	Bearer token


Profile picture upload uses multipart/form-data with field name profilePicture.
Posts — /api/posts
Method	Endpoint	Purpose	Auth
POST	/	Create a post	Bearer token
GET	/	List posts; controller supports pagination/search/filter/sort	No
GET	/:id	Get one post	No
PATCH	/:id	Update a post	Bearer token
DELETE	/:id	Delete a post	Bearer token
GET	/:id/qr	Generate a post QR code	No
GET	/:id/comments	Get post comments	No
POST	/:id/comments	Add a comment	Bearer token
DELETE	/:postId/comments/:commentId	Delete a comment	Bearer token
PATCH	/:id/like	Like/unlike a post	Bearer token
PATCH	/:id/bookmark	Bookmark/unbookmark a post	Bearer token
GET	/bookmarks/me	Get current user's bookmarks	Bearer token


Create-post upload uses multipart/form-data. Image field name is images, with a maximum of 5 images. The middleware is configured for image files and a 5 MB per-file limit.
Users — /api/users
Method	Endpoint	Purpose	Auth
GET	/search?q=...	Search users	Bearer token
GET	/:userId	Get a user profile by ID	Bearer token


Notifications — /api/notifications
Method	Endpoint	Purpose	Auth
GET	/	Get notifications for logged-in user	Bearer token
GET	/unread-count	Get unread notification count	Bearer token
PATCH	/read-all	Mark all notifications read	Bearer token
PATCH	/:id/read	Mark one notification read	Bearer token


Example requests
Signup
POST /api/auth/signup
Content-Type: application/json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "Password123"
}
Use the token from the actual login response as the Bearer token. The precise response key depends on the controller implementation.
Search posts
GET /api/posts?page=1&limit=10&search=hello&sort=newest
Supported query options should be confirmed against postController.mjs; current implementation notes indicate pagination, search, optional user filter, and sort support.
Create a post
Use Postman → Body → form-data:
Key	Type	Example
title	Text	My first post
content	Text	Post content goes here
images	File	Select an image (optional; repeat key for multiple images)


The exact title/content validation requirements are defined in the controller/model.
Postman collection
Import MERN_Pre_Hackathon_Postman_Collection.json into Postman. Set:
- baseUrl — defaults to http://localhost:5000
- token — JWT from login
- postId, userId, notificationId, commentId — IDs returned by API responses
- resetToken, verificationToken — tokens received through the configured email flow
Some body examples are placeholders; adjust them to match the controller's exact validation fields. The collection intentionally does not contain secrets.
Deployment checklist
1. Push the backend to a Git repository without .env, node_modules, or secret files.
2. Create a Node.js web service on your chosen hosting provider.
3. Set the service root directory to backend if the backend lives in that subdirectory.
4. Configure the build/install command (typically npm install) and start command (use the actual package.json script or node server.mjs).
5. Add all required environment variables in the hosting dashboard.
6. Add the hosting server's IP/network access to MongoDB Atlas if applicable.
7. Confirm Cloudinary and SMTP credentials work in the deployed environment.
8. Test GET /, signup/login, protected profile, post upload, QR, and notifications against the live URL.
9. Set BACKEND_URL to the deployed backend URL. Set FRONTEND_URL when the frontend exists and use frontend URLs for user-facing sharing.
10. Review logs and verify all import paths use exact filename casing; Linux deployments are case-sensitive.
Security and maintenance notes
- Never commit .env.
- Use a strong unique JWT_SECRET.
- Restrict database access and rotate exposed credentials.
- Keep dependencies updated.
- The current server uses Helmet and a general API rate limiter. Confirm middleware ordering so API routes receive both.
- The server should connect to MongoDB successfully before accepting requests; avoid invoking connectDB() twice.
- If CORS is needed after frontend development, configure an explicit allowed frontend origin rather than allowing every origin by default.
Known route note
The reviewed postRoutes.mjs did not include a share endpoint at the time this README was prepared. If share functionality is required, add and verify the controller import and route before documenting/testing it.