import { Router } from "express";
import { addProduct, getProductById } from "../controllers/product.controller.js";

const router = Router();

router
    .route('/')
    .get()
    .post(addProduct)
router.route('/getProductById/:productId').get(getProductById);
router.route('/:productType').get();

export default router