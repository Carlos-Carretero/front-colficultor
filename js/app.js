const modal = document.getElementById("authModal")
const openBtn = document.getElementById("openLogin")
const closeBtn = document.getElementById("closeModal")

const showRegister = document.getElementById("showRegister")
const showLogin = document.getElementById("showLogin")
const showForgotPassword = document.getElementById("showForgotPassword")
const backToLogin = document.getElementById("backToLogin")

const registerContainer = document.getElementById("registerContainer")
const loginContainer = document.getElementById("loginContainer")
const recoveryContainer = document.getElementById("recoveryContainer")
const forgotPasswordSection = document.getElementById("forgotPasswordSection")

let failedAttempts = 0;

openBtn.onclick = ()=>{
    modal.classList.add("active")
    failedAttempts = 0;
    forgotPasswordSection.classList.add("hidden")
}

closeBtn.onclick = ()=>{
    modal.classList.remove("active")
}

window.onclick = (e)=>{
    if(e.target === modal){
        modal.classList.remove("active")
    }
}

showRegister.onclick = ()=>{
    loginContainer.classList.add("hidden")
    registerContainer.classList.remove("hidden")
}

showLogin.onclick = ()=>{
    registerContainer.classList.add("hidden")
    loginContainer.classList.remove("hidden")
    forgotPasswordSection.classList.add("hidden")
}

showForgotPassword.onclick = ()=>{
    loginContainer.classList.add("hidden")
    recoveryContainer.classList.remove("hidden")
}

backToLogin.onclick = ()=>{
    recoveryContainer.classList.add("hidden")
    loginContainer.classList.remove("hidden")
    forgotPasswordSection.classList.add("hidden")
}

// Configuración del API
const API_URL = "http://localhost:8000/api/auth";

// Formularios
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const recoveryForm = document.getElementById("recoveryForm");

// Login Logic
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                username: email,
                password: password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            alert("Inicio de sesión exitoso");
            modal.classList.remove("active");
            loginForm.reset();
            failedAttempts = 0;
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || "Credenciales incorrectas"}`);
            failedAttempts++;
            if (failedAttempts >= 1) {
                forgotPasswordSection.classList.remove("hidden");
            }
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("Ocurrió un error al intentar iniciar sesión. Verifica que el servidor esté corriendo.");
        failedAttempts++;
        if (failedAttempts >= 1) {
            forgotPasswordSection.classList.remove("hidden");
        }
    }
});

// Register Logic
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const role = document.getElementById("registerRole").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                full_name: name,
                role: role,
                password: password,
            }),
        });

        if (response.ok) {
            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            registerForm.reset();
            // Switch to login tab
            registerContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        } else {
            const error = await response.json();
            alert(`Error en el registro: ${JSON.stringify(error.detail) || "Datos inválidos"}`);
        }
    } catch (error) {
        console.error("Error en registro:", error);
        alert("Ocurrió un error al intentar registrarse. Verifica que el servidor esté corriendo.");
    }
});

// Password Recovery Logic
recoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("recoveryEmail").value;
    
    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        if (response.ok) {
            alert("Se ha enviado un enlace de recuperación a tu correo electrónico.");
            recoveryForm.reset();
            recoveryContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
            forgotPasswordSection.classList.add("hidden");
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || "El correo no se encontró en nuestros registros"}`);
        }
    } catch (error) {
        console.error("Error en recuperación:", error);
        alert("Ocurrió un error. Por favor, intenta de nuevo.");
    }
});

// Botón Mostrar Más Productos (estructura sin funcionalidad por ahora)
const showMoreBtn = document.getElementById("showMoreBtn");
// Sin event listener por ahora