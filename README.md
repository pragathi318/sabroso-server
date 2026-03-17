# Sabroso Cloud Kitchen

Welcome to **Sabroso Cloud Kitchen**! This is a complete web application designed for a modern food delivery service. The project is split into a frontend UI (HTML, CSS, JS) and a robust backend API (Node.js, Express, MongoDB).

## 🚀 Features

### Frontend (User Interface)
- **Home/Landing Page** (`index.html`): Engaging landing page for the cloud kitchen.
- **Menu** (`menu.html`): Browse delicious dishes and add them to your cart.
- **Cart & Checkout** (`cart.html`, `checkout.html`): Seamless shopping cart experience and order placement.
- **Order Tracking** (`tracking.html`): Track the status of your live orders.
- **User Authentication** (`login.html`): Login/Signup system.
- **Admin Dashboard** (`admin.html`): Dedicated panel for managing orders and the cloud kitchen operations.
- **Chatbot** (`chatbot.js`): Integrated chatbot for quick customer assistance.

### Backend (Server API)
Built with **Node.js** and **Express.js**, the backend securely handles the core logic.
- **RESTful API**: Endpoints for users, dishes, orders, and more.
- **Database**: **MongoDB** using Mongoose for data modeling.
- **Security**: Password hashing with **bcryptjs** and authentication via **jsonwebtoken** (JWT).
- **Environment Management**: Configuration handled via `dotenv`.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Dependencies**: `mongoose`, `express`, `bcryptjs`, `cors`, `dotenv`, `jsonwebtoken`

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd "cloud kitchen"
   ```

2. **Navigate to the server directory and install dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Set up Environment Variables**:
   Update your `.env` file inside the `/server` directory with your configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the Database (Optional)**:
   You can populate the database with initial dish data by running:
   ```bash
   npm run seed
   ```

5. **Start the Server**:
   ```bash
   npm start
   # or for development mode:
   npm run dev
   ```
   The backend will normally start on `http://localhost:5000`.

6. **Run the Frontend**:
   Simply open `.html` files in your web browser (e.g., `index.html`) or use a local development server like VS Code's Live Server.

## 📝 License
This project is licensed under the ISC License.
