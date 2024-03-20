const products = require("../products");
const express = require("express");
const cors = require("cors");


const app = express();


app.use(cors());



// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Bernzz");
});

app.get("/products", (req, res) => {
  res.send(products);
});

app.get("/products/category", (req, res) => {
  const categories = [
    ...new Set(products.map((product) => product.category.toLowerCase())),
  ];
  res.send(categories);
});

app.get("/products/category/:category", (req, res) => {
  const { category } = req.params;
  const itemsInCategory = products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );

  if (itemsInCategory.length > 0) {
    res.send(itemsInCategory);
  } else {
    res.status(404).send(`No items found in the category: ${category}`);
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;
