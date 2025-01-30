# CSCC01 Project Backend

### Getting Started

#### Installation

1. Ensure you have Python (>= 3.10) installed.
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

#### Starting the Server
1. Apply database migrations:
   ```sh
   python manage.py migrate
   ```
2. Start the development server:
   ```sh
   python manage.py runserver
   ```
3. The backend will be accessible at:
   ```
   http://127.0.0.1:8000/
   ```

#### Usage
- `python manage.py runserver`: Run the project in development mode.
- `python manage.py migrate`: Apply database migrations.
- `python manage.py test`: Run tests.
