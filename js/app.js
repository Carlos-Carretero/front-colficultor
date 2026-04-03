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

// ── reCAPTCHA v3 ───────────────────────────────────────────────
const RECAPTCHA_SITE_KEY = "6LcTDaQsAAAAAFqnC9Ib3PAPf1Zfcc-YztBQK7lF"

async function getRecaptchaToken(action) {
    if (typeof grecaptcha === "undefined") {
        console.warn("grecaptcha no cargado — omitiendo token")
        return null
    }
    try {
        return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
    } catch (e) {
        console.error("Error ejecutando reCAPTCHA:", e)
        return null
    }
}

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

// Filtros desplegables para celular
const mobileFilterBtn = document.getElementById("mobileFilterBtn")
if (mobileFilterBtn) {
    mobileFilterBtn.onclick = () => {
        const wrapper = document.getElementById("tagsWrapper")
        if(wrapper) wrapper.classList.toggle("opened")
    }
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
        const recaptchaToken = await getRecaptchaToken("login")
        const headers = {"Content-Type": "application/x-www-form-urlencoded"}
        if (recaptchaToken) headers["x-recaptcha-token"] = recaptchaToken

        const response = await fetch(`${API_CONFIG.API_URL}/login`, {
            method: "POST",
            headers,
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
        const recaptchaToken = await getRecaptchaToken("register")
        const headers = {"Content-Type": "application/json"}
        if (recaptchaToken) headers["x-recaptcha-token"] = recaptchaToken

        const response = await fetch(`${API_CONFIG.API_URL}/register`, {
            method: "POST",
            headers,
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
        const recaptchaToken = await getRecaptchaToken("forgot_password")
        const headers = {"Content-Type": "application/json"}
        if (recaptchaToken) headers["x-recaptcha-token"] = recaptchaToken

        const response = await fetch(`${API_CONFIG.API_URL}/forgot-password`, {
            method: "POST",
            headers,
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
            { label: "Mis productos", action: openMyProducts },
            { label: "Mis ventas", action: openMySales },
            { label: "Estadísticas", action: openMyStats },
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

    // Extraer datos adicionales con respaldos (fallbacks)
    const tel = currentUser.perfil_telefono || "No especificado";
    const ubicacion = (currentUser.perfil_ciudad || currentUser.perfil_departamento) 
        ? `${currentUser.perfil_ciudad || ''}, ${currentUser.perfil_departamento || ''}`.replace(/^, | ,$/, '').trim() 
        : "No especificada";
    const direccion = currentUser.perfil_direccion || "No especificada";
    const prefs = currentUser.perfil_preferencias || "Aún no has agregado ninguna descripción o preferencia sobre el café.";

    openDashboard(
        "Mi perfil",
        `
            <div class="dashboard-section" style="max-width: 650px; margin: 0 auto; width: 100%;">
                <div style="background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); padding: 30px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    
                    <!-- Avatar Simulado -->
                    <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #c6701d; color: white; display: flex; justify-content: center; align-items: center; font-size: 40px; font-weight: bold; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(198,112,29,0.3);">
                        ${fullName.charAt(0).toUpperCase()}
                    </div>
                    
                    <h2 style="margin: 0 0 5px 0; color: #2c1a0c; font-size: 1.5rem;">${fullName}</h2>
                    <p style="margin: 0 0 20px 0; color: #c6701d; background: #fdf3e7; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${roleLabel}</p>
                    
                    <!-- Detalles Personales (Grid 2 columnas) -->
                    <div style="width: 100%; border-top: 1px solid #eee; padding-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; text-align: left;">
                        
                        <div style="display: flex; align-items: center; background: #fafafa; padding: 12px 15px; border-radius: 8px;">
                            <i class="fas fa-envelope" style="width: 30px; color: #c6701d; font-size: 1.1rem;"></i>
                            <div style="display: flex; flex-direction: column; width: calc(100% - 30px);">
                                <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; font-weight:bold;">Correo</span>
                                <span style="color: #333; font-weight: 500; font-size: 0.9rem; word-break: break-all;">${currentUser.email}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; background: #fafafa; padding: 12px 15px; border-radius: 8px;">
                            <i class="fas fa-phone" style="width: 30px; color: #c6701d; font-size: 1.1rem;"></i>
                            <div style="display: flex; flex-direction: column; width: calc(100% - 30px);">
                                <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; font-weight:bold;">Teléfono</span>
                                <span style="color: #333; font-weight: 500; font-size: 0.9rem;">${tel}</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; background: #fafafa; padding: 12px 15px; border-radius: 8px;">
                            <i class="fas fa-map-marker-alt" style="width: 30px; color: #c6701d; font-size: 1.1rem;"></i>
                            <div style="display: flex; flex-direction: column; width: calc(100% - 30px);">
                                <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; font-weight:bold;">Ubicación</span>
                                <span style="color: #333; font-weight: 500; font-size: 0.9rem; word-break: break-word;">${ubicacion}</span>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; background: #fafafa; padding: 12px 15px; border-radius: 8px;">
                            <i class="fas fa-home" style="width: 30px; color: #c6701d; font-size: 1.1rem;"></i>
                            <div style="display: flex; flex-direction: column; width: calc(100% - 30px);">
                                <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; font-weight:bold;">Dirección local</span>
                                <span style="color: #333; font-weight: 500; font-size: 0.9rem; word-break: break-word;">${direccion}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles de Texto Largo (ej. Preferencias) y Estado -->
                    <div style="width: 100%; display: flex; flex-direction: column; gap: 15px; text-align: left; margin-top: 15px;">
                        
                        <div style="background: #fafafa; padding: 15px; border-radius: 8px;">
                            <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; font-weight:bold; display: block; margin-bottom: 5px;"><i class="fas fa-coffee" style="color:#c6701d; margin-right:5px;"></i> Descripción / Preferencias</span>
                            <span style="color: #444; font-size: 0.9rem; line-height: 1.5; display: block; padding-left: 15px; border-left: 3px solid #e0e0e0;">${prefs}</span>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; background: #fafafa; padding: 12px 15px; border-radius: 8px;">
                            <span style="color: #666; font-weight: 600; display:flex; align-items:center;"><i class="fas fa-user-check" style="width: 30px; color: #c6701d; font-size: 1.1rem;"></i> Estado de cuenta</span>
                            <span style="color: ${currentUser.is_active ? '#28a745' : '#dc3545'}; font-weight: bold; padding: 4px 12px; border-radius: 12px; background: ${currentUser.is_active ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)'}; font-size:0.85rem; letter-spacing: 0.5px;">
                                ${currentUser.is_active ? "VINCULADA" : "SUSPENDIDA"}
                            </span>
                        </div>

                    </div>
                    
                    <!-- Botones -->
                    <div style="width: 100%; display: flex; gap: 15px; margin-top: 25px; justify-content: center;">
                        <button id="editProfileBtn" class="dashboard-action-btn" style="background:#c6701d; color: white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <i class="fas fa-edit"></i> Editar Perfil
                        </button>
                    </div>

                </div>
            </div>
        `
    );

    const editProfileBtn = document.getElementById("editProfileBtn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            openSettings(); // Reutilizamos la función openSettings que ya tiene el formulario
        });
        editProfileBtn.addEventListener("mouseenter", () => editProfileBtn.style.transform = "translateY(-2px)");
        editProfileBtn.addEventListener("mouseleave", () => editProfileBtn.style.transform = "translateY(0)");
    }
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
        "Configuración del Perfil",
        `
            <div class="dashboard-section" style="max-width: 600px; margin: 0 auto; width: 100%;">
                <p style="text-align: center; color: #666; margin-bottom: 20px;">Actualiza los datos personales y de ubicación de tu cuenta.</p>
                <form id="settingsForm" class="settings-form">
                    <div style="display:flex;flex-direction:column;gap:15px; margin-top:16px;">
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Nombre de la cuenta / Empresa</label>
                            <input id="settingsName" type="text" value="${currentUser?.full_name || ""}" placeholder="Nombre completo" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Teléfono de contacto</label>
                            <input id="settingsPhone" type="text" value="${currentUser?.perfil_telefono || ""}" placeholder="Ej. 3001234567" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Departamento</label>
                                <input id="settingsState" type="text" value="${currentUser?.perfil_departamento || ""}" placeholder="Ej. Quindío" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                            
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Ciudad o Municipio</label>
                                <input id="settingsCity" type="text" value="${currentUser?.perfil_ciudad || ""}" placeholder="Ej. Armenia" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Dirección (Vereda, Finca, etc.)</label>
                            <input id="settingsAddress" type="text" value="${currentUser?.perfil_direccion || ""}" placeholder="Ej. Finca La Esperanza" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Preferencias o Descripción</label>
                            <textarea id="settingsPrefs" rows="3" placeholder="Descripción sobre procesos, perfil de taza..." style="padding:12px 14px;border:1px solid #ddd;border-radius:12px; resize:vertical;">${currentUser?.perfil_preferencias || ""}</textarea>
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:5px; margin-top: 10px;">
                            <label style="font-weight:600; color: #888;">Correo y Rol (Solo de lectura)</label>
                            <input disabled id="settingsEmail" type="email" value="${currentUser?.email || ""}" style="padding:10px;border:1px solid #eee;border-radius:8px; background:#fafafa; color:#888;" />
                            <input disabled type="text" value="${currentUser?.role || ""}" style="padding:10px;border:1px solid #eee;border-radius:8px; background:#fafafa; color:#888; text-transform: capitalize;" />
                        </div>

                    </div>
                    
                    <div style="margin-top:30px; display:flex; gap:15px; flex-wrap:wrap; align-items:center; justify-content: flex-end;">
                        <button id="dashboardLogoutBtn" type="button" class="dashboard-action-btn" style="background:#dc3545; color: white; border:none; padding:12px 20px; border-radius:8px; font-weight:600; cursor:pointer;">Cerrar sesión</button>
                        <button type="submit" id="dashboardSaveSettingsBtn" class="dashboard-action-btn" style="background:#c6701d; color: white; border:none; padding:12px 25px; border-radius:8px; font-weight:600; cursor:pointer;">Guardar cambios</button>
                    </div>
                </form>
            </div>
        `
    );

    const form = document.getElementById("settingsForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Creamos el payload limpiando los valores nulos/vacíos para evitar sobreescribir sin intención real
            const payload = {
                full_name: document.getElementById("settingsName").value || null,
                perfil_telefono: document.getElementById("settingsPhone").value || null,
                perfil_departamento: document.getElementById("settingsState").value || null,
                perfil_ciudad: document.getElementById("settingsCity").value || null,
                perfil_direccion: document.getElementById("settingsAddress").value || null,
                perfil_preferencias: document.getElementById("settingsPrefs").value || null,
            };

            const token = localStorage.getItem("access_token");
            try {
                // Endpoint correcto: /api/users/me (usando API_USERS_URL)
                const response = await fetch(`${API_CONFIG.API_USERS_URL}/me`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    
                    // Actualiza la variable global con los nuevos datos
                    currentUser = { ...currentUser, ...updatedUser }; 
                    userNameDisplay.textContent = currentUser.full_name || currentUser.email || "Mi perfil";
                    
                    alert("¡Perfil actualizado correctamente!");
                    openProfile(); // Regresa a "Mi perfil" para visualizar el cambio
                } else {
                    const errorJson = await response.json();
                    alert("Error guardando el perfil: " + (errorJson.detail || "Revise los campos"));
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("Ocurrió un error al contactar al servidor.");
            }
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

async function openMyProducts() {
    openDashboard(
        "Mis productos",
        `
            <div class="dashboard-section" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <div id="productsGrid" style="width: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 10px; margin-bottom: 30px;">
                    <p style="text-align: center; grid-column: 1 / -1;"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</p>
                </div>

                <div style="margin-top: 10px; display: flex; justify-content: center; position: sticky; bottom: 20px;">
                    <button class="add-product-btn" id="addProductBtn" style="background-color: #c6701d; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 28px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 6px 12px rgba(0,0,0,0.2); transition: transform 0.2s;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `
    );

    const addProductBtn = document.getElementById("addProductBtn");
    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            openAddProductModal();
        });
        addProductBtn.addEventListener("mouseenter", () => addProductBtn.style.transform = "scale(1.1)");
        addProductBtn.addEventListener("mouseleave", () => addProductBtn.style.transform = "scale(1)");
    }

    // Fetch y renderización de productos al cargar
    const token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/productos/mis`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const productsGrid = document.getElementById("productsGrid");
        
        if (response.ok) {
            const products = await response.json();
            
            if (products.length === 0) {
                productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 30px; background: #fafafa; border-radius: 12px; border: 1px dashed #ccc;">
                        <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 10px;"></i>
                        <p>No tienes productos registrados aún.</p>
                    </div>`;
            } else {
                productsGrid.innerHTML = products.map(p => `
                    <article style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; opacity: ${p.is_active ? '1' : '0.6'}; position: relative;">
                        ${!p.is_active ? '<div style="position:absolute; top:10px; right:10px; background:red; color:white; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold;">Inactivo</div>' : ''}
                        <section style="width: 100%; height: 160px; background: #e9ecef; display: flex; justify-content: center; align-items: center;">
                            <i class="fas fa-image" style="font-size: 3rem; color: #adb5bd;"></i>
                        </section>
                        <section style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1;">
                            <h3 style="margin: 0 0 10px 0; font-size: 1.2rem; color: #333;">${p.nombre}</h3>
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem; line-height: 1.4; flex-grow: 1;">${p.descripcion}</p>
                            <span style="font-size: 0.8rem; color: #888; margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> ${p.region} | Stock: ${p.stock}</span>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: bold; color: #c6701d; font-size: 1.1rem;">$${p.precio}</span>
                                <button class="dashboard-action-btn edit-product-btn" data-id="${p.id || p._id}" style="padding: 6px 12px; font-size: 0.85rem;">Editar</button>
                            </div>
                        </section>
                    </article>
                `).join('');
                
                // Los listeners de editar se pueden añadir aquí usando document.querySelectorAll('.edit-product-btn')
            }
        } else {
            productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: red;">No se pudieron cargar los productos.</div>`;
        }
    } catch (e) {
        document.getElementById("productsGrid").innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: red;">Error de conexión con el servidor.</div>`;
    }
}

function openAddProductModal() {
    openDashboard(
        "Agregar Nuevo Producto",
        `
            <div class="dashboard-section" style="max-width: 600px; margin: 0 auto; width: 100%;">
                <form id="addProductForm" class="settings-form">
                    <div style="display:flex;flex-direction:column;gap:15px;">
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Imagen del Producto</label>
                            <input type="file" id="prodImg" accept="image/*" style="padding:12px 14px;border:1px dashed #c6701d;border-radius:12px; background: #fafafa; cursor: pointer; color: #666;" />
                            <small style="color:#888;">Formatos soportados: JPG, PNG, WEBP.</small>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Nombre del Producto</label>
                            <input type="text" id="prodName" placeholder="Ej. Café Castilla Premium" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>
                        
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Descripción</label>
                            <textarea id="prodDesc" rows="4" placeholder="Describe las notas, tipo de tueste y origen..." required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px; resize: vertical; font-family: inherit;"></textarea>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Precio (COP)</label>
                                <input type="number" id="prodPrice" placeholder="Ej. 50000" min="1" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                            
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Stock Disponible</label>
                                <input type="number" id="prodStock" placeholder="Ej. 100" min="0" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Región de Origen</label>
                            <input type="text" id="prodRegion" placeholder="Ej. Quindío" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>
                    </div>
                    
                    <div style="margin-top:30px; display:flex; gap:15px; justify-content: flex-end;">
                        <button id="cancelAddProductBtn" type="button" class="dashboard-action-btn" style="background:#888; color: white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Cancelar</button>
                        <button type="submit" class="dashboard-action-btn" style="background:#c6701d; color: white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Guardar Producto</button>
                    </div>
                </form>
            </div>
        `
    );

    const cancelBtn = document.getElementById("cancelAddProductBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            openMyProducts();
        });
    }

    const form = document.getElementById("addProductForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const payload = {
                nombre: document.getElementById("prodName").value,
                descripcion: document.getElementById("prodDesc").value,
                precio: parseFloat(document.getElementById("prodPrice").value),
                stock: parseInt(document.getElementById("prodStock").value),
                region: document.getElementById("prodRegion").value
            };

            const token = localStorage.getItem("access_token");
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/productos/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("¡Producto guardado exitosamente!");
                    openMyProducts(); // Refresca la vista
                } else {
                    const err = await response.json();
                    alert("Error al guardar: " + (err.detail || "Datos inválidos"));
                }
            } catch (error) {
                console.error("Error creating product:", error);
                alert("Ocurrió un error al conectar con el servidor.");
            }
        });
    }
}

async function openMySales() {
    openDashboard(
        "Mis ventas",
        `
            <div class="sales-dashboard">
                <div class="sales-header-filters" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                    <button class="sales-tab active" style="flex:1; padding:10px; border-radius:8px; border:none; background:linear-gradient(135deg, #E2902D 0%, #d17e1f 100%); color:white; font-weight:600; cursor:pointer; min-width: 150px; font-family:'Poppins', sans-serif;">
                        <i class="fas fa-box-open"></i> Pedidos recibidos
                    </button>
                    <button class="sales-tab" style="flex:1; padding:10px; border-radius:8px; border:2px solid #E3E3E3; background:white; color:#4B2E2B; font-weight:600; cursor:pointer; min-width: 150px; transition: all 0.3s ease; font-family:'Poppins', sans-serif;">
                        <i class="fas fa-history"></i> Historial de ventas
                    </button>
                    <button class="sales-notifications" style="flex-basis: 100%; margin-top: 5px; padding:12px; border-radius:8px; border:2px solid #E3E3E3; background:#fff; color:#4B2E2B; font-weight:600; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: all 0.3s ease; font-family:'Poppins', sans-serif;">
                        <span><i class="fas fa-bell"></i> Notificaciones de nuevas órdenes</span>
                        <span style="background:linear-gradient(135deg, #E2902D 0%, #d17e1f 100%); color:white; border-radius:50%; padding:2px 8px; font-size:12px;">2</span>
                    </button>
                </div>
                
                <div class="sales-list" style="display:flex; flex-direction:column; gap:15px;">
                    <!-- Pedido 1 -->
                    <div class="sale-card" style="border: 2px solid #E3E3E3; border-radius: 12px; padding: 20px; background: #FFFFFF; transition: all 0.3s ease;">
                        <div class="sale-header" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #E3E3E3; padding-bottom:10px;">
                            <span style="font-weight:700; color:#4B2E2B; font-size:16px;">#ORD-0012</span>
                            <span style="color:#878787; font-size:13px; font-weight:500;">2 Abr 2026</span>
                        </div>
                        <div class="sale-body" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:space-between;">
                            <div class="sale-details" style="font-size:14px; color:#4B2E2B; flex:1; min-width:180px;">
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Comprador:</strong> Juan Perez</p>
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Productos vendidos:</strong> Café Arábico (x3)</p>
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Total:</strong> <span style="color:#E2902D; font-weight:700;">$ 150.000</span></p>
                            </div>
                            <div class="sale-status-group" style="display:flex; flex-direction:column; gap:8px; flex:1; min-width:150px;">
                                <label style="font-weight:600; font-size:13px; color:#4B2E2B;">Cambiar estado del pedido:</label>
                                <select class="sale-status-select" style="padding:10px; border:2px solid #E3E3E3; border-radius:8px; font-family:'Poppins', sans-serif; cursor:pointer; outline:none; color:#4B2E2B; transition: all 0.3s ease;">
                                    <option value="pendiente" selected>Pendiente</option>
                                    <option value="proceso">En proceso</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                </select>
                            </div>
                        </div>
                        <div class="sale-actions" style="margin-top:15px; display:flex; justify-content:flex-end;">
                            <button class="btn-detail" style="background:rgba(226, 144, 45, 0.1); border:none; color:#E2902D; padding:10px 18px; border-radius:20px; font-size:13px; font-weight:700; cursor:pointer; transition: all 0.3s ease; font-family:'Poppins', sans-serif;">
                                <i class="fas fa-eye"></i> Detalle del pedido
                            </button>
                        </div>
                    </div>

                    <!-- Pedido 2 -->
                    <div class="sale-card" style="border: 2px solid #E3E3E3; border-radius: 12px; padding: 20px; background: #FFFFFF; transition: all 0.3s ease;">
                        <div class="sale-header" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #E3E3E3; padding-bottom:10px;">
                            <span style="font-weight:700; color:#4B2E2B; font-size:16px;">#ORD-0011</span>
                            <span style="color:#878787; font-size:13px; font-weight:500;">1 Abr 2026</span>
                        </div>
                        <div class="sale-body" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:space-between;">
                            <div class="sale-details" style="font-size:14px; color:#4B2E2B; flex:1; min-width:180px;">
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Comprador:</strong> Café Export S.A.</p>
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Productos vendidos:</strong> Castilla (x10), Caturra (x5)</p>
                                <p style="margin:4px 0;"><strong style="font-weight:600;">Total:</strong> <span style="color:#E2902D; font-weight:700;">$ 950.000</span></p>
                            </div>
                            <div class="sale-status-group" style="display:flex; flex-direction:column; gap:8px; flex:1; min-width:150px;">
                                <label style="font-weight:600; font-size:13px; color:#4B2E2B;">Cambiar estado del pedido:</label>
                                <select class="sale-status-select" style="padding:10px; border:2px solid #E3E3E3; border-radius:8px; font-family:'Poppins', sans-serif; cursor:pointer; outline:none; color:#4B2E2B; transition: all 0.3s ease;">
                                    <option value="pendiente">Pendiente</option>
                                    <option value="proceso" selected>En proceso</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                </select>
                            </div>
                        </div>
                        <div class="sale-actions" style="margin-top:15px; display:flex; justify-content:flex-end;">
                            <button class="btn-detail" style="background:rgba(226, 144, 45, 0.1); border:none; color:#E2902D; padding:10px 18px; border-radius:20px; font-size:13px; font-weight:700; cursor:pointer; transition: all 0.3s ease; font-family:'Poppins', sans-serif;">
                                <i class="fas fa-eye"></i> Detalle del pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .sales-tab:hover, .sales-notifications:hover {
                    box-shadow: 0 4px 12px rgba(226,144,45, 0.15);
                    transform: translateY(-2px);
                    border-color: #E2902D !important;
                }
                .sale-card:hover {
                    box-shadow: 0 8px 25px rgba(226, 144, 45, 0.15);
                    border-color: #E2902D;
                    transform: translateY(-2px);
                }
                .btn-detail:hover {
                    background: linear-gradient(135deg, #E2902D 0%, #d17e1f 100%) !important;
                    color: white !important;
                    box-shadow: 0 4px 10px rgba(226,144,45, 0.3);
                }
                .sale-status-select:focus {
                    border-color: #E2902D !important;
                    box-shadow: 0 0 0 3px rgba(226, 144, 45, 0.1);
                }
            </style>
        `
    );
}

async function openMyStats() {
    openDashboard(
        "Métricas y Rendimiento",
        `
            <div class="stats-dashboard" style="display:flex; flex-direction:column; gap:25px;">
                
                <!-- KPI Cards -->
                <div class="stats-kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:15px;">
                    <div class="kpi-card" style="background:linear-gradient(135deg, #E2902D 0%, #d17e1f 100%); color:white; padding:20px; border-radius:12px; box-shadow:0 6px 15px rgba(226, 144, 45, 0.3); display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <i class="fas fa-shopping-cart" style="font-size:24px; margin-bottom:10px; opacity:0.9;"></i>
                        <span style="font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9;">Ventas Totales</span>
                        <span style="font-size:28px; font-weight:700; margin-top:5px; font-family:'Poppins', sans-serif;">248</span>
                    </div>

                    <div class="kpi-card" style="background:#FFFFFF; border:2px solid #E3E3E3; padding:20px; border-radius:12px; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#4B2E2B;">
                        <i class="fas fa-wallet" style="font-size:24px; color:#E2902D; margin-bottom:10px;"></i>
                        <span style="font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#878787;">Ingresos Generados</span>
                        <span style="font-size:24px; font-weight:700; margin-top:5px; font-family:'Poppins', sans-serif;">$12.5M</span>
                    </div>

                    <div class="kpi-card" style="background:#FFFFFF; border:2px solid #E3E3E3; padding:20px; border-radius:12px; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#4B2E2B;">
                        <i class="fas fa-star" style="font-size:24px; color:#f59e0b; margin-bottom:10px;"></i>
                        <span style="font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#878787;">Calificación Promedio</span>
                        <span style="font-size:28px; font-weight:700; margin-top:5px; font-family:'Poppins', sans-serif;">4.8 <span style="font-size:14px; color:#878787;">/5</span></span>
                    </div>
                </div>

                <!-- Graphic Placeholder (Ventas por día/mes) -->
                <div class="stats-chart-section" style="background:#FFFFFF; border:2px solid #E3E3E3; border-radius:12px; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                        <h3 style="margin:0; font-size:15px; color:#4B2E2B; font-weight:700;"><i class="fas fa-chart-line" style="color:#E2902D; margin-right:8px;"></i> Comportamiento de Ventas</h3>
                        <select style="padding:8px 14px; border:2px solid #E3E3E3; border-radius:8px; font-family:'Poppins', sans-serif; font-size:12px; font-weight:600; color:#4B2E2B; outline:none; cursor:pointer; background:transparent;">
                            <option>Último Mes</option>
                            <option>Últimos 6 Meses</option>
                            <option>Este Año</option>
                        </select>
                    </div>
                    
                    <!-- CSS Bar Chart (Visual Dummy) -->
                    <div style="display:flex; align-items:flex-end; gap:8px; height:150px; border-bottom:2px solid #f0f0f0; padding-bottom:5px; margin-top:10px;">
                        <div class="chart-bar" style="flex:1; background:rgba(226, 144, 45, 0.2); border-radius:6px 6px 0 0; height:35%; min-width:20px; transition: all 0.3s ease;"></div>
                        <div class="chart-bar" style="flex:1; background:rgba(226, 144, 45, 0.3); border-radius:6px 6px 0 0; height:50%; min-width:20px; transition: all 0.3s ease;"></div>
                        <div class="chart-bar" style="flex:1; background:rgba(226, 144, 45, 0.5); border-radius:6px 6px 0 0; height:20%; min-width:20px; transition: all 0.3s ease;"></div>
                        <div class="chart-bar" style="flex:1; background:rgba(226, 144, 45, 0.7); border-radius:6px 6px 0 0; height:80%; min-width:20px; transition: all 0.3s ease;"></div>
                        <div class="chart-active-bar" style="flex:1; background:linear-gradient(0deg, #E2902D 0%, #d17e1f 100%); border-radius:6px 6px 0 0; height:100%; min-width:20px; position:relative; box-shadow:0 -4px 10px rgba(226, 144, 45, 0.3);"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#878787; font-weight:600; margin-top:8px; padding:0 5px;">
                        <span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span><span style="color:#E2902D;">Actual</span>
                    </div>
                </div>

                <!-- Products Split View -->
                <div class="stats-products-split" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
                    
                    <!-- Más vendidos -->
                    <div class="stats-top-products" style="background:#FFFFFF; border:2px solid #E3E3E3; border-radius:12px; padding:20px;">
                        <h3 style="margin:0 0 15px 0; font-size:15px; color:#4B2E2B; font-weight:700;"><i class="fas fa-fire" style="color:#ef4444; margin-right:8px;"></i> Productos más vendidos</h3>
                        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px;">
                            <li style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="background:rgba(226,144,45,0.1); color:#E2902D; width:28px; height:28px; display:flex; justify-content:center; align-items:center; border-radius:50%; font-weight:700; font-size:13px;">1</div>
                                    <span style="font-size:13px; color:#4B2E2B; font-weight:600;">Café Arábico Especial</span>
                                </div>
                                <span style="font-size:12px; font-weight:700; color:#878787;">120 und.</span>
                            </li>
                            <li style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="background:#f0f0f0; color:#878787; width:28px; height:28px; display:flex; justify-content:center; align-items:center; border-radius:50%; font-weight:700; font-size:13px;">2</div>
                                    <span style="font-size:13px; color:#4B2E2B; font-weight:600;">Caturra Tostado Medio</span>
                                </div>
                                <span style="font-size:12px; font-weight:700; color:#878787;">85 und.</span>
                            </li>
                            <li style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="background:#f0f0f0; color:#878787; width:28px; height:28px; display:flex; justify-content:center; align-items:center; border-radius:50%; font-weight:700; font-size:13px;">3</div>
                                    <span style="font-size:13px; color:#4B2E2B; font-weight:600;">Castilla Exportación</span>
                                </div>
                                <span style="font-size:12px; font-weight:700; color:#878787;">43 und.</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Sin movimiento -->
                    <div class="stats-dead-products" style="background:#FFFFFF; border:2px solid #E3E3E3; border-radius:12px; padding:20px;">
                        <h3 style="margin:0 0 5px 0; font-size:15px; color:#4B2E2B; font-weight:700;"><i class="fas fa-exclamation-circle" style="color:#E2902D; margin-right:8px;"></i> Productos sin rotación</h3>
                        <p style="font-size:12px; color:#878787; margin-bottom:15px; line-height:1.4;">Lotes que no han registrado ventas recientemente.</p>
                        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;">
                            <li style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:#fff4e1; border-radius:8px; border-left:4px solid #E2902D;">
                                <span style="font-size:13px; color:#4B2E2B; font-weight:600;">Café Borbón - Lote A</span>
                                <span style="font-size:11px; font-weight:700; background:#E2902D; color:white; padding:3px 8px; border-radius:12px;">+60 días</span>
                            </li>
                            <li style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:#f9f9f9; border-radius:8px; border-left:4px solid #dcdcdc;">
                                <span style="font-size:13px; color:#4B2E2B; font-weight:600;">Libérica Verde 5kg</span>
                                <span style="font-size:11px; font-weight:600; color:#878787;"><i class="fas fa-clock"></i> 32 días</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
            
            <style>
                .kpi-card {
                    transition: all 0.3s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
                    border-color: rgba(226, 144, 45, 0.3);
                }
                .chart-bar:hover {
                    opacity: 0.8;
                    cursor: pointer;
                }
            </style>
        `
    );
}
