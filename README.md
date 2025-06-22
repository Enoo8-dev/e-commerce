# E-commerce Project for Web Systems

This is the repository for an e-commerce project for tech products, developed for the Web Systems course.

## 🚀 Development Environment Setup

To run the project locally, you need to set up both the backend and the frontend.

### Prerequisites

* [Node.js](https://nodejs.org/) (recommended version: 18.x or higher)
* [Angular CLI](https://angular.io/cli)
* A [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) database server running locally.

---

### ⚙️ Database Setup

The backend requires a connection to a MySQL/MariaDB database to work. Follow these steps to set it up correctly.

**1. Create the Database**

Log in to your MySQL/MariaDB client with a user that has privileges to create databases (usually the `root` user) and run the following command:

```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. Create a User and Grant Privileges (Recommended)**

For security reasons, it's recommended to create a specific user that only has access to the e-commerce database. Replace `'your_user'` and `'your_password'` with your preferred credentials.

```sql
-- Run these commands as the 'root' user
CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

**3. Create the Tables**

The database tables are created by running the SQL script provided in the repository. Assuming you are in the project's root folder, run this command from your terminal:

```bash
# Replace 'your_user' with the username you chose
mysql -u your_user -p ecommerce_db < ./backend/database/schema.sql
```

*(Note: This command assumes the table creation script is located at `backend/database/schema.sql`)*

**4. Configure the Backend Connection**

The backend reads the database credentials from a configuration file to avoid hardcoding them into the source code.

* In the `backend/` folder, create a file named `.env`.
* Copy the contents of `.env.example` (if it exists) or insert the following variables, customizing them with your data:

```env
# File: backend/.env

DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

Make sure the `.env` file is included in your `.gitignore` to avoid committing your credentials to GitHub.

---

### 🏛️ Database Architecture (Schema)

This section describes the structure of each table in the database.

#### Table: `Addresses`
Stores users' shipping addresses.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Primary Key (PK), Auto-incrementing. |
| `user_id` | `INT UNSIGNED` | FK to `Users.id`. |
| `street` | `VARCHAR(255)` | Not Null. |
| `city` | `VARCHAR(100)` | Not Null. |
| `postal_code` | `VARCHAR(10)` | Not Null. |
| `province` | `VARCHAR(100)` | Not Null. |
| `country` | `VARCHAR(100)` | Not Null. |
| `is_default` | `BOOLEAN` | Not Null, Default: `FALSE`. |

#### Table: `Attributes`
Defines product characteristics (e.g., "Color").

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `created_at` | `TIMESTAMP` | Default: current timestamp. |
| `updated_at` | `TIMESTAMP` | Updates automatically. |

#### Table: `Attribute_Translations`
Translations for attributes.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `attribute_id` | `INT UNSIGNED` | Composite PK, FK to `Attributes.id`. |
| `language_code` | `VARCHAR(5)` | Composite PK (e.g., 'en-US'). |
| `name` | `VARCHAR(100)` | Not Null. |

#### Table: `Attribute_Values`
Contains specific values for an attribute (e.g., "Black").

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `attribute_id` | `INT UNSIGNED` | FK to `Attributes.id`. |
| `hex_code` | `VARCHAR(7)` | Nullable (for colors). |

#### Table: `Attribute_Value_Translations`
Translations for attribute values.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `attribute_value_id`| `INT UNSIGNED` | Composite PK, FK to `Attribute_Values.id`. |
| `language_code` | `VARCHAR(5)` | Composite PK. |
| `value` | `VARCHAR(100)` | Not Null. |

#### Table: `Brands`
Contains product brands.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `logo_url` | `VARCHAR(255)` | Nullable. |

#### Table: `Brand_Translations`
Translations for brands.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `brand_id` | `INT UNSIGNED` | Composite PK, FK to `Brands.id`. |
| `language_code` | `VARCHAR(5)` | Composite PK. |
| `name` | `VARCHAR(100)` | Not Null. |
| `description` | `TEXT` | Nullable. |

#### Table: `Categories`
Contains product categories, with support for sub-categories.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `parent_category_id` | `INT UNSIGNED`| Nullable, FK to `Categories.id`. |

#### Table: `Category_Translations`
Translations for categories.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `category_id` | `INT UNSIGNED` | Composite PK, FK to `Categories.id`. |
| `language_code` | `VARCHAR(5)` | Composite PK. |
| `name` | `VARCHAR(100)` | Not Null. |
| `description` | `TEXT` | Nullable. |

#### Table: `Coupons`
Manages discount coupons.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `code` | `VARCHAR(50)` | Unique, Not Null. |
| `discount_type` | `ENUM(...)` | Type: 'percentage' or 'fixed_amount'. |
| `discount_value`| `DECIMAL(10, 2)`| Not Null. |
| `expiry_date` | `TIMESTAMP` | Nullable. |
| `minimum_spend` | `DECIMAL(10, 2)`| Nullable. |
| `usage_limit` | `INT UNSIGNED` | Nullable. |
| `usage_limit_per_user`| `INT UNSIGNED` | Nullable. |
| `is_active` | `BOOLEAN` | Not Null, Default: `TRUE`. |

#### Table: `Orders`
Main information for orders.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `user_id` | `INT UNSIGNED` | FK to `Users.id`. |
| `shipping_address_id` | `INT UNSIGNED`| FK to `Addresses.id`. |
| `coupon_id` | `INT UNSIGNED` | Nullable, FK to `Coupons.id`. |
| `total_amount` | `DECIMAL(10, 2)`| Not Null. |
| `status` | `VARCHAR(50)` | Not Null, Default: 'pending'. |
| `tracking_number` | `VARCHAR(100)`| Nullable. |

#### Table: `Order_Items`
Products contained in an order.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `order_id` | `INT UNSIGNED` | FK to `Orders.id`. |
| `variant_id` | `INT UNSIGNED` | FK to `Product_Variants.id`. |
| `quantity` | `INT UNSIGNED` | Not Null. |
| `price_per_unit`| `DECIMAL(10, 2)`| Price at the time of purchase. |

#### Table: `Order_Tracking_History`
History of tracking statuses.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `order_id` | `INT UNSIGNED` | FK to `Orders.id`. |
| `status` | `VARCHAR(50)` | Not Null. |
| `notes` | `TEXT` | Nullable. |
| `changed_at`| `TIMESTAMP` | Default: current timestamp. |

#### Table: `Product_Categories`
Links products and categories (Many-to-Many).

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `product_id` | `INT UNSIGNED` | Composite PK, FK to `Products.id`. |
| `category_id` | `INT UNSIGNED` | Composite PK, FK to `Categories.id`. |

#### Table: `Product_Reviews`
User-submitted reviews for products.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `product_id` | `INT UNSIGNED` | FK to `Products.id`. |
| `user_id` | `INT UNSIGNED` | FK to `Users.id`. |
| `rating` | `TINYINT UNSIGNED` | Not Null, Value between 1 and 5. |
| `title` | `VARCHAR(255)` | Nullable. |
| `comment` | `TEXT` | Nullable. |
| `is_verified_purchase` | `BOOLEAN` | Not Null, Default: `FALSE`. |
| `created_at` | `TIMESTAMP` | Default: current timestamp. |

#### Table: `Products`
The "conceptual" or "parent" product.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `brand_id` | `INT UNSIGNED` | Nullable, FK to `Brands.id`. |
| `is_active` | `BOOLEAN` | Default: `TRUE`. |
| `is_featured` | `BOOLEAN` | Default: `FALSE`. |

#### Table: `Product_Translations`
Translations for products.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `product_id` | `INT UNSIGNED` | Composite PK, FK to `Products.id`. |
| `language_code` | `VARCHAR(5)` | Composite PK. |
| `name` | `VARCHAR(255)`| Not Null. |
| `description` | `TEXT` | Nullable. |
| `features` | `JSON` | Nullable (for technical specs). |

#### Table: `Product_Variants`
The physical, sellable item, with price and stock.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `product_id` | `INT UNSIGNED` | FK to `Products.id`. |
| `sku` | `VARCHAR(100)`| Unique, Not Null. |
| `price` | `DECIMAL(10, 2)`| Not Null. |
| `sale_price` | `DECIMAL(10,2)` | Nullable. |
| `sale_start_date` | `TIMESTAMP` | Nullable. |
| `sale_end_date` | `TIMESTAMP` | Nullable. |
| `stock_quantity`| `INT` | Not Null, Default: 0. |
| `is_default` | `BOOLEAN` | Default: `FALSE`. |

#### Table: `Users`
Manages users and their roles.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | PK, Auto-incrementing. |
| `email` | `VARCHAR(255)`| Unique, Not Null. |
| `password_hash` | `VARCHAR(255)`| Not Null. |
| `first_name` | `VARCHAR(100)`| Nullable. |
| `last_name` | `VARCHAR(100)`| Nullable. |
| `role` | `ENUM(...)` | 'customer' or 'admin', Default: 'customer'. |
| `is_active` | `BOOLEAN` | Default: `TRUE`. |

#### Table: `Variant_Attributes`
Links a variant to its attribute values (Many-to-Many).

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `variant_id` | `INT UNSIGNED` | Composite PK, FK to `Product_Variants.id`.|
| `attribute_value_id`| `INT UNSIGNED` | Composite PK, FK to `Attribute_Values.id`.|

#### Table: `Wishlist_Items`
Contains users' wishlists.

| Column Name | Data Type | Description and Constraints |
| :--- | :--- | :--- |
| `user_id` | `INT UNSIGNED` | Composite PK, FK to `Users.id`. |
| `variant_id` | `INT UNSIGNED` | Composite PK, FK to `Product_Variants.id`.|
| `added_at` | `TIMESTAMP` | Default: current timestamp. |

---
### Running the Application

Once the database is set up, you can start the application.

1.  **Start the Backend:**
    ```bash
    cd backend
    npm install
    npm start
    ```

2.  **Start the Frontend (in a separate terminal):**
    ```bash
    cd frontend
    npm install
    ng serve
    ```

The application will be available at `http://localhost:4200`.
