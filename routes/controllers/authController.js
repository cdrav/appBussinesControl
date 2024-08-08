const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Consulta el usuario en la base de datos
  db.query('SELECT * FROM Usuarios WHERE email = ?', [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Verifica la contraseña
    bcrypt.compare(password, user.contraseña, (err, isMatch) => {
      if (err) throw err;

      if (!isMatch) {
        return res.status(400).json({ msg: 'Contraseña incorrecta' });
      }

      res.json({ msg: 'Inicio de sesión exitoso' });
    });
  });
};
