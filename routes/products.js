const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый продукт
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название продукта
 *               price:
 *                 type: number
 *                 description: Цена продукта
 *               description:
 *                 type: string
 *                 description: Описание продукта
 *               category:
 *                 type: string
 *                 description: Категория продукта
 *               stock_quantity:
 *                 type: integer
 *                 description: Количество на складе
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', async (req, res) => {
    try {
        const { name, price, description, category, stock_quantity } = req.body;
        const newProduct = await pool.query(
            'INSERT INTO products (name, price, description, category, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, price, description, category, stock_quantity]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить все продукты
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список всех продуктов
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM products');
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;