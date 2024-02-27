import Express from "express";
import { getCart, getCurrentUser, login, register, updateCart } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Express.Router()



router.post("/register", register)
router.post("/login", login)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/updateCart").post(verifyJWT, updateCart)
router.route("/getCart").get(verifyJWT, getCart)

export default router