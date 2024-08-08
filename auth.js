const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();

router.post(
  '/login',
  [
    check('email', 'Email es obligatorio').isEmail(),
    check('contraseña', 'contraseña es obligatoria').not().isEmpty()
  ],
  authController.login
);

module.exports = router;
