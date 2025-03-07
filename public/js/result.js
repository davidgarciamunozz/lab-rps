document.addEventListener('DOMContentLoaded', () => {
    const resultMessage = document.getElementById('result-message');
    const resultDetails = document.getElementById('result-details');
    const countdownElement = document.getElementById('countdown');
    const resetContainer = document.getElementById('reset-container');
    const countdownContainer = document.getElementById('countdown-container');
    
    let countdown = 5;
    
    // Obtener resultado del juego
    fetch('/api/result')
        .then(response => response.json())
        .then(data => {
            if (!data.result) {
                resultMessage.innerHTML = '<p>No hay resultados disponibles</p>';
                return;
            }
            
            const result = data.result;
            
            // Mostrar ganador o empate
            if (result.winner) {
                resultMessage.innerHTML = `<h3>${result.message}</h3>`;
            } else {
                resultMessage.innerHTML = `<h3>${result.message}</h3>`;
            }
            
            // Mostrar detalles
            resultDetails.innerHTML = `<p>${result.details}</p>`;
            
            // Iniciar cuenta regresiva
            startCountdown();
        })
        .catch(error => {
            console.error('Error:', error);
            resultMessage.innerHTML = '<p>Error al cargar resultados</p>';
        });
    
    // Iniciar cuenta regresiva para reiniciar el juego
    function startCountdown() {
        const interval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(interval);
                countdownContainer.classList.add('hidden');
                resetContainer.classList.remove('hidden');
                localStorage.removeItem('currentPlayer');
            }
        }, 1000);
    }
});