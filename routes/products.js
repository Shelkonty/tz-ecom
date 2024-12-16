const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: Автоматически генерируемый ID продукта
 *         name:
 *           type: string
 *           description: Название продукта
 *         price:
 *           type: number
 *           description: Цена продукта
 *         description:
 *           type: string
 *           description: Описание продукта
 *         category:
 *           type: string
 *           description: Категория продукта
 *         stock_quantity:
 *           type: integer
 *           description: Количество на складе
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM products');
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Информация о продукте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               stock_quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Продукт создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 * /products/{id}:
 *   put:
 *     summary: Обновить продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Продукт обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, stock_quantity } = req.body;

        const updatedProduct = await pool.query(
            'UPDATE products SET name = $1, price = $2, description = $3, category = $4, stock_quantity = $5 WHERE id = $6 RETURNING *',
            [name, price, description, category, stock_quantity, id]
        );

        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(updatedProduct.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт удален
 *       404:
 *         description: Продукт не найден
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;