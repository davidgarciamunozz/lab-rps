const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '..', 'db', 'db.json');

// Leer la base de datos
const readDB = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

// Escribir en la base de datos
const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Reset de la base de datos
const resetDB = () => {
    writeDB({ users: [], gameResult: null });
};

// Verificar si ya hay dos usuarios registrados
router.get('/users/check', (req, res) => {
    const db = readDB();
    res.json({ count: db.users.length });
});

// Registrar un nuevo usuario
router.post('/users/register', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Se requiere un nombre' });
        }

        const db = readDB();
        
        // Verificar si ya existen dos usuarios
        if (db.users.length >= 2) {
            return res.status(400).json({ error: 'Ya hay dos jugadores registrados' });
        }
        
        // Verificar si el nombre ya está en uso
        if (db.users.some(user => user.name === name)) {
            return res.status(400).json({ error: 'Este nombre ya está en uso' });
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            name,
            move: null
        };

        db.users.push(newUser);
        writeDB(db);

        res.status(201).json({ id: newUser.id, name: newUser.name });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener usuarios registrados
router.get('/users', (req, res) => {
    const db = readDB();
    // Solo enviar nombres, no movimientos
    const users = db.users.map(user => ({ id: user.id, name: user.name }));
    res.json(users);
});

// Enviar movimiento
router.post('/move', (req, res) => {
    try {
        const { userId, move } = req.body;
        
        if (!userId || !move) {
            return res.status(400).json({ error: 'Se requiere userId y move' });
        }
        
        if (!['rock', 'paper', 'scissors'].includes(move)) {
            return res.status(400).json({ error: 'Movimiento inválido' });
        }

        const db = readDB();
        const userIndex = db.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Guardar movimiento
        db.users[userIndex].move = move;
        writeDB(db);

        // Verificar si ambos jugadores han hecho su movimiento
        const allMovesMade = db.users.length === 2 && db.users.every(user => user.move !== null);
        
        if (allMovesMade) {
            // Calcular resultado
            const result = calculateResult(db.users);
            db.gameResult = result;
            writeDB(db);
            
            // Programar reset después de 5 segundos
            setTimeout(() => {
                resetDB();
            }, 5000);
        }

        // Siempre redirigir al jugador a la página de resultados después de hacer su movimiento
        res.json({ redirectToResult: true });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener resultado del juego
router.get('/result', (req, res) => {
    const db = readDB();
    res.json({ result: db.gameResult });
});

// Función para calcular el resultado
function calculateResult(users) {
    const player1 = users[0];
    const player2 = users[1];
    
    if (player1.move === player2.move) {
        return {
            winner: null,
            message: "Empate",
            details: `Ambos eligieron ${player1.move}`
        };
    }
    
    let winner;
    
    if (
        (player1.move === 'rock' && player2.move === 'scissors') ||
        (player1.move === 'paper' && player2.move === 'rock') ||
        (player1.move === 'scissors' && player2.move === 'paper')
    ) {
        winner = player1;
    } else {
        winner = player2;
    }
    
    return {
        winner: {
            id: winner.id,
            name: winner.name
        },
        moves: {
            [player1.name]: player1.move,
            [player2.name]: player2.move
        },
        message: `${winner.name} gana`,
        details: `${player1.name} eligió ${player1.move} y ${player2.name} eligió ${player2.move}`
    };
}

module.exports = router;