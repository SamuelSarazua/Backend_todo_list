const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware para habilitar CORS
app.use(cors({
  origin: 'http://127.0.0.1:5502' // Dirección del frontend
}));

// Middleware para parsear JSON
app.use(express.json());

// 📌 Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// 📌 Configurar la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sarazua_2024.:)',
  database: 'todo_list'
});

db.connect(err => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conexión exitosa a MySQL');
});

// 📌 Ruta para registrar un nuevo usuario
app.post('/registro', (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const sql = 'INSERT INTO usuario (nombre, correo, contraseña) VALUES (?, ?, ?)';
  db.query(sql, [nombre, correo, contraseña], (err, result) => {
    if (err) {
      console.error('Error al registrar:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  });
});

// 📌 Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const sql = 'SELECT id FROM usuario WHERE correo = ? AND contraseña = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.json({ mensaje: 'Inicio de sesión exitoso', usuario_id: results[0].id });
  });
});

// 📌 Ruta para obtener tareas del usuario autenticado
app.get('/tareas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const sql = 'SELECT * FROM tarea WHERE usuario_id = ?';
  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error('Error al obtener tareas:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    res.json(results);
  });
});

// 📌 Ruta para agregar una tarea
// Ruta para agregar una tarea
app.post('/tareas', (req, res) => {
  const { nombre, estado, usuario_id } = req.body;

  if (!nombre || !usuario_id) {
      return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const sql = 'INSERT INTO tarea (nombre, estado, usuario_id) VALUES (?, ?, ?)';
  db.query(sql, [nombre, estado || 'pendiente', usuario_id], (err, result) => {
      if (err) {
          console.error('Error al agregar tarea:', err);
          return res.status(500).json({ mensaje: 'Error en el servidor' });
      }
      res.status(201).json({ mensaje: 'Tarea agregada', id: result.insertId });
  });
});

// 📌 Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📌 Ruta para servir el archivo login.html (si lo necesitas específicamente)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login", "login.html"));
});

// 📌 Configurar el puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
