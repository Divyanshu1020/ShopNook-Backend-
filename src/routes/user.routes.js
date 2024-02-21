import Express from "express";
import { getCurrentUser, login, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Express.Router()



router.post("/register", register)
router.post("/login", login)
router.route("/current-user").get(verifyJWT, getCurrentUser)


export default router