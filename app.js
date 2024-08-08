document.addEventListener('DOMContentLoaded', () => {
    // Manejar el registro de usuario
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const contraseña = document.getElementById('contraseña').value;
        const rol = document.getElementById('rol').value;

        // Validar campos
        if (!nombre || !email || !contraseña || !rol) {
            alert('Todos los campos son necesarios');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, contraseña, rol })
            });

            if (!response.ok) {
                const error = await response.json();
                alert('Error al registrar usuario: ' + (error.error || 'Ocurrió un error'));
                return;
            }

            const result = await response.json();
            alert('Usuario registrado: ' + JSON.stringify(result));
        } catch (error) {
            console.error('Error:', error);
            alert('Error al comunicarse con el servidor');
        }
    });

    // Obtener usuarios
    document.getElementById('getUsersButton').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3001/api/usuarios');

            if (!response.ok) {
                const error = await response.json();
                alert('Error al obtener usuarios: ' + (error.error || 'Ocurrió un error'));
                return;
            }

            const users = await response.json();
            document.getElementById('usersList').textContent = JSON.stringify(users, null, 2);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al comunicarse con el servidor');
        }
    });
});
