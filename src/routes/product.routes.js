import { Router } from "express";
import { addProduct, getAllProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

router
    .route('')
    .get(getAllProducts)
    .post(addProduct)
router.route('/getProductById/:productId').get(getProductById);

export default router