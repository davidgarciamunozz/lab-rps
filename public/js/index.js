document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('player-name');
    const registerBtn = document.getElementById('register-btn');
    const playersList = document.getElementById('players-list');
    const playersStatus = document.getElementById('players-status');
    const waitingMessage = document.getElementById('waiting-message');
    const readyMessage = document.getElementById('ready-message');
    const startGameBtn = document.getElementById('start-game-btn');
    const errorMessage = document.getElementById('error-message');
    const registrationForm = document.getElementById('registration-form');

    let currentPlayer = JSON.parse(localStorage.getItem('currentPlayer')) || null;
    
    // Verificar si el jugador ya está registrado
    if (currentPlayer) {
        registrationForm.classList.add('hidden');
        waitingMessage.classList.remove('hidden');
    }

    // Cargar jugadores registrados
    loadPlayers();

    // Función para cargar jugadores
    function loadPlayers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(players => {
                // Actualizar lista de jugadores
                playersList.innerHTML = '';
                players.forEach(player => {
                    const li = document.createElement('li');
                    li.textContent = player.name;
                    playersList.appendChild(li);
                });

                // Actualizar estado
                playersStatus.textContent = `Esperando jugadores (${players.length}/2)`;
                
                // Mostrar mensajes según el número de jugadores
                if (players.length === 1) {
                    if (currentPlayer) {
                        waitingMessage.classList.remove('hidden');
                        readyMessage.classList.add('hidden');
                    }
                } else if (players.length === 2) {
                    waitingMessage.classList.add('hidden');
                    readyMessage.classList.remove('hidden');
                    registrationForm.classList.add('hidden');
                } else {
                    waitingMessage.classList.add('hidden');
                    readyMessage.classList.add('hidden');
                    if (currentPlayer) {
                        registrationForm.classList.add('hidden');
                    } else {
                        registrationForm.classList.remove('hidden');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al cargar jugadores');
            });
    }

    // Función para registrar un jugador
    function registerPlayer() {
        const name = playerNameInput.value.trim();
        
        if (!name) {
            showError('Por favor ingresa tu nombre');
            return;
        }
        
        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error al registrar');
                });
            }
            return response.json();
        })
        .then(player => {
            // Guardar jugador actual en localStorage
            localStorage.setItem('currentPlayer', JSON.stringify(player));
            currentPlayer = player;
            
            // Ocultar formulario y mostrar mensaje de espera
            registrationForm.classList.add('hidden');
            waitingMessage.classList.remove('hidden');
            
            // Mostrar información sobre la pantalla de resultados
            showInfo('¡Registro exitoso! Puedes ver la pantalla de resultados en "/display"');
            
            // Actualizar lista de jugadores
            loadPlayers();
        })
        .catch(error => {
            showError(error.message);
        });
    }

    // Registrar al hacer clic en el botón
    registerBtn.addEventListener('click', registerPlayer);
    
    // Registrar al presionar Enter en el input
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            registerPlayer();
        }
    });

    // Iniciar juego
    startGameBtn.addEventListener('click', () => {
        window.location.href = '/game';
    });

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }
    
    // Mostrar mensaje informativo
    function showInfo(message) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.textContent = message;
        infoDiv.style.backgroundColor = '#d4edda';
        infoDiv.style.color = '#155724';
        infoDiv.style.padding = '10px';
        infoDiv.style.marginTop = '15px';
        infoDiv.style.borderRadius = '4px';
        infoDiv.style.textAlign = 'center';
        
        document.querySelector('.registration').appendChild(infoDiv);
        
        setTimeout(() => {
            infoDiv.remove();
        }, 5000);
    }

    // Actualizar periódicamente la lista de jugadores
    setInterval(loadPlayers, 2000);
});