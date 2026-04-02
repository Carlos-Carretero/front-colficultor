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
const loginSection = document.getElementById("loginSection")
const userSection = document.getElementById("userSection")
const userMenuBtn = document.getElementById("userMenuBtn")
const userMenu = document.getElementById("userMenu")
const userNameDisplay = document.getElementById("userNameDisplay")
const dashboardPanel = document.getElementById("dashboardPanel")
const dashboardTitle = document.getElementById("dashboardTitle")
const dashboardBody = document.getElementById("dashboardBody")
const closeDashboardBtn = document.getElementById("closeDashboardBtn")

let currentUser = null

openBtn.onclick = ()=>{
    modal.classList.add("active")
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
}

showForgotPassword.onclick = ()=>{
    loginContainer.classList.add("hidden")
    recoveryContainer.classList.remove("hidden")
}

backToLogin.onclick = ()=>{
    recoveryContainer.classList.add("hidden")
    loginContainer.classList.remove("hidden")
}

// Configuración del API — importada desde config.js
// API_CONFIG.API_URL y API_CONFIG.API_USERS_URL disponibles

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
        const response = await fetch(`${API_CONFIG.API_URL}/login`, {
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
            const authenticated = await applyAuthenticatedState();
            if (authenticated) {
                alert("Inicio de sesión exitoso");
                modal.classList.remove("active");
                loginForm.reset();
            } else {
                alert("Inicio de sesión falló al obtener el perfil. Por favor vuelve a intentarlo.");
            }
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || "Credenciales incorrectas"}`);
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("Ocurrió un error al intentar iniciar sesión. Verifica que el servidor esté corriendo.");
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
        const response = await fetch(`${API_CONFIG.API_URL}/register`, {
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
        const response = await fetch(`${API_CONFIG.API_URL}/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(responseData.message || "Se ha enviado un enlace de recuperación a tu correo electrónico.");
            recoveryForm.reset();
            recoveryContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        } else {
            const errorData = await response.json();
            alert(errorData.message || "No se pudo procesar la solicitud. Intenta más tarde.");
        }
    } catch (error) {
        console.error("Error en recuperación:", error);
        alert("Ocurrió un error. Por favor, intenta de nuevo.");
    }
});

// Botón Mostrar Más Productos (estructura sin funcionalidad por ahora)
const showMoreBtn = document.getElementById("showMoreBtn");
// Sin event listener por ahora

async function getCurrentUser() {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
        const res = await fetch(`${API_CONFIG.API_USERS_URL}/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.warn(`getCurrentUser failed: ${res.status}`);
            // No llamamos a logout() aquí — un error de red o backend caído
            // no debe cerrar la sesión del usuario automáticamente.
            // El usuario puede seguir navegando; la llamada se reintentará.
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

function buildMenuItems(role) {
    const common = [
        { label: "Mi perfil", action: openProfile },
        { label: "Mensajes", action: openMessages },
        { label: "Configuración", action: openSettings },
        { label: "Cerrar sesión", action: logout },
    ];

    if (role === "caficultor") {
        return [
            { label: "Mis productos", action: () => openPlaceholder("Mis productos", "Aquí aparecerán tus productos registrados." ) },
            { label: "Mis ventas", action: () => openPlaceholder("Mis ventas", "Aquí podrás revisar el historial de tus ventas." ) },
            { label: "Estadísticas", action: () => openPlaceholder("Estadísticas", "Visualiza tus estadísticas de ventas y rendimiento aquí." ) },
            ...common,
        ];
    }

    if (role === "comprador") {
        return [
            { label: "Mis compras", action: () => openPlaceholder("Mis compras", "Revisa tus compras y órdenes recientes aquí.") },
            { label: "Favoritos", action: () => openPlaceholder("Favoritos", "Tus productos favoritos aparecerán en este espacio.") },
            ...common,
        ];
    }

    if (role === "admin") {
        return [
            { label: "Gestión de usuarios", action: () => openPlaceholder("Gestión de usuarios", "Administra cuentas de usuario desde aquí." ) },
            { label: "Gestión de productos", action: () => openPlaceholder("Gestión de productos", "Administra el catálogo de productos desde aquí." ) },
            { label: "Reportes del sistema", action: () => openPlaceholder("Reportes del sistema", "Consulta reportes e indicadores del sistema." ) },
            { label: "Configuración general", action: openSettings },
            ...common,
        ];
    }

    return common;
}

function showUserMenu(user) {
    if (!user) return;

    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    userNameDisplay.textContent = user.full_name || user.email || "Mi perfil";
    userMenuBtn.setAttribute("aria-expanded", "false");

    userMenu.innerHTML = "";

    const items = buildMenuItems(user.role);
    const list = document.createElement("ul");
    list.className = "user-menu-list";

    items.forEach((item) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = "user-menu-item";
        btn.textContent = item.label;
        btn.type = "button";
        btn.setAttribute("aria-label", item.label);
        btn.addEventListener("click", async (event) => {
            event.stopPropagation();
            document.querySelectorAll(".user-menu-item").forEach((button) => button.classList.remove("active"));
            btn.classList.add("active");
            await item.action();
            userMenu.classList.add("hidden");
            userMenuBtn.setAttribute("aria-expanded", "false");
        });
        li.appendChild(btn);
        list.appendChild(li);
    });

    userMenu.appendChild(list);
}

async function logout() {
    const token = localStorage.getItem("access_token");
    let logoutSuccess = false;

    if (token) {
        try {
            const response = await fetch(`${API_CONFIG.API_URL}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            logoutSuccess = response.ok;
            if (!logoutSuccess) {
                console.warn("Logout request returned non-ok status:", response.status);
            }
        } catch (error) {
            console.warn("Logout request failed:", error);
        }
    }

    localStorage.removeItem("access_token");
    currentUser = null;
    userSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    userMenu.classList.add("hidden");
    userMenuBtn.setAttribute("aria-expanded", "false");
    dashboardPanel?.classList.add("hidden");

    if (!logoutSuccess) {
        console.warn("Logout completed locally but backend logout may have failed.");
    }
}

function openDashboard(title, contentHtml) {
    dashboardTitle.textContent = title;
    dashboardBody.innerHTML = contentHtml;
    dashboardPanel.classList.remove("hidden");
    userMenu.classList.add("hidden");
    userMenuBtn.setAttribute("aria-expanded", "false");
}

function closeDashboard() {
    dashboardPanel.classList.add("hidden");
}

function openPlaceholder(title, message) {
    openDashboard(
        title,
        `
            <div class="dashboard-section">
                <p>${message}</p>
            </div>
        `
    );
}

function openProfile() {
    if (!currentUser) {
        return;
    }

    const fullName = currentUser.full_name || "Sin nombre";
    const roleLabel = currentUser.role
        ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
        : "Sin rol";

    openDashboard(
        "Mi perfil",
        `
            <div class="dashboard-section">
                <p><strong>Nombre:</strong> ${fullName}</p>
                <p><strong>Correo:</strong> ${currentUser.email}</p>
                <p><strong>Rol:</strong> ${roleLabel}</p>
                <p><strong>Activo:</strong> ${currentUser.is_active ? "Sí" : "No"}</p>
            </div>
        `
    );
}

function openMessages() {
    openDashboard(
        "Mensajes",
        `
            <div class="dashboard-section">
                <p>No tienes mensajes nuevos por ahora.</p>
                <p>Cuando el sistema encuentre notificaciones o respuestas, aparecerán aquí.</p>
                <div class="dashboard-section" style="margin-top:16px;">
                    <button type="button" class="dashboard-action-btn" id="dashboardRefreshMessagesBtn">Actualizar mensajes</button>
                </div>
            </div>
        `
    );

    const refreshBtn = document.getElementById("dashboardRefreshMessagesBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            openMessages();
        });
    }
}

function openSettings() {
    openDashboard(
        "Configuración",
        `
            <div class="dashboard-section">
                <p>En esta sección puedes actualizar los datos básicos de tu cuenta.</p>
                <form id="settingsForm" class="settings-form">
                    <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
                        <label style="font-weight:600;">Nombre</label>
                        <input id="settingsName" type="text" value="${currentUser?.full_name || ""}" placeholder="Nombre completo" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        <label style="font-weight:600;">Correo</label>
                        <input id="settingsEmail" type="email" value="${currentUser?.email || ""}" placeholder="Correo electrónico" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" disabled />
                        <label style="font-weight:600;">Rol</label>
                        <input type="text" value="${currentUser?.role || ""}" disabled style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                    </div>
                    <div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                        <button id="dashboardSaveSettingsBtn" type="button" class="dashboard-action-btn">Guardar cambios</button>
                        <button id="dashboardLogoutBtn" type="button" class="dashboard-action-btn" style="background:#c6701d;">Cerrar sesión</button>
                    </div>
                </form>
            </div>
        `
    );

    const dashboardSaveSettingsBtn = document.getElementById("dashboardSaveSettingsBtn");
    if (dashboardSaveSettingsBtn) {
        dashboardSaveSettingsBtn.addEventListener("click", () => {
            alert("Los cambios se han guardado en esta vista. Aquí puedes conectar la lógica real más tarde.");
        });
    }

    const dashboardLogoutBtn = document.getElementById("dashboardLogoutBtn");
    if (dashboardLogoutBtn) {
        dashboardLogoutBtn.addEventListener("click", () => {
            logout();
            closeDashboard();
        });
    }
}

async function applyAuthenticatedState() {
    const user = await getCurrentUser();
    if (!user) {
        logout();
        return false;
    }
    currentUser = user;
    showUserMenu(user);
    return true;
}

userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleUserMenu();
});

userMenu.addEventListener("click", (e) => {
    e.stopPropagation();
});

closeDashboardBtn?.addEventListener("click", () => {
    closeDashboard();
});

function toggleUserMenu() {
    const isHidden = userMenu.classList.toggle("hidden");
    userMenuBtn.setAttribute("aria-expanded", isHidden ? "false" : "true");
}

dashboardPanel?.addEventListener("click", (event) => {
    if (event.target === dashboardPanel) {
        closeDashboard();
    }
});

document.addEventListener("click", (event) => {
    const target = event.target;
    if (!userSection.contains(target)) {
        userMenu.classList.add("hidden");
        userMenuBtn.setAttribute("aria-expanded", "false");
    }
});

window.addEventListener("load", applyAuthenticatedState);
