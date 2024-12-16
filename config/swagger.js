// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description: 'API для управления товарами, корзиной и заказами',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Products',
                description: 'Управление продуктами'
            },
            {
                name: 'Cart',
                description: 'Операции с корзиной'
            },
            {
                name: 'Orders',
                description: 'Управление заказами'
            },
            {
                name: 'Auth',
                description: 'Аутентификация пользователей'
            }
        ],
        components: {
            schemas: {
                Product: {
                    type: 'object',
                    required: ['name', 'price', 'category'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Уникальный идентификатор продукта'
                        },
                        name: {
                            type: 'string',
                            description: 'Название продукта'
                        },
                        price: {
                            type: 'number',
                            description: 'Цена продукта'
                        },
                        description: {
                            type: 'string',
                            description: 'Описание продукта'
                        },
                        category: {
                            type: 'string',
                            description: 'Категория продукта'
                        },
                        stock_quantity: {
                            type: 'integer',
                            description: 'Количество на складе'
                        }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID записи в корзине'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'ID пользователя'
                        },
                        product_id: {
                            type: 'integer',
                            description: 'ID продукта'
                        },
                        quantity: {
                            type: 'integer',
                            description: 'Количество товара'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID заказа'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'ID пользователя'
                        },
                        total_price: {
                            type: 'number',
                            description: 'Общая сумма заказа'
                        },
                        status: {
                            type: 'string',
                            description: 'Статус заказа',
                            enum: ['pending', 'completed', 'cancelled']
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Сообщение об ошибке'
                        }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;

// src/routes/products.js
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список всех продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
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
 *                 example: "iPhone 13"
 *               price:
 *                 type: number
 *                 example: 999.99
 *               description:
 *                 type: string
 *                 example: "Latest iPhone model"
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               stock_quantity:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверный запрос
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /products/{id}:
 *   get:
 *     summary: Получить информацию о конкретном продукте
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *         example: 1
 *     responses:
 *       200:
 *         description: Информация о продукте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   put:
 *     summary: Обновить информацию о продукте
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Продукт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *
 *   delete:
 *     summary: Удалить продукт
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт успешно удален
 *       404:
 *         description: Продукт не найден
 */