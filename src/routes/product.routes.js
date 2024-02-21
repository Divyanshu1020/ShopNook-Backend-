import { Router } from "express";
import { addProduct } from "../controllers/product.controller.js";

const router = Router();

router
    .route('/')
    .get()
    .post(addProduct)
router.route('/:productId').get();
router.route('/:productType').get();

export default router