document.addEventListener('DOMContentLoaded', () => {
    const playerNameElement = document.getElementById('player-name');
    const timerElement = document.getElementById('timer');
    const movesContainer = document.getElementById('moves-container');
    const statusMessage = document.getElementById('status-message');
    const waitingOpponent = document.getElementById('waiting-opponent');
    
    let currentPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
    let timer = 10;
    let timerInterval;
    let moveSelected = false;
    
    // Verificar si el jugador está registrado
    if (!currentPlayer) {
        window.location.href = '/';
        return;
    }
    
    playerNameElement.textContent = currentPlayer.name;
    

    startTimer();
    

    function startTimer() {
        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = timer;
            
            if (timer <= 0) {
                clearInterval(timerInterval);
                if (!moveSelected) {
                    // Hacer un movimiento aleatorio si no se seleccionó ninguno
                    const moves = ['rock', 'paper', 'scissors'];
                    const randomMove = moves[Math.floor(Math.random() * moves.length)];
                    selectMove(randomMove);
                    statusMessage.textContent = `¡Tiempo agotado! Se seleccionó ${randomMove} automáticamente`;
                }
            }
        }, 1000);
    }
    
    // Manejar la selección de movimiento
    movesContainer.addEventListener('click', (e) => {
        const moveElement = e.target.closest('.move');
        if (!moveElement || moveSelected) return;
        
        const move = moveElement.dataset.move;
        selectMove(move);
    });
    
    // Función para seleccionar un movimiento
    function selectMove(move) {
        if (moveSelected) return;
        
        moveSelected = true;
        clearInterval(timerInterval);
        
        // Destacar el movimiento seleccionado
        document.querySelectorAll('.move').forEach(el => {
            if (el.dataset.move === move) {
                el.classList.add('selected');
            } else {
                el.classList.add('not-selected');
            }
        });
        
        // Enviar movimiento al servidor
        fetch('/api/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentPlayer.id,
                move: move
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                statusMessage.textContent = data.error;
                return;
            }
            
            if (data.redirectToResult) {
                // Redirigir a la página de resultados para este jugador
                window.location.href = '/result';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            statusMessage.textContent = 'Error al enviar tu movimiento';
        });
    }
});