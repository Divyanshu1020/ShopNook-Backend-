import Express from "express";
import {  deleteCartItem, getCartItems, getCurrentUser,  getWishlistItems,  login, register, updateCartItem, updateWishlistItem, } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Express.Router()



router.post("/register", register)
router.post("/login", login)
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/cart")
.get(verifyJWT, getCartItems)
.post(verifyJWT, updateCartItem)
.delete(verifyJWT, deleteCartItem)

router.route("/wishlist")
.get(verifyJWT, getWishlistItems)
.post(verifyJWT, updateWishlistItem)


export default router