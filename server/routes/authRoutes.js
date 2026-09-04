import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  changePassword,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);

export default router;
