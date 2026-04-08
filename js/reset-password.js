// Reset Password JavaScript
document.addEventListener('DOMContentLoaded', function() {
    function showAppToast(message, kind = 'info', timeoutMs = 3200) {
        const body = document.body;
        if (!body) return;

        let host = document.getElementById('appToastHost');
        if (!host) {
            host = document.createElement('div');
            host.id = 'appToastHost';
            host.style.cssText = 'position:fixed;top:18px;right:18px;z-index:100000;display:flex;flex-direction:column;gap:10px;max-width:min(92vw,380px);';
            body.appendChild(host);
        }

        const toast = document.createElement('div');
        const palette = {
            info: { bg: '#ffffff', border: '#e6c9a6', color: '#4B2E2B' },
            success: { bg: '#effcf4', border: '#81d4a1', color: '#0f5c2b' },
            error: { bg: '#fff1f1', border: '#f0a7a7', color: '#8e1f1f' },
        };
        const theme = palette[kind] || palette.info;
        toast.style.cssText = `border:1px solid ${theme.border};background:${theme.bg};color:${theme.color};padding:12px 14px;border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,.12);font-size:0.92rem;line-height:1.35;opacity:0;transform:translateY(-6px);transition:opacity .2s ease, transform .2s ease;`;
        toast.textContent = String(message || '');
        host.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        window.setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-6px)';
            window.setTimeout(() => toast.remove(), 220);
        }, timeoutMs);
    }

    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const passwordStrength = document.getElementById('passwordStrength');
    const confirmError = document.getElementById('confirmError');
    const strengthError = document.createElement('div');
    strengthError.style.cssText = 'color:#ff4444;font-size:0.85rem;margin-top:0.5rem;min-height:1.2rem;';
    newPasswordInput.parentElement.appendChild(strengthError);

    // Configuration — usa API_CONFIG centralizado (definido en config.js)

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showAppToast('Token de recuperación no encontrado. Por favor, solicita un nuevo enlace de recuperación.', 'error');
        window.setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        return;
    }

    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            digit: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };

        strength = Object.values(checks).filter(Boolean).length;

        passwordStrength.className = 'password-strength';
        strengthError.textContent = '';

        if (password.length === 0) {
            passwordStrength.className = 'password-strength';
            return false;
        }

        if (strength <= 2) {
            passwordStrength.classList.add('weak');
            if (!checks.special) strengthError.textContent = 'Falta: un símbolo (!@#$%…)';
        } else if (strength <= 4) {
            passwordStrength.classList.add('medium');
            if (!checks.special) strengthError.textContent = 'Añade un símbolo para mayor seguridad';
        } else {
            passwordStrength.classList.add('strong');
        }

        return strength >= 3;
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
            showAppToast('La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAppToast('Las contraseñas no coinciden.');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Procesando...';

        try {
            const response = await fetch(`${API_CONFIG.API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success - Show alert and redirect link
                showAppToast('¡Contraseña restablecida exitosamente!');

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
                // Error — Pydantic 422 devuelve detail como array de objetos
                let errorMsg = 'No se pudo restablecer la contraseña. El enlace puede haber expirado.';
                if (data.detail) {
                    if (typeof data.detail === 'string') {
                        errorMsg = data.detail;
                    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
                        errorMsg = data.detail[0].msg || data.detail[0].message || errorMsg;
                    }
                }
                showAppToast(`Error: ${errorMsg}`);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-key"></i> Restablecer Contraseña';
            }
        } catch (error) {
            console.error('Error:', error);
            showAppToast('Ocurrió un error al intentar restablecer la contraseña. Verifica que el servidor esté corriendo.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-key"></i> Restablecer Contraseña';
        }
    });

    // Optional: Validate token on page load
    async function validateToken() {
        try {
            const response = await fetch(`${API_CONFIG.API_URL}/reset-password/validate?token=${encodeURIComponent(token)}`);
            const data = await response.json();

            if (!response.ok || !data.valid) {
                showAppToast('El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.');
                window.setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            }
        } catch (error) {
            console.warn('No se pudo validar el token, continuando...', error);
            // Continue anyway, let the reset attempt handle validation
        }
    }

    // Validate token when page loads
    validateToken();
});
