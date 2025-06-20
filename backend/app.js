const express = require('express');
const cors = require('cors');
const app = express();

// =========== CORS Configuration ===========
// Enable Cross-Origin Resource Sharing (CORS) to allow requests 
// from the Angular frontend, which is expected to run on http://localhost:4200.
app.use(cors({ origin: 'http://localhost:4200' }));
// ============================================


// ... Your other Express routes and middleware will go here ...


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // "is listening on port" è una dicitura molto comune.
  console.log(`Server is listening on port ${PORT}`);
});