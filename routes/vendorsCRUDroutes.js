import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { deleteVendor, updateVendor, getHistoryVendor , sendpricing ,showQuery } from '../controllers/vendorCrudOpt.js';

const router = express.Router()

// CRUD operations for vendors
router.delete('/deleteShop/:vendorId', authMiddleware, deleteVendor);
router.put('/updateShop/:vendorId', authMiddleware, updateVendor);
router.get('/history', authMiddleware, getHistoryVendor);
router.get('/showQuery/:queryId', showQuery);// yes to respond user
router.post('/sendpricing/:queryId', sendpricing);// yes to respond user



export default router;