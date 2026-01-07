#  Magnet Store – E-Commerce Web Application

Magnet Store is a modern **full-stack E-commerce web application** built using **React, Node.js, Express, MongoDB, and Stripe**.  
Users can browse premium tech products, add them to a cart, and complete secure payments using **Stripe Checkout**.

This project demonstrates a real-world **payment workflow**, cart management, backend APIs, and order tracking.

---

## ✨ Features

### 🛍️ Frontend
- Product listing with images
- Add to cart functionality
- Increase / decrease product quantity
- Animated cart sidebar
- Email input before checkout
- Stripe Checkout redirection
- Payment Success & Cancel pages

### 💳 Payments
- Stripe Checkout (Test Mode)
- Secure card payments
- Automatic redirect on success or cancellation
- Server-side payment verification

### 🗄️ Backend
- REST API using Express
- Stripe session creation
- MongoDB order storage
- Order status management:
  - `pending`
  - `completed`
  - `cancelled`

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Framer Motion
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Stripe API
- dotenv
- CORS

---
##🔁 Stripe Payment Flow

- User adds products to cart
- User enters email address
- Clicks Checkout
- Redirected to Stripe Checkout
- Stripe processes payment
- Redirects to:

/success → payment successful

/cancel → payment cancelled

Backend verifies payment and updates order status

## 🚀 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Lakshya46/magnet-brain-task.git
cd magnet-brain-task

cd backend
npm install
npm start

Backend server will start at:
http://localhost:5000

cd frontend
npm install
npm run dev


Frontend server will start on :
http://localhost:5173





