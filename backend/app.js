// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
// Import our database connection pool
const dbPool = require('./config/database');
const autenticateToken = require('./middleware/auth.middleware');



// Import the product routes we just created
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const {publicRouter, adminRouter} = require('./routes/product.routes');
const imageRoutes = require('./routes/image.routes');
const brandRoutes = require('./routes/brand.routes');
const categoryRoutes = require('./routes/category.routes');
const attributeRoutes = require('./routes/attribute.routes');
const orderRoutes = require('./routes/order.routes');
const addressRoutes = require('./routes/address.routes');
const paymentRoutes = require('./routes/payment.routes');
const wishlistRoutes = require('./routes/wishlist.routes'); 
const importRoutes = require('./routes/import.routes');
const dashboardRoutes = require('./routes/dashboard.routes');


const app = express();

// =========== Middleware Configuration ===========
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({ origin: ['http://localhost:4200', 'http://192.168.178.135:4200'] }));
// Enable the Express app to parse JSON-formatted request bodies
app.use(express.json());

app.use(morgan('dev')); // Use morgan for logging HTTP requests in development mode

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// =========== API Routes ===========
// Mount the authentication routes on the /api/auth path.
// All routes defined in auth.routes.js will now be prefixed with /api/auth.
app.use('/api/auth', authRoutes);

// Mount the order routes on the /api/orders path.
// These routes are protected by the authenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/orders', autenticateToken, orderRoutes); // Mount the order routes on the /api/orders path.

// Mount the payment routes on the /api/payment-methods path.
// These routes are also protected by the authenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/payment-methods', autenticateToken, paymentRoutes);

// Mount the wishlist routes on the /api/wishlist path.
// These routes are protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/wishlist', autenticateToken, wishlistRoutes);

// Mount the address routes on the /api/addresses path.
// These routes are also protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/addresses', autenticateToken, addressRoutes); // Mount the address routes on the /api/addresses path.

// Mount the user routes on the /api/users path.
// All routes defined in user.routes.js will now be prefixed with /api/users.
app.use('/api/users', autenticateToken, userRoutes);

// Mount the dashboard routes on the /api/admin/dashboard/stats path.
// These routes are protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/dashboard', autenticateToken, dashboardRoutes);

// Mount the attribute routes on the /api/admin/attributes path.
// These routes are protected by the authenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/attributes', autenticateToken, attributeRoutes);

// Mount the import routes on the /api/admin/import path.
// These routes are also protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/import', autenticateToken, importRoutes);

// Mount the brand routes on the /api/admin/brands path.
// These routes are also protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/brands', autenticateToken, brandRoutes);

// Mount the image routes on the /api/images path.
// These routes are also protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/images', autenticateToken, imageRoutes);

// Mount the category routes on the /api/admin/categories path.
// These routes are also protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin/categories', autenticateToken, categoryRoutes); // Mount the category routes on the /api/admin/categories path.

// Mount the admin product routes on the /api/admin path.
// These routes are protected by the autenticateToken middleware, meaning they require a valid JWT token to access.
app.use('/api/admin', autenticateToken, adminRouter); 



// Mount the product routes on the /api path.
// All routes defined in product.routes.js will now be prefixed with /api.
app.use('/api', publicRouter);


const PORT = process.env.PORT || 3000;

// Function to start the server
const startServer = async () => {
  try {
    // Test the database connection by running a simple query
    const [rows] = await dbPool.query('SELECT 1 + 1 AS solution');
    console.log('✅ Database connection successful. Test query result:', rows[0].solution);

    // If the DB connection is successful, start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });

  } catch (error) {
    // If the DB connection fails, log the error and exit the process
    console.error('❌ Failed to connect to the database.');
    console.error(error);
    process.exit(1); // Exit with an error code
  }
};

// Start our server
startServer();
