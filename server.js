const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// Configuración de CORS
app.use(cors({
    origin: 'http://127.0.0.1:5501', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Magodeoz891108',
    database: 'ventas_inventarios'
});

// Conexión a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir si la conexión falla
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para manejar el login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan el email o la contraseña' });
    }

    const query = 'SELECT * FROM Usuarios WHERE email = ?';
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Comparar la contraseña ingresada con la cifrada en la base de datos
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    return res.status(500).json({ error: 'Error en el servidor' });
                }

                if (isMatch) {
                    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'tu_clave_secreta', { expiresIn: '1h' });
                    return res.json({ token });
                } else {
                    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
                }
            });
        } else {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
    });
});

// Servir archivos estáticos
app.use(express.static('public'));

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error general:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
