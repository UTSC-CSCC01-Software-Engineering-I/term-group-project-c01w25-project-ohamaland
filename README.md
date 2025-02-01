# Catalog: Personal Receipt & Expense Manager
A simple and secure way to track receipts, split expenses, and manage subscriptions—perfect for individuals and groups.

## Description

Catalog is a personal accounting application that helps individuals and groups seamlessly manage and store digital receipts, split expenses, detect recurring subscriptions, and generate meaningful spending insights. By providing a centralized dashboard for receipts, automated reminders for bills and subscriptions, and advanced analytics, we aim to simplify personal and group financial management.

### Key Features
- 🧾 **Receipt Management:** Upload, store, and categorize receipts with OCR capabilities.
- 💸 **Expense Splitting:** Automatically split bills for trips, events, or household costs.
- 📊 **Financial Insights:** Track spending trends, category breakdowns, and predictive insights.
- 🔄 **Subscription Management:** Get notified about recurring subscriptions before they renew.
- 📱 **Notifications:** Stay on top of due payments, renewals, overspending, and group updates.
- 🔐 **Security:** AES-256 encryption, secure authentication, and web vulnerability protection.

## Motivation

### Primary Problems to Solve
- **Disorganized Receipts**: Digitize and organize your receipts automatically.
- **Expense Splitting**: Automate shared costs with a clean dashboard.
- **Subscription Management**: Track and get notified of recurring charges.
- **Financial Visibility**: View holistic spending patterns through aggregated data.
- **Security**: AES-256 encryption and robust security practices ensure safety.

## Installation

### Prerequisites
Before you begin, make sure you have the following installed:

- **Python (v3.10 or higher)**
- **Django** (for backend)
- **Node.js** (for frontend, if using Next.js)
- **Tesseract OCR** or **Google Vision API** (for parsing receipts)
- **Plaid** or **Flinks API** (for financial aggregation)
- **MongoDB** (for database)

### Setup Instructions

Follow these steps to get the project up and running:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Catalog.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Catalog
   ```
3. Set up the backend:
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Set up the database:
     ```bash
     python manage.py migrate
     ```
4. Set up the frontend:
   - Install Node.js dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```
5. Run the application:
   ```bash
   python manage.py runserver
   ```
You should now be able to access the application locally.

## Contributing

We welcome your contributions! Here's how to get involved:

### Git Workflow

- **Git Flow**: We follow NOT use Git Flow and will instead checkout branches from main and peer review before merging in
- **Issue Tracking**: All bugs and feature requests are tracked in [GitHub Issues](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01w25-project-ohamaland/issues).
- **Pull Requests**: Submit a pull request with a detailed description of the changes you’ve made. Ensure your code passes all tests and follows our coding standards.

### How to Contribute

1. Open [an issue](https://github.com/UTSC-CSCC01-Software-Engineering-I/term-group-project-c01w25-project-ohamaland/issues/new/choose) to propose any changes you’d like to work on.
2. Fork the repository and create a new branch for your changes.
3. Make the necessary changes and test them thoroughly.
4. Submit a pull request and reference the issue it addresses.
