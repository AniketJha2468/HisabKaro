# 💰 HisabKaro

### Smart Personal Finance Management Platform

HisabKaro is a full-stack personal finance management application built using the MERN stack. It helps users track their income and expenses, analyse spending patterns, manage budgets, generate financial reports, and make better financial decisions through intelligent spending suggestions.

The application provides a modern dashboard experience with interactive charts, detailed analytics, and exportable reports, making personal money management simple and efficient.

---

# 🚀 Features

## 🔐 Authentication System

* User registration and login
* Secure password encryption
* JWT-based authentication
* Protected routes
* User-specific financial data management

---

## 💵 Income & Expense Management

* Add income records
* Add expense records
* Edit transactions
* Delete transactions
* View complete transaction history
* Filter transactions based on categories and dates

---

## 📊 Financial Dashboard

* Total balance overview
* Income summary
* Expense summary
* Savings calculation
* Recent transactions display
* Financial insights

---

## 📅 Monthly Reports

* Monthly income analysis
* Monthly expense analysis
* Savings overview
* Spending trends
* Financial performance tracking

---

## 🏷️ Category-Wise Spending Analysis

Track expenses based on categories:

* Food
* Travel
* Shopping
* Bills
* Entertainment
* Healthcare
* Others

Provides insights into:

* Highest spending categories
* Category distribution
* Spending patterns

---

## 📈 Interactive Charts & Visualization

Implemented using:

* Chart.js / Recharts

Includes:

* Income vs Expense charts
* Monthly spending trends
* Category-wise expense distribution
* Savings analysis

---

## 📄 Export Financial Reports

Users can export reports in:

### PDF Format

Includes:

* Monthly summary
* Income details
* Expense details
* Financial overview

### CSV Format

Includes:

* Transaction history
* Dates
* Categories
* Amounts
* Transaction types

---

# 🤖 Advanced Features

## AI Spending Suggestions

HisabKaro analyses user spending behaviour and provides intelligent financial suggestions.

Examples:

* Reduce unnecessary expenses
* Improve saving habits
* Identify overspending categories
* Better financial planning recommendations

---

## 🔔 Budget Alerts

Users can create monthly budgets and monitor spending limits.

Features:

* Set category budgets
* Track current spending
* Receive budget warnings
* Monitor financial goals

---

# 🛠️ Technology Stack

## Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* Chart.js / Recharts

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Authentication

* JWT Authentication
* bcrypt Password Hashing

## Development Tools

* Git
* GitHub
* Postman
* VS Code

---

# 🏗️ MERN Architecture Overview

HisabKaro follows a structured MERN architecture.

```
                User
                 |
                 |
          React Frontend
                 |
                 |
             Axios API
                 |
                 |
        Express.js Backend
                 |
                 |
             MongoDB
```

## Frontend

Responsible for:

* User interface
* Dashboard
* Forms
* Charts
* Authentication pages
* Reports visualization

## Backend

Responsible for:

* Authentication
* Business logic
* API handling
* Data processing
* Report generation

## Database

MongoDB stores:

* User information
* Transactions
* Budget details
* Financial records

---

# 📂 Project Structure

```
HisabKaro

│
├── README.md
│
├── frontend
│
│   ├── src
│   │
│   ├── components
│   ├── pages
│   ├── services
│   ├── context
│   ├── hooks
│   └── utils
│
│
└── backend
    │
    ├── config
    ├── controllers
    ├── models
    ├── routes
    ├── middleware
    ├── services
    └── utils
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone <repository-url>
```

Navigate into project:

```bash
cd HisabKaro
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```
.env
```

Add required variables:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Start backend server:

```bash
npm run dev
```

Backend will run on:

```
http://localhost:5000
```

---

# Frontend Setup

Open another terminal.

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend (.env)

| Variable   | Description                     |
| ---------- | ------------------------------- |
| PORT       | Backend server port             |
| MONGO_URI  | MongoDB database connection URL |
| JWT_SECRET | JWT authentication secret key   |

## Frontend (.env)

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🔌 API Overview

## Authentication Routes

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | /api/auth/signup | Register user |
| POST   | /api/auth/login  | Login user    |
| POST   | /api/auth/logout | Logout user   |

---

## Transaction Routes

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | /api/transactions     | Add transaction    |
| GET    | /api/transactions     | Get transactions   |
| PUT    | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |

---

## Report Routes

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| GET    | /api/reports/monthly  | Monthly reports   |
| GET    | /api/reports/category | Category analysis |

---

## Budget Routes

| Method | Endpoint        | Description   |
| ------ | --------------- | ------------- |
| POST   | /api/budget     | Create budget |
| GET    | /api/budget     | Get budgets   |
| PUT    | /api/budget/:id | Update budget |

---

# 👨‍💻 Author

**Aniket Jha**

GitHub:
(Add your GitHub profile link)

LinkedIn:
(Add your LinkedIn profile link)

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

---

## Built with ❤️ using the MERN Stack
