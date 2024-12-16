const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// POST /checkout
router.post('/checkout', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calculate total price from cart
        const cartResult = await client.query(`
      SELECT SUM(p.price * c.quantity) as total
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.user.id]);

        const totalPrice = cartResult.rows[0].total;

        if (!totalPrice) {
            throw new Error('Cart is empty');
        }

        // Create order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *',
            [req.user.id, totalPrice]
        );

        // Clear cart
        await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

        await client.query('COMMIT');
        res.status(201).json(orderResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET /orders
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});