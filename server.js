const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configuración CORS y bodyParser
app.use(cors());
app.use(bodyParser.json());

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Conectar a la base de datos
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta POST para crear un usuario
app.post('/api/usuarios', (req, res) => {
  const { nombre, email, contraseña, rol } = req.body;

  // Validar los datos
  if (!nombre || !email || !contraseña || !rol) {
    return res.status(400).json({ error: 'Todos los campos son necesarios' });
  }

  // Encriptar contraseña
  bcrypt.hash(contraseña, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error al encriptar la contraseña:', err);
      return res.status(500).json({ error: 'Error al encriptar la contraseña' });
    }

    const query = 'INSERT INTO Usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)';
    connection.query(query, [nombre, email, hashedPassword, rol], (err, results) => {
      if (err) {
        console.error('Error al crear el usuario:', err);
        return res.status(500).json({ error: 'Error al crear el usuario' });
      }
      res.status(201).json({ id_usuario: results.insertId, nombre, email, rol });
    });
  });
});

// Ruta POST para iniciar sesión
app.post('/api/login', (req, res) => {
  console.log('Cuerpo de la solicitud:', req.body); // Log para depuración
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ error: 'Email y contraseña son necesarios' });
  }

  const query = 'SELECT * FROM Usuarios WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).json({ error: 'Error al buscar el usuario' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = results[0];

    // Comparar contraseñas
    bcrypt.compare(contraseña, user.contraseña, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id_usuario: user.id_usuario, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token });
    });
  });
});

// Middleware para proteger rutas
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Ejemplo de ruta protegida
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.user });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

// Rutas de productos
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', authenticateToken, productRoutes);
