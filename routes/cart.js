const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// GET /cart
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.id, c.quantity, p.name, p.price, (p.price * c.quantity) as total
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /cart
router.post('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { product_id, quantity } = req.body;

        // Check product availability
        const productResult = await client.query(
            'SELECT stock_quantity FROM products WHERE id = $1',
            [product_id]
        );

        if (productResult.rows.length === 0) {
            throw new Error('Product not found');
        }

        if (productResult.rows[0].stock_quantity < quantity) {
            throw new Error('Insufficient stock');
        }

        // Add to cart
        const result = await client.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + $3 RETURNING *',
            [req.user.id, product_id, quantity]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});