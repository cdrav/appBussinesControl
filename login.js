document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value; // Asegúrate de que 'password' coincida con lo que espera el servidor

    try {
        // Enviar solicitud de inicio de sesión al servidor
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, contraseña: password }) // Cambiado a 'contraseña'
        });

        // Verificar si la respuesta es exitosa
        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);

            alert('Inicio de sesión exitoso');

            // Redirigir a una página protegida o a la página principal
            window.location.href = './index.html'; // Cambia la URL según sea necesario
        } else {
            // Manejar errores
            const error = await response.json();
            console.error('Error:', error);
            alert('Error en el inicio de sesión: ' + (error.error || 'Ocurrió un error'));
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error al comunicarse con el servidor');
    }
});
