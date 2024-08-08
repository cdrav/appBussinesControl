const express = require('express');
const router = express.Router();
const connection = require('../config/db'); // Configura tu conexión a la base de datos

// Crear un nuevo producto
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !descripcion || !precio || !stock) {
    return res.status(400).json({ error: 'Todos los campos son necesarios' });
  }

  const query = 'INSERT INTO Productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)';
  connection.query(query, [nombre, descripcion, precio, stock], (err, results) => {
    if (err) {
      console.error('Error al crear el producto:', err);
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
    res.status(201).json({ id_producto: results.insertId, nombre, descripcion, precio, stock });
  });
});

// Obtener todos los productos
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Productos';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.status(200).json(results);
  });
});

// Obtener un producto por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Productos WHERE id_producto = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el producto:', err);
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(results[0]);
  });
});

// Actualizar un producto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !descripcion || !precio || !stock) {
    return res.status(400).json({ error: 'Todos los campos son necesarios' });
  }

  const query = 'UPDATE Productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id_producto = ?';
  connection.query(query, [nombre, descripcion, precio, stock, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
    res.status(200).json({ message: 'Producto actualizado con éxito' });
  });
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM Productos WHERE id_producto = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    res.status(200).json({ message: 'Producto eliminado con éxito' });
  });
});

module.exports = router;
