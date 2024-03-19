const products = require("./products");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require("express-rate-limit");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const app = express();
const cookieParser = require('cookie-parser');

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Middleware to add CSRF token to response locals
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Input validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Routes
app.get("/", (req, res) => {
    res.send("Welcome");
});

app.get("/products", (req, res) => {
    res.send(products);
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

app.post("/login", validateRequest, (req, res) => {
    // Authenticate user and generate JWT token
    // Example: Assume req.body contains username and password
    const { username, password } = req.body;
    // Check username and password against database
    // If authenticated, generate JWT token and send it back
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Set expiration time
    res.cookie('jwt', token, { httpOnly: true, secure: true }); // Set secure cookie
    res.json({ token: token });
});

// Example protected route using authentication middleware
app.get("/protected-route", authenticateToken, (req, res) => {
    // Only accessible with a valid JWT token
    res.send("Protected route accessed successfully");
});

// Hashing passwords middleware
const saltRounds = 10;
app.post("/register", validateRequest, (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        // Store hashed password in database
        // Example: User.create({ username: username, password: hash });
        res.send("User registered successfully");
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
