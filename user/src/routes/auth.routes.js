import {Router} from 'express';
import * as authController from '../controllers/auth.Controller.js';

const router = Router();

router.post('/register',authController.userRegister);
router.get('/get-me',authController.getMe);
router.get('/refresh-token',authController.refreshToken);
router.get('/logout',authController.logout);
router.get('/logoutall',authController.logoutAll);
router.post('/login',authController.login);



export default router;

