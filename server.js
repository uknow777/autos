const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'autos_db'
});

connection.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');

    // Crear la tabla 'usuarios' si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `;
    connection.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creando la tabla de usuarios:", err);
        } else {
            console.log("Tabla 'usuarios' verificada/existente.");
        }
    });
});

// Servir el archivo login.html correctamente
app.get('/api/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Obtener todos los autos
app.get('/api/autos', (req, res) => {
    connection.query('SELECT * FROM autos', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Agregar un auto
app.post('/api/autos', (req, res) => {
    const { marca, modelo, año, precio, color } = req.body;
    connection.query('INSERT INTO autos (marca, modelo, año, precio, color) VALUES (?, ?, ?, ?, ?)',
        [marca, modelo, año, precio, color],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Auto agregado correctamente' });
            }
        }
    );
});

// Actualizar un auto
app.put('/api/autos/:id', (req, res) => {
    const { marca, modelo, año, precio, color } = req.body;
    const { id } = req.params;

    connection.query('UPDATE autos SET marca=?, modelo=?, año=?, precio=?, color=? WHERE id=?',
        [marca, modelo, año, precio, color, id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Auto actualizado correctamente' });
            }
        }
    );
});

// Eliminar un auto y resetear el ID
app.delete('/api/autos/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM autos WHERE id=?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            connection.query('ALTER TABLE autos AUTO_INCREMENT = 1', () => {
                res.json({ message: 'Auto eliminado correctamente' });
            });
        }
    });
});

// Ruta para manejar login con verificación de tabla
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query("SHOW TABLES LIKE 'usuarios'", (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: "Error en el servidor" });
            return;
        }

        if (results.length === 0) {
            res.status(500).json({ success: false, message: "La tabla 'usuarios' no existe" });
            return;
        }

        const query = "SELECT * FROM usuarios WHERE username = ? AND password = ?";
        connection.query(query, [username, password], (err, results) => {
            if (err) {
                res.status(500).json({ success: false, message: "Error en el servidor" });
                return;
            }

            if (results.length > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Credenciales incorrectas" });
            }
        });
    });
});

// Ruta para registrar un usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    connection.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', 
        [username, password], 
        (err) => {
            if (err) {
                res.json({ success: false, message: "No se pudo registrar el usuario" });
            } else {
                res.json({ success: true, message: "Usuario registrado correctamente" });
            }
        }
    );
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});