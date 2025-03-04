import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { openShop, search } from '../controllers/search.js';

const router = express.Router();

// search route
router.get('/query', authMiddleware, search);

// open specific/relevent vendor shop
router.get('/shop/:vendorId', authMiddleware, openShop);

export default router;
