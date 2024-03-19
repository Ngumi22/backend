const products = require("./products");
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: 'https://frontend-rho-sand.vercel.app',
    credentials: true // enable CORS credentials (cookies, authorization headers)
}));

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

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
