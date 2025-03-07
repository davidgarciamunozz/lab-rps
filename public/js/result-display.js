document.addEventListener('DOMContentLoaded', () => {
    const playersListDisplay = document.getElementById('players-list-display');
    const gameStatusMessage = document.getElementById('game-status-message');
    const resultDisplay = document.getElementById('result-display');
    const resultMessageDisplay = document.getElementById('result-message-display');
    const resultDetailsDisplay = document.getElementById('result-details-display');
    const countdownDisplayElement = document.getElementById('countdown-display');
    const newGameContainer = document.getElementById('new-game-container');
    
    let countdown = 5;
    let countdownInterval;
    let gameInProgress = false;
    
    // Función para cargar los jugadores
    function loadPlayers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(players => {
                // Actualizar lista de jugadores
                playersListDisplay.innerHTML = '';
                
                if (players.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No hay jugadores registrados';
                    playersListDisplay.appendChild(li);
                    gameStatusMessage.textContent = 'Esperando a que los jugadores se registren...';
                    gameInProgress = false;
                } else {
                    players.forEach(player => {
                        const li = document.createElement('li');
                        li.textContent = player.name;
                        playersListDisplay.appendChild(li);
                    });
                    
                    if (players.length === 1) {
                        gameStatusMessage.textContent = 'Esperando al segundo jugador...';
                        gameInProgress = false;
                    } else if (players.length === 2) {
                        gameStatusMessage.textContent = 'Ambos jugadores están listos. Esperando sus movimientos...';
                        gameInProgress = true;
                        checkGameResult();
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                gameStatusMessage.textContent = 'Error al cargar jugadores';
            });
    }
    
    // Función para verificar el resultado del juego
    function checkGameResult() {
        fetch('/api/result')
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    // Mostrar el resultado
                    displayResult(data.result);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // Función para mostrar el resultado
    function displayResult(result) {
        // Actualizar estado del juego
        gameStatusMessage.textContent = '¡Juego terminado!';
        
        // Mostrar sección de resultados
        resultDisplay.classList.remove('hidden');
        
        // Mostrar ganador o empate
        if (result.winner) {
            resultMessageDisplay.innerHTML = `<h3 class="winner">${result.message}</h3>`;
        } else {
            resultMessageDisplay.innerHTML = `<h3 class="tie">${result.message}</h3>`;
        }
        
        // Mostrar detalles
        resultDetailsDisplay.innerHTML = `<p>${result.details}</p>`;
        
        // Iniciar cuenta regresiva
        startCountdown();
    }
    
    // Iniciar cuenta regresiva para reiniciar el juego
    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdown = 5;
        countdownDisplayElement.textContent = countdown;
        
        countdownInterval = setInterval(() => {
            countdown--;
            countdownDisplayElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                
                // Ocultar sección de resultados
                resultDisplay.classList.add('hidden');
                
                // Mostrar mensaje de nuevo juego
                newGameContainer.classList.remove('hidden');
                
                // Después de un tiempo, ocultar mensaje de nuevo juego
                setTimeout(() => {
                    newGameContainer.classList.add('hidden');
                    gameStatusMessage.textContent = 'Esperando a que los jugadores se registren...';
                }, 3000);
            }
        }, 1000);
    }
    
    // Cargar jugadores al inicio
    loadPlayers();
    
    // Actualizar periódicamente la información
    setInterval(() => {
        loadPlayers();
        if (gameInProgress) {
            checkGameResult();
        }
    }, 1000);
});