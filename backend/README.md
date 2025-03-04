# CSCC01 Project Backend

### Getting Started

#### Installation

1. Ensure you have Python (>= 3.10) installed.
2. Install dependencies:

   ```sh
   pip install -r requirements.txt
   ```

#### Setting Up the Database with PostgreSQL

1. Install PostgreSQL if you haven't already.
2. Create a new PostgreSQL database:

   ```sh
   psql -U postgres -c "CREATE DATABASE catalog;"
   ```

3. Create a `.env` file in `backend/core/` with the following content (check Discord team page for actual values):

   ```ini
   SECRET_KEY=
   DB_NAME=
   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=

   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_STORAGE_BUCKET_NAME=
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

   [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

#### Usage

- `python manage.py runserver`: Run the project in development mode.
- `python manage.py migrate`: Apply database migrations.
- `python manage.py test`: Run tests.
- `black .`: Format all Python code using [Black](https://black.readthedocs.io/en/stable/).

## Using the insertdata Command to Populate the Database

The `insertdata` management command allows you to pre-populate the database with sample users, receipts, and items.

### Steps to Use insertdata

1. **Ensure that database migrations are applied**:

   ```sh
   python manage.py migrate
   ```

2. **Run the `insertdata` command**:

   ```sh
   python manage.py insertdata
   ```

   This will insert predefined users, receipts, and items into the database.

### Verifying the Inserted Data

After running `insertdata`, you can confirm that the data was successfully added by checking the database:

#### Open the Django shell:

```sh
python manage.py shell
```

#### Query the database:

```python
from api.models import User, Receipt, Item

# Check the number of users inserted
print("Total Users:", User.objects.count())

# Check the number of receipts inserted
print("Total Receipts:", Receipt.objects.count())

# Check the number of items inserted
print("Total Items:", Item.objects.count())
```

## Code Formatting

Before submitting a pull request, ensure that all Python code is formatted using [Black](https://black.readthedocs.io/en/stable/):

```sh
black .
```

If you want to check whether your code is already formatted or if Black will make any changes, run:

```sh
black --check .
```