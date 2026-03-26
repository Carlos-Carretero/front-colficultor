// Reset Password JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const passwordStrength = document.getElementById('passwordStrength');
    const confirmError = document.getElementById('confirmError');

    // Configuration
    const API_URL = "http://localhost:8000/api/auth";

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        alert('Token de recuperación no encontrado. Por favor, solicita un nuevo enlace de recuperación.');
        window.location.href = 'index.html';
        return;
    }

    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        ];

        strength = checks.filter(Boolean).length;

        passwordStrength.className = 'password-strength';

        if (strength <= 2) {
            passwordStrength.classList.add('weak');
        } else if (strength <= 4) {
            passwordStrength.classList.add('medium');
        } else {
            passwordStrength.classList.add('strong');
        }

        return strength >= 3; // Require at least medium strength
    }

    // Password input handler
    newPasswordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        validatePasswords();
    });

    // Confirm password input handler
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswords();
    });

    // Validate passwords match
    function validatePasswords() {
        const password = newPasswordInput.value;
        const confirm = confirmPasswordInput.value;

        if (confirm && password !== confirm) {
            confirmError.textContent = 'Las contraseñas no coinciden';
            return false;
        } else {
            confirmError.textContent = '';
            return true;
        }
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Client-side validation
        if (!checkPasswordStrength(newPassword)) {
            alert('La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Procesando...';

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    new_password: newPassword,
                    confirm_password: newPassword, // Backend expects this field
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success - Show alert and redirect link
                alert('¡Contraseña restablecida exitosamente!');

                // Replace form with simple success message and link
                form.innerHTML = `
                    <div class="success-message">
                        <p style="text-align: center; color: #4B2E2B; margin-bottom: 1rem;">
                            Tu contraseña ha sido actualizada correctamente.
                        </p>
                        <p style="text-align: center;">
                            <a href="index.html" style="color: #E2902D; text-decoration: none; font-weight: 500; border-bottom: 1px solid #E2902D;">
                                Ir a la página principal
                            </a>
                        </p>
                    </div>
                `;
            } else {
                // Error
                alert(`Error: ${data.detail || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.'}`);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-key"></i> Restablecer Contraseña';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al intentar restablecer la contraseña. Verifica que el servidor esté corriendo.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-key"></i> Restablecer Contraseña';
        }
    });

    // Optional: Validate token on page load
    async function validateToken() {
        try {
            const response = await fetch(`${API_URL}/reset-password/validate?token=${encodeURIComponent(token)}`);
            const data = await response.json();

            if (!response.ok || !data.valid) {
                alert('El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.warn('No se pudo validar el token, continuando...', error);
            // Continue anyway, let the reset attempt handle validation
        }
    }

    // Validate token when page loads
    validateToken();
});