// // controllers/categoryController.js
// const Category = require('../models/categoryModel');

// exports.addCategory = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: 'Category name required' });
//     }

//     await Category.create(name);

//     res.status(201).json({ message: 'Category created successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getCategories = async (req, res) => {
//   try {
//     const categories = await Category.getAll();
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
