const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const csrf = require('csurf'); // Import csurf here
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(cors()); // Enable CORS for all routes

// Trust Proxy
app.set('trust proxy', 1);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// Use csurf middleware
app.use(csrf({ cookie: true }));

// Middleware to add CSRF token to response locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Now req.csrfToken() should be defined
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome");
});

app.get("/products", (req, res) => {
  res.send(products); // Assuming products is defined elsewhere
});

app.get("/products/category", (req, res) => {
  const categories = [...new Set(products.map(product => product.category.toLowerCase()))];
  res.send(categories);
});

app.get("/products/category/:category", (req, res) => {
  const { category } = req.params;
  const itemsInCategory = products.filter(product => product.category.toLowerCase() === category.toLowerCase());

  if (itemsInCategory.length > 0) {
    res.send(itemsInCategory);
  } else {
    res.status(404).send(`No items found in the category: ${category}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
