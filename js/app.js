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
const navToggleBtn = document.getElementById("navToggleBtn")
const primaryNav = document.getElementById("primaryNav")
const dashboardPanel = document.getElementById("dashboardPanel")
const dashboardTitle = document.getElementById("dashboardTitle")
const dashboardBody = document.getElementById("dashboardBody")
const closeDashboardBtn = document.getElementById("closeDashboardBtn")
const cartBtn = document.getElementById("cartBtn")

let currentUser = null

function showAppToast(message, kind = "info", timeoutMs = 3200) {
    const body = document.body
    if (!body) return

    let host = document.getElementById("appToastHost")
    if (!host) {
        host = document.createElement("div")
        host.id = "appToastHost"
        host.style.cssText = "position:fixed;top:18px;right:18px;z-index:100000;display:flex;flex-direction:column;gap:10px;max-width:min(92vw,380px);"
        body.appendChild(host)
    }

    const toast = document.createElement("div")
    const palette = {
        info: { bg: "#ffffff", border: "#e6c9a6", color: "#4B2E2B" },
        success: { bg: "#effcf4", border: "#81d4a1", color: "#0f5c2b" },
        error: { bg: "#fff1f1", border: "#f0a7a7", color: "#8e1f1f" },
    }
    const theme = palette[kind] || palette.info
    toast.style.cssText = `border:1px solid ${theme.border};background:${theme.bg};color:${theme.color};padding:12px 14px;border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,.12);font-size:0.92rem;line-height:1.35;opacity:0;transform:translateY(-6px);transition:opacity .2s ease, transform .2s ease;`
    toast.textContent = String(message || "")
    host.appendChild(toast)

    requestAnimationFrame(() => {
        toast.style.opacity = "1"
        toast.style.transform = "translateY(0)"
    })

    window.setTimeout(() => {
        toast.style.opacity = "0"
        toast.style.transform = "translateY(-6px)"
        window.setTimeout(() => toast.remove(), 220)
    }, timeoutMs)
}

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

// Menú principal (móvil)
function closePrimaryNav() {
    if (!primaryNav || !navToggleBtn) return
    primaryNav.classList.remove("is-open")
    navToggleBtn.setAttribute("aria-expanded", "false")
}

function togglePrimaryNav() {
    if (!primaryNav || !navToggleBtn) return
    const isOpen = primaryNav.classList.toggle("is-open")
    navToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false")
}

if (navToggleBtn && primaryNav) {
    navToggleBtn.addEventListener("click", (event) => {
        event.stopPropagation()
        togglePrimaryNav()
    })

    primaryNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closePrimaryNav())
    })

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) {
            closePrimaryNav()
        }
    })
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
                showAppToast("Inicio de sesión exitoso");
                modal.classList.remove("active");
                loginForm.reset();
            } else {
                showAppToast("Inicio de sesión falló al obtener el perfil. Por favor vuelve a intentarlo.");
            }
        } else {
            const error = await response.json();
            showAppToast(`Error: ${error.detail || "Credenciales incorrectas"}`);
        }
    } catch (error) {
        console.error("Error en login:", error);
        showAppToast("Ocurrió un error al intentar iniciar sesión. Verifica que el servidor esté corriendo.");
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
            showAppToast("Registro exitoso. Ahora puedes iniciar sesión.");
            registerForm.reset();
            // Switch to login tab
            registerContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        } else {
            const error = await response.json();
            showAppToast(`Error en el registro: ${JSON.stringify(error.detail) || "Datos inválidos"}`);
        }
    } catch (error) {
        console.error("Error en registro:", error);
        showAppToast("Ocurrió un error al intentar registrarse. Verifica que el servidor esté corriendo.");
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
            showAppToast(responseData.message || "Se ha enviado un enlace de recuperación a tu correo electrónico.");
            recoveryForm.reset();
            recoveryContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        } else {
            const errorData = await response.json();
            showAppToast(errorData.message || "No se pudo procesar la solicitud. Intenta más tarde.");
        }
    } catch (error) {
        console.error("Error en recuperación:", error);
        showAppToast("Ocurrió un error. Por favor, intenta de nuevo.");
    }
});

// Botón Mostrar Más Productos (oculto por ahora)
const showMoreBtn = document.getElementById("showMoreBtn");

const catalogFiltersForm = document.getElementById("catalogFiltersForm")
const clearCatalogFiltersBtn = document.getElementById("clearCatalogFiltersBtn")
const filterSort = document.getElementById("filterSort")
const catalogResults = document.getElementById("catalogResults")
const catalogStatus = document.getElementById("catalogStatus")
const catalogPrevBtn = document.getElementById("catalogPrevBtn")
const catalogNextBtn = document.getElementById("catalogNextBtn")
const catalogPageInfo = document.getElementById("catalogPageInfo")

const catalogState = {
    page: 1,
    limit: 8,
    total: 0,
    requestId: 0,
}

function formatCop(value) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(value)
}

function setCatalogStatus(message, kind = "info") {
    if (!catalogStatus) return
    catalogStatus.textContent = message
    catalogStatus.classList.remove("hidden", "is-error", "is-success")
    if (kind === "error") catalogStatus.classList.add("is-error")
    if (kind === "success") catalogStatus.classList.add("is-success")
}

// Caché de productos del catálogo cargados actualmente (id → objeto completo)
const catalogItemsCache = new Map()

function getCatalogFilters() {
    return {
        q: document.getElementById("filterQ")?.value?.trim() || "",
        region: document.getElementById("filterRegion")?.value?.trim() || "",
        minPrecio: document.getElementById("filterMinPrecio")?.value?.trim() || "",
        maxPrecio: document.getElementById("filterMaxPrecio")?.value?.trim() || "",
        sort: filterSort?.value || "recientes",
    }
}

function buildCatalogUrl() {
    const filters = getCatalogFilters()
    const params = new URLSearchParams()

    if (filters.q) params.append("q", filters.q)
    if (filters.region) params.append("region", filters.region)
    if (filters.minPrecio) params.append("minPrecio", filters.minPrecio)
    if (filters.maxPrecio) params.append("maxPrecio", filters.maxPrecio)
    params.append("sort", filters.sort)
    params.append("page", String(catalogState.page))
    params.append("limit", String(catalogState.limit))

    return `${API_CONFIG.BASE_URL}/api/productos?${params.toString()}`
}

function renderCatalogItems(items) {
    if (!catalogResults) return
    catalogItemsCache.clear()
    items.forEach(p => catalogItemsCache.set(p._id, p))
    catalogResults.innerHTML = items.map((product) => {
        const imgUrl = product.urls_imagenes && product.urls_imagenes.length > 0
            ? product.urls_imagenes[0]
            : null
        const imgHtml = imgUrl
            ? `<img src="${imgUrl}" alt="${product.nombre}" class="catalog-card-img" />`
            : `<div class="catalog-card-img-placeholder"><i class="fas fa-image"></i></div>`
        return `
        <article class="catalog-card">
            <section class="catalog-card-image">
                ${imgHtml}
            </section>
            <section class="catalog-card-header">
                <p class="catalog-region">${product.region || product.origen || "Sin región"}</p>
                <p class="catalog-stock">Stock: ${product.stock ?? 0}</p>
            </section>
            <section class="catalog-card-body">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion || "Sin descripción"}</p>
            </section>
            <section class="catalog-card-footer">
                <span class="catalog-price">${formatCop(Number(product.precio || 0))}</span>
                <div class="catalog-card-actions">
                    <button type="button" class="catalog-detail-btn" data-product-id="${product._id}">
                        <i class="fas fa-eye"></i> Ver detalle
                    </button>
                    <button type="button" class="btn-comprar catalog-add-btn" data-product-id="${product._id}">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </section>
        </article>
    `}).join("")
}

function updateCatalogPagination() {
    if (!catalogPageInfo || !catalogPrevBtn || !catalogNextBtn) return
    const totalPages = Math.max(1, Math.ceil(catalogState.total / catalogState.limit))
    catalogPageInfo.textContent = `Página ${catalogState.page} de ${totalPages}`
    catalogPrevBtn.disabled = catalogState.page <= 1
    catalogNextBtn.disabled = catalogState.page >= totalPages
}

async function addToCartFromCatalog(productId) {
    const token = localStorage.getItem("access_token")
    if (!token) {
        showAppToast("Debes iniciar sesión como comprador para agregar productos al carrito.")
        return
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/carrito/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, cantidad: 1 }),
        })

        if (response.ok) {
            setCatalogStatus("Producto agregado al carrito.", "success")
            return
        }

        const err = await response.json().catch(() => ({}))
        if (response.status === 401) {
            setCatalogStatus("Tu sesión no es válida. Inicia sesión nuevamente.", "error")
            return
        }
        if (response.status === 403) {
            setCatalogStatus("Solo usuarios con rol comprador pueden usar el carrito.", "error")
            return
        }
        if (response.status === 404) {
            setCatalogStatus(err.detail || "Producto no encontrado.", "error")
            return
        }
        setCatalogStatus(err.detail || "No fue posible agregar el producto al carrito.", "error")
    } catch (error) {
        console.error("Error agregando al carrito:", error)
        setCatalogStatus("Error de conexión al agregar al carrito.", "error")
    }
}

async function loadCatalog({ resetPage = false } = {}) {
    if (!catalogResults || !catalogStatus) return
    if (resetPage) catalogState.page = 1

    const filters = getCatalogFilters()
    const minPrecio = filters.minPrecio ? Number(filters.minPrecio) : null
    const maxPrecio = filters.maxPrecio ? Number(filters.maxPrecio) : null
    if (minPrecio !== null && maxPrecio !== null && minPrecio > maxPrecio) {
        catalogResults.innerHTML = ""
        setCatalogStatus("minPrecio no puede ser mayor que maxPrecio.", "error")
        catalogState.total = 0
        updateCatalogPagination()
        return
    }

    const currentRequestId = ++catalogState.requestId
    setCatalogStatus("Cargando catálogo...")
    catalogResults.innerHTML = ""

    try {
        const response = await fetch(buildCatalogUrl())
        if (currentRequestId !== catalogState.requestId) return

        if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            setCatalogStatus(err.detail || "No se pudo cargar el catálogo.", "error")
            catalogState.total = 0
            updateCatalogPagination()
            return
        }

        const data = await response.json()
        const items = Array.isArray(data.items) ? data.items : []
        catalogState.total = Number(data.total || 0)
        catalogState.page = Number(data.page || catalogState.page)
        catalogState.limit = Number(data.limit || catalogState.limit)

        if (!items.length) {
            catalogResults.innerHTML = ""
            setCatalogStatus("No se encontraron productos con los filtros seleccionados.")
            updateCatalogPagination()
            return
        }

        renderCatalogItems(items)
        catalogStatus.classList.add("hidden")
        updateCatalogPagination()
    } catch (error) {
        if (currentRequestId !== catalogState.requestId) return
        console.error("Error cargando catálogo:", error)
        catalogResults.innerHTML = ""
        catalogState.total = 0
        setCatalogStatus("Error de conexión al cargar catálogo.", "error")
        updateCatalogPagination()
    }
}

if (catalogFiltersForm) {
    catalogFiltersForm.addEventListener("submit", async (event) => {
        event.preventDefault()
        await loadCatalog({ resetPage: true })
    })
}

if (clearCatalogFiltersBtn) {
    clearCatalogFiltersBtn.addEventListener("click", async () => {
        if (!catalogFiltersForm) return
        catalogFiltersForm.reset()
        if (filterSort) filterSort.value = "recientes"
        await loadCatalog({ resetPage: true })
    })
}

if (filterSort) {
    filterSort.addEventListener("change", async () => {
        await loadCatalog({ resetPage: true })
    })
}

if (catalogPrevBtn) {
    catalogPrevBtn.addEventListener("click", async () => {
        if (catalogState.page <= 1) return
        catalogState.page -= 1
        await loadCatalog()
    })
}

if (catalogNextBtn) {
    catalogNextBtn.addEventListener("click", async () => {
        const totalPages = Math.max(1, Math.ceil(catalogState.total / catalogState.limit))
        if (catalogState.page >= totalPages) return
        catalogState.page += 1
        await loadCatalog()
    })
}

if (catalogResults) {
    catalogResults.addEventListener("click", async (event) => {
        const target = event.target
        if (!(target instanceof Element)) return

        const detailBtn = target.closest(".catalog-detail-btn")
        if (detailBtn) {
            const productId = detailBtn.dataset.productId
            const product   = catalogItemsCache.get(productId)
            if (product) await openProductDetail(product)
            return
        }

        const addBtn = target.closest(".catalog-add-btn")
        if (!addBtn) return
        const productId = addBtn.dataset.productId
        if (!productId) return
        await addToCartFromCatalog(productId)
    })
}

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
            { label: "Mis pedidos", action: openMyOrders },
            { label: "Mis reseñas", action: openMyReviews },
            { label: "Soporte / PQR", action: openMyPQR },
            ...common,
        ];
    }

    if (role === "admin") {
        return [
            { label: "Gestión de usuarios", action: () => openPlaceholder("Gestión de usuarios", "Administra cuentas de usuario desde aquí." ) },
            { label: "Gestión de productos", action: () => openPlaceholder("Gestión de productos", "Administra el catálogo de productos desde aquí." ) },
            { label: "Reportes del sistema", action: () => openPlaceholder("Reportes del sistema", "Consulta reportes e indicadores del sistema." ) },
            { label: "Gestión PQR", action: openAdminPQR },
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

async function openBuyerCart() {
    if (!currentUser || currentUser.role !== "comprador") {
        openPlaceholder("Mi carrito", "Solo los usuarios comprador pueden gestionar carrito y órdenes.")
        return
    }

    openDashboard(
        "Mi carrito",
        `
            <div class="buyer-cart-panel" id="buyerCartPanel">
                <div class="buyer-cart-status" id="buyerCartStatus">Cargando carrito...</div>
                <div class="buyer-cart-list" id="buyerCartList"></div>
                <div class="buyer-cart-summary" id="buyerCartSummary">
                    <p class="buyer-cart-total-label">Total</p>
                    <p class="buyer-cart-total-value" id="buyerCartTotal">$0</p>
                    <button type="button" class="dashboard-action-btn" id="buyerCartOrderBtn">Confirmar orden</button>
                </div>
            </div>
        `
    )

    const token = localStorage.getItem("access_token")
    const panel = document.getElementById("buyerCartPanel")
    const statusEl = document.getElementById("buyerCartStatus")
    const listEl = document.getElementById("buyerCartList")
    const totalEl = document.getElementById("buyerCartTotal")
    const orderBtn = document.getElementById("buyerCartOrderBtn")
    let inFlight = false

    if (!panel || !statusEl || !listEl || !totalEl || !orderBtn) return

    if (!token) {
        statusEl.textContent = "No hay sesión activa. Inicia sesión para usar el carrito."
        statusEl.classList.add("is-error")
        orderBtn.disabled = true
        return
    }

    function setCartStatus(message, kind = "info") {
        statusEl.textContent = message
        statusEl.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error") statusEl.classList.add("is-error")
        if (kind === "success") statusEl.classList.add("is-success")
    }

    function hideCartStatus() {
        statusEl.classList.add("hidden")
        statusEl.classList.remove("is-error", "is-success")
    }

    function renderCart(cart) {
        const items = Array.isArray(cart.items) ? cart.items : []
        if (!items.length) {
            listEl.innerHTML = `
                <article class="buyer-cart-empty">
                    <p>Tu carrito está vacío.</p>
                    <p>Agrega productos desde el catálogo para crear una orden.</p>
                </article>
            `
            totalEl.textContent = formatCop(0)
            orderBtn.disabled = true
            return
        }

        listEl.innerHTML = items.map((item) => {
            const canDecrease = Number(item.cantidad) > 1
            const nextDown = canDecrease ? Number(item.cantidad) - 1 : 1
            const nextUp = Number(item.cantidad) + 1
            return `
                <article class="buyer-cart-item">
                    <div class="buyer-cart-item-main">
                        <h3>${item.nombre}</h3>
                        <p>Precio: ${formatCop(Number(item.precioSnapshot || 0))}</p>
                        <p>Subtotal: ${formatCop(Number(item.subtotal || 0))}</p>
                    </div>
                    <div class="buyer-cart-item-actions">
                        <div class="buyer-cart-qty">
                            <button type="button" data-action="decrease" data-product-id="${item.productId}" data-next-qty="${nextDown}" ${canDecrease ? "" : "disabled"}>-</button>
                            <span>${item.cantidad}</span>
                            <button type="button" data-action="increase" data-product-id="${item.productId}" data-next-qty="${nextUp}">+</button>
                        </div>
                        <button type="button" class="buyer-cart-remove-btn" data-action="remove" data-product-id="${item.productId}">
                            Remover
                        </button>
                    </div>
                </article>
            `
        }).join("")

        totalEl.textContent = formatCop(Number(cart.total || 0))
        orderBtn.disabled = false
    }

    async function authRequest(path, { method = "GET", body = null } = {}) {
        const headers = { Authorization: `Bearer ${token}` }
        const options = { method, headers }
        if (body !== null) {
            headers["Content-Type"] = "application/json"
            options.body = JSON.stringify(body)
        }
        return fetch(`${API_CONFIG.BASE_URL}${path}`, options)
    }

    async function loadCart({ message = "", kind = "info", force = false } = {}) {
        if (inFlight && !force) return
        inFlight = true
        setCartStatus("Cargando carrito...")
        orderBtn.disabled = true

        try {
            const response = await authRequest("/api/carrito")
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    setCartStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
                } else if (response.status === 403) {
                    setCartStatus("Tu usuario no tiene permisos para carrito.", "error")
                } else {
                    setCartStatus(err.detail || "No fue posible cargar el carrito.", "error")
                }
                listEl.innerHTML = ""
                totalEl.textContent = formatCop(0)
                orderBtn.disabled = true
                return
            }

            const cart = await response.json()
            renderCart(cart)
            if (message) {
                setCartStatus(message, kind)
            } else {
                hideCartStatus()
            }
        } catch (error) {
            console.error("Error cargando carrito:", error)
            listEl.innerHTML = ""
            totalEl.textContent = formatCop(0)
            setCartStatus("Error de conexión al cargar carrito.", "error")
            orderBtn.disabled = true
        } finally {
            inFlight = false
        }
    }

    panel.addEventListener("click", async (event) => {
        const target = event.target
        if (!(target instanceof Element)) return

        const actionBtn = target.closest("[data-action]")
        if (!actionBtn || inFlight) return

        const action = actionBtn.dataset.action
        const productId = actionBtn.dataset.productId
        if (!action || !productId) return

        try {
            inFlight = true
            setCartStatus("Actualizando carrito...")
            let response

            if (action === "remove") {
                response = await authRequest(`/api/carrito/items/${encodeURIComponent(productId)}`, {
                    method: "DELETE",
                })
            } else if (action === "increase" || action === "decrease") {
                const nextQty = Number(actionBtn.dataset.nextQty || 1)
                response = await authRequest(`/api/carrito/items/${encodeURIComponent(productId)}`, {
                    method: "PUT",
                    body: { cantidad: Math.max(1, nextQty) },
                })
            } else {
                return
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    setCartStatus("Sesión no válida. Inicia sesión nuevamente.", "error")
                } else if (response.status === 404) {
                    setCartStatus(err.detail || "Producto no encontrado en carrito.", "error")
                } else if (response.status === 422) {
                    setCartStatus(err.detail || "Cantidad inválida para el carrito.", "error")
                } else {
                    setCartStatus(err.detail || "No fue posible actualizar el carrito.", "error")
                }
                return
            }

            const updatedCart = await response.json()
            renderCart(updatedCart)
            setCartStatus("Carrito actualizado.", "success")
        } catch (error) {
            console.error("Error actualizando carrito:", error)
            setCartStatus("Error de conexión al actualizar carrito.", "error")
        } finally {
            inFlight = false
        }
    })

    orderBtn.addEventListener("click", async () => {
        if (inFlight) return
        try {
            inFlight = true
            orderBtn.disabled = true
            setCartStatus("Creando orden...")

            const response = await authRequest("/api/ordenes", { method: "POST" })
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    setCartStatus("Sesión no válida. Inicia sesión nuevamente.", "error")
                } else if (response.status === 403) {
                    setCartStatus("Tu usuario no tiene permisos para crear órdenes.", "error")
                } else if (response.status === 409) {
                    setCartStatus(err.detail || "Stock insuficiente para completar la orden.", "error")
                } else if (response.status === 422) {
                    setCartStatus(err.detail || "No se puede crear la orden con el carrito actual.", "error")
                } else {
                    setCartStatus(err.detail || "No fue posible crear la orden.", "error")
                }
                return
            }

            const order = await response.json()
            await loadCart({
                message: `Orden creada: ${order._id || order.id}. Estado: ${order.estado}.`,
                kind: "success",
                force: true,
            })
        } catch (error) {
            console.error("Error creando orden:", error)
            setCartStatus("Error de conexión al crear la orden.", "error")
        } finally {
            inFlight = false
            orderBtn.disabled = false
        }
    })

    await loadCart()
}

// ── Handler redirect PayU sandbox ──────────────────────────────
async function handlePayuRedirectIfPresent() {
    const params = new URLSearchParams(window.location.search)
    const transactionState = params.get("transactionState")
    if (!transactionState) return

    // Limpiar params de la URL sin recargar
    const cleanUrl = window.location.pathname
    window.history.replaceState({}, "", cleanUrl)

    const referenceCode = params.get("referenceCode") || ""
    const orderId       = params.get("extra1") || ""
    const txValue       = params.get("TX_VALUE") || "0"
    const currency      = params.get("currency") || "COP"
    const message       = params.get("message") || ""

    // Esperar a que el usuario esté autenticado (applyAuthenticatedState puede ser async)
    await new Promise(r => setTimeout(r, 800))

    const token = localStorage.getItem("access_token")
    if (!token || !orderId || !referenceCode) return

    // Registrar el resultado en el backend
    try {
        await fetch(`${API_CONFIG.BASE_URL}/api/pagos/confirmar-redireccion`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ transactionState, referenceCode, orderId, TX_VALUE: txValue, currency }),
        })
    } catch (e) {
        console.error("Error confirmando redirect PayU:", e)
    }

    // Mostrar resultado al usuario
    const stateMap = { "4": "approved", "6": "rejected", "5": "rejected", "104": "rejected", "7": "pending" }
    const kind = stateMap[transactionState] || "pending"
    const title = kind === "approved" ? "¡Pago aprobado!" : kind === "rejected" ? "Pago rechazado" : "Pago en revisión"
    const detail = kind === "approved"
        ? "Tu orden ha sido confirmada. Puedes ver el estado en <b>Mis pedidos</b>."
        : kind === "rejected"
        ? `El pago no fue procesado. ${message || "Intenta nuevamente."}`
        : "El pago está en revisión. Recibirás confirmación pronto."

    openDashboard(title, `
        <div style="max-width:480px;margin:0 auto;text-align:center;padding:32px 16px;">
            <div style="font-size:3.5rem;margin-bottom:16px;">
                ${kind === "approved" ? "✅" : kind === "rejected" ? "❌" : "⏳"}
            </div>
            <h2 style="color:${kind === "approved" ? "#0f5c2b" : kind === "rejected" ? "#8e2d1c" : "#7a4800"};margin-bottom:12px;">${title}</h2>
            <p style="color:#555;line-height:1.6;">${detail}</p>
            <p style="font-size:0.8rem;color:#aaa;margin-top:8px;">Ref: ${referenceCode}</p>
            <button type="button" class="dashboard-action-btn" id="payuResultBtn"
                    style="margin-top:24px;background:#c6701d;color:white;width:100%;justify-content:center;">
                Ver mis pedidos
            </button>
        </div>
    `)
    document.getElementById("payuResultBtn")?.addEventListener("click", openMyOrders)
}

// ── Helpers de órdenes ─────────────────────────────────────────
const ORDER_ESTADO_MAP = {
    PENDIENTE_PAGO:  { label: "Pendiente de pago", color: "#7a4800", bg: "#fdf3e7" },
    PAGADA:          { label: "Pagada",             color: "#0f5c2b", bg: "#effcf4" },
    PAGO_FALLIDO:    { label: "Pago fallido",       color: "#8e2d1c", bg: "#fff2ef" },
    EN_PREPARACION:  { label: "En preparación",     color: "#1a5c8e", bg: "#e8f4ff" },
    ENVIADA:         { label: "Enviada",             color: "#5b2d8e", bg: "#f3e8ff" },
    ENTREGADA:       { label: "Entregada",           color: "#0f5c2b", bg: "#d4f5e2" },
    CANCELADA:       { label: "Cancelada",           color: "#555",    bg: "#f0f0f0" },
}

function estadoBadge(estado) {
    const e = ORDER_ESTADO_MAP[estado] || { label: estado, color: "#555", bg: "#f0f0f0" }
    return `<span class="order-estado-badge" style="color:${e.color};background:${e.bg};">${e.label}</span>`
}

function makeOrderAuthFetch(token) {
    return function authFetch(path, opts = {}) {
        const headers = { Authorization: `Bearer ${token}` }
        const options = { method: opts.method || "GET", headers }
        if (opts.body) {
            headers["Content-Type"] = "application/json"
            options.body = JSON.stringify(opts.body)
        }
        return fetch(`${API_CONFIG.BASE_URL}${path}`, options)
    }
}

// ── Mis pedidos (lista) ─────────────────────────────────────────
async function openMyOrders() {
    if (!currentUser || currentUser.role !== "comprador") {
        openPlaceholder("Mis pedidos", "Solo los compradores pueden ver sus pedidos.")
        return
    }

    openDashboard("Mis pedidos", `
        <div class="my-orders-panel" id="myOrdersPanel">
            <div class="buyer-cart-status" id="myOrdersStatus">Cargando pedidos...</div>
            <div class="my-orders-list" id="myOrdersList"></div>
        </div>
    `)

    const token = localStorage.getItem("access_token")
    const statusEl = document.getElementById("myOrdersStatus")
    const listEl   = document.getElementById("myOrdersList")
    const authFetch = makeOrderAuthFetch(token)

    function setStatus(msg, kind = "info") {
        statusEl.textContent = msg
        statusEl.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   statusEl.classList.add("is-error")
        if (kind === "success") statusEl.classList.add("is-success")
    }

    try {
        const res = await authFetch("/api/ordenes/mias")
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            if      (res.status === 401) setStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
            else if (res.status === 403) setStatus("No tienes permiso para ver pedidos.", "error")
            else                         setStatus(err.detail || "No fue posible cargar los pedidos.", "error")
            return
        }

        const orders = await res.json()
        statusEl.classList.add("hidden")

        if (!orders.length) {
            listEl.innerHTML = `
                <div class="my-orders-empty">
                    <i class="fas fa-box-open"></i>
                    <p>No tienes pedidos aún.</p>
                    <p>¡Explora el catálogo y realiza tu primer pedido!</p>
                </div>`
            return
        }

        listEl.innerHTML = orders.map(order => `
            <article class="my-order-card" data-order-id="${order._id}">
                <div class="my-order-card-header">
                    <div>
                        <p class="my-order-id">Pedido #${order._id.slice(-6).toUpperCase()}</p>
                        <p class="my-order-date">${new Date(order.createdAt).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" })}</p>
                    </div>
                    ${estadoBadge(order.estado)}
                </div>
                <p class="my-order-items-preview">
                    ${order.items.map(i => `${i.nombreSnapshot} × ${i.cantidad}`).join(" · ")}
                </p>
                <div class="my-order-card-footer">
                    <span class="my-order-total">${formatCop(Number(order.total || 0))}</span>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button type="button" class="dashboard-action-btn my-order-detail-btn"
                                style="padding:8px 16px;font-size:0.85rem;">
                            Ver detalle
                        </button>
                        ${order.estado === "PENDIENTE_PAGO" ? `
                        <button type="button" class="dashboard-action-btn my-order-delete-btn"
                                style="padding:8px 16px;font-size:0.85rem;background:#8e2d1c;color:white;">
                            Eliminar
                        </button>` : ""}
                    </div>
                </div>
            </article>
        `).join("")

        listEl.querySelectorAll(".my-order-detail-btn").forEach(btn => {
            const orderId = btn.closest("[data-order-id]").dataset.orderId
            const order   = orders.find(o => o._id === orderId)
            btn.addEventListener("click", () => openOrderDetail(order, authFetch))
        })

        listEl.querySelectorAll(".my-order-delete-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const card = btn.closest("[data-order-id]")
                const orderId = card?.dataset.orderId
                if (!orderId) return

                const confirmed = confirm("¿Deseas eliminar este pedido pendiente de pago?")
                if (!confirmed) return

                btn.disabled = true
                try {
                    const res = await authFetch(`/api/ordenes/${orderId}`, { method: "DELETE" })
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}))
                        if (res.status === 409) setStatus(err.detail || "Solo se pueden eliminar pedidos pendientes de pago.", "error")
                        else if (res.status === 403) setStatus("No tienes permiso para eliminar este pedido.", "error")
                        else if (res.status === 404) setStatus("Pedido no encontrado.", "error")
                        else setStatus(err.detail || "No fue posible eliminar el pedido.", "error")
                        btn.disabled = false
                        return
                    }

                    setStatus("Pedido eliminado correctamente.", "success")
                    await openMyOrders()
                } catch (e) {
                    console.error("Error eliminando pedido:", e)
                    setStatus("Error de conexión al eliminar el pedido.", "error")
                    btn.disabled = false
                }
            })
        })

    } catch (e) {
        console.error("Error cargando pedidos:", e)
        setStatus("Error de conexión al cargar los pedidos.", "error")
    }
}

// ── Detalle de pedido + flujo de pago ──────────────────────────
async function openOrderDetail(order, authFetch) {
    const token = localStorage.getItem("access_token")
    const fetchFn = authFetch || makeOrderAuthFetch(token)
    const isPending = order.estado === "PENDIENTE_PAGO"

    openDashboard(
        `Pedido #${order._id.slice(-6).toUpperCase()}`,
        `
        <div class="my-order-detail" id="orderDetailPanel">
            <button type="button" class="my-order-back-btn" id="orderBackBtn">
                <i class="fas fa-arrow-left"></i> Volver a mis pedidos
            </button>

            <div class="my-order-detail-header">
                <div>
                    <p class="my-order-id">Pedido #${order._id.slice(-6).toUpperCase()}</p>
                    <p class="my-order-date">${new Date(order.createdAt).toLocaleDateString("es-CO", { day:"2-digit", month:"long", year:"numeric" })}</p>
                </div>
                <div id="orderEstadoBadge">${estadoBadge(order.estado)}</div>
            </div>

            <div class="my-order-section">
                <h3>Productos</h3>
                <div class="my-order-items-list">
                    ${order.items.map(item => `
                        <div class="my-order-item-row" data-product-id="${item.productId}">
                            <span class="my-order-item-name">${item.nombreSnapshot}</span>
                            <span class="my-order-item-qty">× ${item.cantidad}</span>
                            <span class="my-order-item-price">${formatCop(Number(item.precioSnapshot || 0))}</span>
                            <span class="my-order-item-sub">${formatCop(Number(item.subtotal || 0))}</span>
                            ${order.estado === "ENTREGADA" ? `
                            <button type="button"
                                    class="review-open-btn"
                                    data-product-id="${item.productId}"
                                    data-product-name="${item.nombreSnapshot.replace(/"/g, '&quot;')}">
                                <i class="fas fa-star"></i> Reseñar
                            </button>` : ""}
                        </div>
                        ${order.estado === "ENTREGADA" ? `
                        <div class="review-form-wrapper hidden" id="review-form-${item.productId}">
                            <form class="review-inline-form" data-product-id="${item.productId}">
                                <p class="review-form-title">Reseña de <strong>${item.nombreSnapshot}</strong></p>
                                <div class="star-rating" role="group" aria-label="Calificación">
                                    ${[5,4,3,2,1].map(n => `
                                    <input type="radio" name="rating-${item.productId}" id="star-${item.productId}-${n}" value="${n}" required>
                                    <label for="star-${item.productId}-${n}" aria-label="${n} estrella${n > 1 ? 's' : ''}">★</label>
                                    `).join("")}
                                </div>
                                <textarea class="review-textarea"
                                          name="comentario"
                                          placeholder="Escribe tu comentario (mínimo 3 caracteres)..."
                                          minlength="3"
                                          maxlength="1200"
                                          rows="3"
                                          required></textarea>
                                <div class="review-form-status buyer-cart-status hidden"></div>
                                <div class="review-form-actions">
                                    <button type="submit" class="dashboard-action-btn review-submit-btn">
                                        <i class="fas fa-paper-plane"></i> Enviar reseña
                                    </button>
                                    <button type="button" class="review-cancel-btn">Cancelar</button>
                                </div>
                            </form>
                        </div>` : ""}
                    `).join("")}
                </div>
                <div class="my-order-total-row">
                    <span>Total</span>
                    <span>${formatCop(Number(order.total || 0))}</span>
                </div>
            </div>

            <div id="paymentSection" class="my-order-section" ${isPending ? "" : 'style="display:none"'}>
                <h3>Pago</h3>
                <div id="paymentStatus" class="buyer-cart-status hidden"></div>
                <div id="paymentActions">
                    <button type="button" class="dashboard-action-btn" id="payBtn"
                            style="background:#c6701d;color:white;width:100%;justify-content:center;">
                        <i class="fas fa-credit-card"></i> Pagar ahora
                    </button>
                </div>
            </div>

            <div class="my-order-section">
                <h3>Historial</h3>
                <div class="my-order-history">
                    ${order.statusHistory.map(h => `
                        <div class="my-order-history-item">
                            <span class="my-order-history-dot"></span>
                            <div>
                                <p>${(ORDER_ESTADO_MAP[h.toStatus] || { label: h.toStatus }).label}</p>
                                <small>${new Date(h.createdAt).toLocaleString("es-CO")}</small>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
        `
    )

    document.getElementById("orderBackBtn").addEventListener("click", () => openMyOrders())

    // ── Reseñas (solo órdenes ENTREGADA) ───────────────────────
    if (order.estado === "ENTREGADA") {
        const panel = document.getElementById("orderDetailPanel")

        panel.querySelectorAll(".review-open-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const productId = btn.dataset.productId
                const wrapper   = document.getElementById(`review-form-${productId}`)
                if (!wrapper) return
                const isHidden = wrapper.classList.contains("hidden")
                // cerrar todos los formularios abiertos
                panel.querySelectorAll(".review-form-wrapper").forEach(w => w.classList.add("hidden"))
                panel.querySelectorAll(".review-open-btn").forEach(b => b.classList.remove("active"))
                if (isHidden) {
                    wrapper.classList.remove("hidden")
                    btn.classList.add("active")
                    wrapper.querySelector("textarea")?.focus()
                }
            })
        })

        panel.querySelectorAll(".review-cancel-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const wrapper = btn.closest(".review-form-wrapper")
                if (!wrapper) return
                const productId = wrapper.id.replace("review-form-", "")
                wrapper.classList.add("hidden")
                panel.querySelector(`.review-open-btn[data-product-id="${productId}"]`)
                     ?.classList.remove("active")
            })
        })

        panel.querySelectorAll(".review-inline-form").forEach(form => {
            form.addEventListener("submit", async (e) => {
                e.preventDefault()
                const productId  = form.dataset.productId
                const statusEl   = form.querySelector(".review-form-status")
                const submitBtn  = form.querySelector(".review-submit-btn")
                const ratingInput = form.querySelector(`input[name="rating-${productId}"]:checked`)
                const comentario  = form.querySelector("textarea[name='comentario']").value.trim()

                function setFormStatus(msg, kind = "info") {
                    statusEl.textContent = msg
                    statusEl.classList.remove("hidden", "is-error", "is-success")
                    if (kind === "error")   statusEl.classList.add("is-error")
                    if (kind === "success") statusEl.classList.add("is-success")
                }

                if (!ratingInput) {
                    setFormStatus("Selecciona una calificación de 1 a 5 estrellas.", "error")
                    return
                }

                submitBtn.disabled = true
                setFormStatus("Enviando reseña...")

                try {
                    const res = await fetchFn("/api/resenas", {
                        method: "POST",
                        body: {
                            productId,
                            calificacion: Number(ratingInput.value),
                            comentario,
                        },
                    })

                    if (res.ok) {
                        setFormStatus("¡Reseña enviada con éxito! Gracias.", "success")
                        form.querySelector(`input[name="rating-${productId}"]:checked`).checked = false
                        form.querySelector("textarea").value = ""
                        submitBtn.disabled = true
                        // reemplazar botón "Reseñar" por indicador visual
                        const openBtn = panel.querySelector(`.review-open-btn[data-product-id="${productId}"]`)
                        if (openBtn) {
                            openBtn.textContent = "✓ Reseñado"
                            openBtn.disabled = true
                            openBtn.classList.add("reviewed")
                        }
                        return
                    }

                    const err = await res.json().catch(() => ({}))
                    if      (res.status === 403) setFormStatus("Solo puedes reseñar productos que hayas comprado y cuyo pedido ya fue pagado o entregado.", "error")
                    else if (res.status === 409) setFormStatus("Ya enviaste una reseña para este producto.", "error")
                    else if (res.status === 401) setFormStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
                    else                         setFormStatus(err.detail || "No fue posible enviar la reseña.", "error")
                    submitBtn.disabled = false

                } catch (err) {
                    console.error("Error enviando reseña:", err)
                    setFormStatus("Error de conexión al enviar la reseña.", "error")
                    submitBtn.disabled = false
                }
            })
        })
    }

    if (!isPending) return

    const payBtn      = document.getElementById("payBtn")
    const payStatusEl = document.getElementById("paymentStatus")
    const payActionsEl = document.getElementById("paymentActions")

    function setPayStatus(msg, kind = "info") {
        payStatusEl.textContent = msg
        payStatusEl.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   payStatusEl.classList.add("is-error")
        if (kind === "success") payStatusEl.classList.add("is-success")
    }

    payBtn.addEventListener("click", async () => {
        payBtn.disabled = true
        setPayStatus("Creando intento de pago...")

        try {
            const res = await fetchFn("/api/pagos/crear-intento", {
                method: "POST",
                body: { orderId: order._id },
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                if      (res.status === 401) setPayStatus("Sesión no válida.", "error")
                else if (res.status === 403) setPayStatus("No tienes permiso para pagar esta orden.", "error")
                else if (res.status === 404) setPayStatus("Orden no encontrada.", "error")
                else if (res.status === 409) setPayStatus(err.detail || "Esta orden ya fue procesada.", "error")
                else                         setPayStatus(err.detail || "No fue posible iniciar el pago.", "error")
                payBtn.disabled = false
                return
            }

            const intent = await res.json()

            if (intent.provider === "mock") {
                setPayStatus("Selecciona el resultado del pago (entorno de prueba):", "info")
                payActionsEl.innerHTML = `
                    <div class="pay-mock-actions">
                        <button type="button" class="dashboard-action-btn mock-pay-btn"
                                data-status="APPROVED"
                                style="background:#0f5c2b;color:white;flex:1;justify-content:center;">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button type="button" class="dashboard-action-btn mock-pay-btn"
                                data-status="REJECTED"
                                style="background:#8e2d1c;color:white;flex:1;justify-content:center;">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>`

                payActionsEl.querySelectorAll(".mock-pay-btn").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        payActionsEl.querySelectorAll(".mock-pay-btn").forEach(b => b.disabled = true)
                        setPayStatus("Procesando pago...", "info")

                        try {
                            const emitRes = await fetch(`${API_CONFIG.BASE_URL}/api/pagos/mock/emit-event`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "x-mock-webhook-token": "colficultor_dev_secret",
                                },
                                body: JSON.stringify({
                                    orderId:     order._id,
                                    providerRef: intent.providerRef,
                                    status:      btn.dataset.status,
                                    amount:      order.total,
                                    currency:    "COP",
                                }),
                            })

                            if (!emitRes.ok) {
                                const err = await emitRes.json().catch(() => ({}))
                                if (emitRes.status === 401) setPayStatus("Sesión no válida.", "error")
                                else setPayStatus(err.detail || "Error al procesar el pago.", "error")
                                payActionsEl.querySelectorAll(".mock-pay-btn").forEach(b => b.disabled = false)
                                return
                            }

                            // Refrescar estado real desde el backend
                            const updatedRes = await fetchFn(`/api/ordenes/${order._id}`)
                            const updated = updatedRes.ok ? await updatedRes.json() : null
                            const newEstado = updated?.estado || (btn.dataset.status === "APPROVED" ? "PAGADA" : "PAGO_FALLIDO")

                            document.getElementById("orderEstadoBadge").innerHTML = estadoBadge(newEstado)
                            document.getElementById("paymentSection").style.display = "none"

                            if (newEstado === "PAGADA") {
                                setPayStatus("¡Pago aprobado! Tu orden ha sido confirmada.", "success")
                            } else {
                                setPayStatus("El pago fue rechazado. Contacta soporte si necesitas ayuda.", "error")
                            }
                            payStatusEl.classList.remove("hidden")

                        } catch (e) {
                            console.error("Error procesando pago:", e)
                            setPayStatus("Error de conexión al procesar el pago.", "error")
                            payActionsEl.querySelectorAll(".mock-pay-btn").forEach(b => b.disabled = false)
                        }
                    })
                })

            } else if (intent.provider === "payu") {
                setPayStatus("Redirigiendo a PayU…", "info")
                const form = document.createElement("form")
                form.method = "POST"
                form.action = intent.paymentUrl
                form.style.display = "none"
                Object.entries(intent.formFields || {}).forEach(([k, v]) => {
                    const input = document.createElement("input")
                    input.type = "hidden"
                    input.name = k
                    input.value = String(v)
                    form.appendChild(input)
                })
                document.body.appendChild(form)
                form.submit()

            } else {
                setPayStatus("Proveedor de pago no reconocido.", "error")
                payBtn.disabled = false
            }

        } catch (e) {
            console.error("Error iniciando pago:", e)
            setPayStatus("Error de conexión al iniciar el pago.", "error")
            payBtn.disabled = false
        }
    })
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
                        <button id="dashboardCancelSettingsBtn" type="button" class="dashboard-action-btn" style="background:#888; color: white; border:none; padding:12px 20px; border-radius:8px; font-weight:600; cursor:pointer;">Cancelar</button>
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
                    
                    showAppToast("¡Perfil actualizado correctamente!");
                    openProfile(); // Regresa a "Mi perfil" para visualizar el cambio
                } else {
                    const errorJson = await response.json();
                    showAppToast("Error guardando el perfil: " + (errorJson.detail || "Revise los campos"));
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                showAppToast("Ocurrió un error al contactar al servidor.");
            }
        });
    }

    const dashboardCancelSettingsBtn = document.getElementById("dashboardCancelSettingsBtn");
    if (dashboardCancelSettingsBtn) {
        dashboardCancelSettingsBtn.addEventListener("click", () => {
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

cartBtn?.addEventListener("click", () => {
    openBuyerCart();
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
    if (primaryNav && navToggleBtn && !primaryNav.contains(target) && !navToggleBtn.contains(target)) {
        closePrimaryNav()
    }
});

window.addEventListener("load", applyAuthenticatedState);
window.addEventListener("load", () => {
    loadCatalog({ resetPage: true })
});
window.addEventListener("load", handlePayuRedirectIfPresent);

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
                        <section style="width: 100%; aspect-ratio: 1 / 1; background: #e9ecef; display: flex; justify-content: center; align-items: center; overflow: hidden;">
                            ${p.urls_imagenes && p.urls_imagenes.length > 0
                                ? `<img src="${p.urls_imagenes[0]}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover;" />`
                                : `<i class="fas fa-image" style="font-size: 3rem; color: #adb5bd;"></i>`
                            }
                        </section>
                        <section style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1;">
                            <h3 style="margin: 0 0 10px 0; font-size: 1.2rem; color: #333;">${p.nombre}</h3>
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem; line-height: 1.4; flex-grow: 1;">${p.descripcion}</p>
                            <span style="font-size: 0.8rem; color: #888; margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> ${p.region} | Stock: ${p.stock}</span>
                            <span style="font-weight: bold; color: #c6701d; font-size: 1.1rem; margin-bottom: 12px;">${formatCop(Number(p.precio))}</span>
                            <div style="display: flex; gap: 8px;">
                                <button class="dashboard-action-btn edit-product-btn" data-id="${p._id || p.id}" style="flex:1; padding: 6px 10px; font-size: 0.85rem;">
                                    <i class="fas fa-pen"></i> Editar
                                </button>
                            </div>
                        </section>
                    </article>
                `).join('');

                productsGrid.querySelectorAll('.edit-product-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const product = products.find(p => (p._id || p.id) === id);
                        if (product) openEditProductModal(product);
                    });
                });

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
                            <select id="prodRegion" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;background:#fff;color:#333;font-family:inherit;font-size:1rem;">
                                <option value="" disabled selected>Seleccione un departamento</option>
                                <option>Amazonas</option>
                                <option>Antioquia</option>
                                <option>Arauca</option>
                                <option>Atlántico</option>
                                <option>Bolívar</option>
                                <option>Boyacá</option>
                                <option>Caldas</option>
                                <option>Caquetá</option>
                                <option>Casanare</option>
                                <option>Cauca</option>
                                <option>Cesar</option>
                                <option>Chocó</option>
                                <option>Córdoba</option>
                                <option>Cundinamarca</option>
                                <option>Guainía</option>
                                <option>Guaviare</option>
                                <option>Huila</option>
                                <option>La Guajira</option>
                                <option>Magdalena</option>
                                <option>Meta</option>
                                <option>Nariño</option>
                                <option>Norte de Santander</option>
                                <option>Putumayo</option>
                                <option>Quindío</option>
                                <option>Risaralda</option>
                                <option>San Andrés y Providencia</option>
                                <option>Santander</option>
                                <option>Sucre</option>
                                <option>Tolima</option>
                                <option>Valle del Cauca</option>
                                <option>Vaupés</option>
                                <option>Vichada</option>
                            </select>
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
            const imgFile = document.getElementById("prodImg").files[0];
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
                    const newProduct = await response.json();
                    const productId = newProduct._id || newProduct.id;

                    if (imgFile && productId) {
                        const formData = new FormData();
                        formData.append("files", imgFile);
                        try {
                            const imgResponse = await fetch(`${API_CONFIG.BASE_URL}/api/products/${productId}/images`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData
                            });
                            if (!imgResponse.ok) {
                                console.warn("Producto creado, pero hubo un problema al subir la imagen.");
                            }
                        } catch (imgErr) {
                            console.error("Error al subir imagen:", imgErr);
                        }
                    }

                    showAppToast("¡Producto guardado exitosamente!");
                    openMyProducts();
                } else {
                    const err = await response.json();
                    showAppToast("Error al guardar: " + (err.detail || "Datos inválidos"));
                }
            } catch (error) {
                console.error("Error creating product:", error);
                showAppToast("Ocurrió un error al conectar con el servidor.");
            }
        });
    }
}

function openEditProductModal(product) {
    const productId = product._id || product.id;
    const depts = [
        "Amazonas","Antioquia","Arauca","Atlántico","Bolívar",
        "Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó",
        "Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira",
        "Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío",
        "Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima",
        "Valle del Cauca","Vaupés","Vichada"
    ];
    const deptOptions = depts.map(d =>
        `<option${d === product.region ? ' selected' : ''}>${d}</option>`
    ).join('');

    const currentImgHtml = product.urls_imagenes && product.urls_imagenes.length > 0
        ? `<img src="${product.urls_imagenes[0]}" alt="${product.nombre}" style="width:100%;height:180px;object-fit:cover;border-radius:10px;display:block;" />`
        : `<div style="width:100%;height:180px;background:#e9ecef;border-radius:10px;display:flex;justify-content:center;align-items:center;color:#adb5bd;font-size:2.5rem;"><i class="fas fa-image"></i></div>`;

    openDashboard(
        "Editar Producto",
        `
            <div class="dashboard-section" style="max-width: 600px; margin: 0 auto; width: 100%;">
                <form id="editProductForm" class="settings-form">
                    <div style="display:flex;flex-direction:column;gap:15px;">
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            <label style="font-weight:600; color: #333;">Imagen del Producto</label>
                            <div id="editImgPreviewWrap">
                                ${currentImgHtml}
                            </div>
                            <input type="file" id="editProdImg" accept="image/jpeg,image/png,image/webp"
                                style="padding:10px 14px;border:1px dashed #c6701d;border-radius:12px;background:#fafafa;cursor:pointer;color:#666;" />
                            <small style="color:#888;">Selecciona una imagen para reemplazar la actual. Formatos: JPG, PNG, WEBP · Máx. 5 MB.</small>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Nombre del Producto</label>
                            <input type="text" id="editProdName" value="${product.nombre}" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Descripción</label>
                            <textarea id="editProdDesc" rows="4" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px; resize: vertical; font-family: inherit;">${product.descripcion}</textarea>
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Precio (COP)</label>
                                <input type="number" id="editProdPrice" value="${product.precio}" min="1" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                            <div style="display:flex;flex-direction:column;gap:5px;">
                                <label style="font-weight:600; color: #333;">Stock Disponible</label>
                                <input type="number" id="editProdStock" value="${product.stock}" min="0" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;" />
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Región de Origen</label>
                            <select id="editProdRegion" required style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;background:#fff;color:#333;font-family:inherit;font-size:1rem;">
                                <option value="" disabled>Seleccione un departamento</option>
                                ${deptOptions}
                            </select>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <label style="font-weight:600; color: #333;">Estado</label>
                            <select id="editProdActive" style="padding:12px 14px;border:1px solid #ddd;border-radius:12px;background:#fff;color:#333;font-family:inherit;font-size:1rem;">
                                <option value="true"${product.is_active ? ' selected' : ''}>Activo</option>
                                <option value="false"${!product.is_active ? ' selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div id="editProductStatus" style="display:none; margin-top:12px; padding:10px 14px; border-radius:10px; font-weight:500; font-size:0.93rem;"></div>
                    <div style="margin-top:24px; display:flex; gap:15px; justify-content: space-between; flex-wrap:wrap;">
                        <button id="deleteEditProductBtn" type="button" class="dashboard-action-btn" style="background:#8e2d1c; color: white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                            <i class="fas fa-trash"></i> Eliminar producto
                        </button>
                        <div style="display:flex; gap:10px;">
                            <button id="cancelEditProductBtn" type="button" class="dashboard-action-btn" style="background:#888; color: white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Cancelar</button>
                            <button type="submit" class="dashboard-action-btn" style="background:#c6701d; color: white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Guardar cambios</button>
                        </div>
                    </div>
                </form>
            </div>
        `
    );

    document.getElementById("cancelEditProductBtn")?.addEventListener("click", () => openMyProducts());
    document.getElementById("deleteEditProductBtn")?.addEventListener("click", () => deleteProduct(productId));

    // Preview en tiempo real al seleccionar imagen
    document.getElementById("editProdImg")?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById("editImgPreviewWrap").innerHTML =
                `<img src="${ev.target.result}" alt="Preview" style="width:100%;height:180px;object-fit:cover;border-radius:10px;display:block;" />`;
        };
        reader.readAsDataURL(file);
    });

    const form = document.getElementById("editProductForm");
    const statusEl = document.getElementById("editProductStatus");

    function showEditStatus(msg, ok) {
        statusEl.textContent = msg;
        statusEl.style.display = "block";
        statusEl.style.background = ok ? "#effcf4" : "#fff2ef";
        statusEl.style.color = ok ? "#0f5c2b" : "#8e2d1c";
        statusEl.style.border = `1px solid ${ok ? "#bce8ca" : "#f1c8bf"}`;
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            nombre: document.getElementById("editProdName").value,
            descripcion: document.getElementById("editProdDesc").value,
            precio: parseFloat(document.getElementById("editProdPrice").value),
            stock: parseInt(document.getElementById("editProdStock").value),
            region: document.getElementById("editProdRegion").value,
            is_active: document.getElementById("editProdActive").value === "true",
        };
        const token = localStorage.getItem("access_token");
        const imgFile = document.getElementById("editProdImg").files[0];
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/productos/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                showEditStatus(err.detail || "No fue posible actualizar el producto.", false);
                return;
            }

            if (imgFile) {
                // PUT reemplaza la imagen existente; POST agrega si no había ninguna
                const hasExistingImage = product.urls_imagenes && product.urls_imagenes.length > 0;
                const imgMethod = hasExistingImage ? "PUT" : "POST";
                const formData = new FormData();
                if (hasExistingImage) {
                    formData.append("file", imgFile);   // PUT espera campo "file"
                } else {
                    formData.append("files", imgFile);  // POST espera campo "files"
                }
                try {
                    const imgResponse = await fetch(`${API_CONFIG.BASE_URL}/api/products/${productId}/images`, {
                        method: imgMethod,
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!imgResponse.ok) {
                        showEditStatus("Datos actualizados, pero hubo un problema al subir la imagen.", false);
                        setTimeout(() => openMyProducts(), 2000);
                        return;
                    }
                } catch {
                    showEditStatus("Datos actualizados, pero error de conexión al subir imagen.", false);
                    setTimeout(() => openMyProducts(), 2000);
                    return;
                }
            }

            showEditStatus("¡Producto actualizado exitosamente!", true);
            setTimeout(() => openMyProducts(), 1200);
        } catch {
            showEditStatus("Error de conexión con el servidor.", false);
        }
    });
}

async function deleteProduct(productId) {
    if (!confirm("¿Seguro que deseas eliminar este producto? Esta acción lo desactivará del catálogo.")) return;
    const token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/productos/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok || response.status === 204) {
            openMyProducts();
        } else {
            const err = await response.json().catch(() => ({}));
            showAppToast(err.detail || "No fue posible eliminar el producto.");
        }
    } catch {
        showAppToast("Error de conexión con el servidor.");
    }
}

async function openMySales() {
    openDashboard(
        "Mis ventas",
        `
            <div class="my-orders-panel" id="mySalesPanel">
                <div class="buyer-cart-status" id="mySalesStatus">Cargando ventas...</div>
                <div class="my-orders-list" id="mySalesList"></div>
            </div>
        `
    );

    const token = localStorage.getItem("access_token")
    const statusEl = document.getElementById("mySalesStatus")
    const listEl   = document.getElementById("mySalesList")

    // Transiciones válidas para el caficultor
    const NEXT_STATES = {
        PAGADA:         [{ value: "EN_PREPARACION", label: "En preparación" }],
        EN_PREPARACION: [{ value: "ENVIADA", label: "Enviada" }],
        ENVIADA:        [{ value: "ENTREGADA", label: "Entregada" }],
    }

    function setStatus(msg, kind = "info") {
        statusEl.textContent = msg
        statusEl.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   statusEl.classList.add("is-error")
        if (kind === "success") statusEl.classList.add("is-success")
    }

    async function authFetch(path, opts = {}) {
        const headers = { Authorization: `Bearer ${token}` }
        const options = { method: opts.method || "GET", headers }
        if (opts.body) { headers["Content-Type"] = "application/json"; options.body = JSON.stringify(opts.body) }
        return fetch(`${API_CONFIG.BASE_URL}${path}`, options)
    }

    async function changeStatus(orderId, newEstado, cardEl) {
        const feedbackEl = cardEl.querySelector(".sale-feedback")
        feedbackEl.textContent = "Actualizando..."
        feedbackEl.className = "sale-feedback buyer-cart-status"
        try {
            const res = await authFetch(`/api/ordenes/${orderId}/estado`, { method: "PUT", body: { estado: newEstado } })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                feedbackEl.textContent = err.detail || "No fue posible cambiar el estado."
                feedbackEl.classList.add("is-error")
                return
            }
            openMySales()
        } catch {
            feedbackEl.textContent = "Error de conexión."
            feedbackEl.classList.add("is-error")
        }
    }

    try {
        const res = await authFetch("/api/ordenes/ventas")
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            if      (res.status === 401) setStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
            else if (res.status === 403) setStatus("No tienes permiso para ver ventas.", "error")
            else                         setStatus(err.detail || "No fue posible cargar las ventas.", "error")
            return
        }

        const orders = await res.json()
        statusEl.classList.add("hidden")

        if (!orders.length) {
            listEl.innerHTML = `
                <div class="my-orders-empty">
                    <i class="fas fa-store-slash"></i>
                    <p>Aún no tienes ventas.</p>
                    <p>Cuando un comprador pague una orden con tus productos, aparecerá aquí.</p>
                </div>`
            return
        }

        listEl.innerHTML = orders.map(order => {
            const nextStates   = NEXT_STATES[order.estado] || []
            // Usar solo los items y el subtotal propios del caficultor
            const myItems      = order.caficultor_items || []
            const mySubtotal   = order.caficultor_subtotal ?? 0
            const itemsText    = myItems.length
                ? myItems.map(i => `${i.nombreSnapshot} × ${i.cantidad}`).join(" · ")
                : "Sin productos propios en esta orden"
            const stateOptions = nextStates.map(s =>
                `<option value="${s.value}">${s.label}</option>`
            ).join("")
            const hasActions = nextStates.length > 0

            return `
            <article class="my-order-card" data-order-id="${order._id}">
                <div class="my-order-card-header">
                    <div>
                        <p class="my-order-id">Pedido #${order._id.slice(-6).toUpperCase()}</p>
                        <p class="my-order-date">${new Date(order.createdAt).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" })}</p>
                    </div>
                    ${estadoBadge(order.estado)}
                </div>
                <p class="my-order-items-preview">${itemsText}</p>
                <div class="my-order-card-footer">
                    <span class="my-order-total">${formatCop(mySubtotal)}</span>
                    ${hasActions ? `
                    <div class="sale-state-actions">
                        <select class="sale-next-state" style="padding:7px 10px;border:1px solid #ddd;border-radius:8px;font-family:inherit;font-size:0.85rem;color:#333;cursor:pointer;">
                            <option value="">Cambiar estado…</option>
                            ${stateOptions}
                        </select>
                        <button type="button" class="dashboard-action-btn sale-apply-btn"
                                style="padding:7px 14px;font-size:0.85rem;background:#c6701d;color:white;">
                            Aplicar
                        </button>
                    </div>` : ""}
                </div>
                <div class="sale-feedback hidden"></div>
            </article>`
        }).join("")

        listEl.querySelectorAll(".sale-apply-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const card    = btn.closest(".my-order-card")
                const orderId = card.dataset.orderId
                const select  = card.querySelector(".sale-next-state")
                if (!select.value) { return }
                changeStatus(orderId, select.value, card)
            })
        })

    } catch (e) {
        console.error("Error cargando ventas:", e)
        setStatus("Error de conexión al cargar las ventas.", "error")
    }
}

async function openMyStats() {
    if (!currentUser || currentUser.role !== "caficultor") {
        openPlaceholder("Métricas y Rendimiento", "Solo los caficultores pueden ver esta sección.")
        return
    }

    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setDate(today.getDate() - 30)
    const toIsoDate = (d) => d.toISOString().slice(0, 10)

    openDashboard(
        "Métricas y Rendimiento",
        `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:12px;color:#666;font-weight:600;">Desde</label>
                    <input id="statsDateFrom" type="date" value="${toIsoDate(monthAgo)}" style="padding:8px 10px;border:1px solid #ddd;border-radius:8px;">
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:12px;color:#666;font-weight:600;">Hasta</label>
                    <input id="statsDateTo" type="date" value="${toIsoDate(today)}" style="padding:8px 10px;border:1px solid #ddd;border-radius:8px;">
                </div>
                <button id="statsApplyBtn" class="dashboard-action-btn" style="padding:9px 14px;">Aplicar filtro</button>
                <button id="statsExportCsvBtn" class="dashboard-action-btn" style="padding:9px 14px;background:#1f7a3f;color:#fff;">Exportar CSV</button>
                <button id="statsExportPdfBtn" class="dashboard-action-btn" style="padding:9px 14px;background:#8b3c1a;color:#fff;">Exportar PDF</button>
                <div id="statsStatus" class="buyer-cart-status" style="margin-left:auto;min-width:220px;">Cargando métricas...</div>
            </div>

            <div id="statsKpis" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"></div>
            <div id="statsDaily" style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"></div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
                <div id="statsTopProducts" style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"></div>
                <div id="statsByStatus" style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"></div>
            </div>
        </div>
        `
    )

    const token = localStorage.getItem("access_token")
    const statusEl = document.getElementById("statsStatus")
    const fromEl = document.getElementById("statsDateFrom")
    const toEl = document.getElementById("statsDateTo")
    const kpiEl = document.getElementById("statsKpis")
    const dailyEl = document.getElementById("statsDaily")
    const topEl = document.getElementById("statsTopProducts")
    const byStatusEl = document.getElementById("statsByStatus")

    function setStatus(msg, kind = "info") {
        statusEl.textContent = msg
        statusEl.classList.remove("is-error", "is-success")
        if (kind === "error") statusEl.classList.add("is-error")
        if (kind === "success") statusEl.classList.add("is-success")
    }

    async function authFetch(path, opts = {}) {
        const headers = { Authorization: `Bearer ${token}` }
        const options = { method: opts.method || "GET", headers }
        return fetch(`${API_CONFIG.BASE_URL}${path}`, options)
    }

    function toBogotaDateKey(dateValue) {
        const d = new Date(dateValue)
        if (Number.isNaN(d.getTime())) return null
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(d)
        const year = parts.find(p => p.type === "year")?.value
        const month = parts.find(p => p.type === "month")?.value
        const day = parts.find(p => p.type === "day")?.value
        if (!year || !month || !day) return null
        return `${year}-${month}-${day}`
    }

    function inRange(dateValue, fromValue, toValue) {
        const key = toBogotaDateKey(dateValue)
        if (!key) return false
        return key >= fromValue && key <= toValue
    }

    function buildFilenameFromHeader(contentDisposition, fallback) {
        const match = /filename=([^;]+)/i.exec(contentDisposition || "")
        if (!match) return fallback
        return match[1].replace(/"/g, "").trim() || fallback
    }

    async function exportReport(kind) {
        const desde = fromEl.value
        const hasta = toEl.value
        if (!desde || !hasta || desde > hasta) {
            setStatus("Rango de fechas inválido para exportar.", "error")
            return
        }

        const btn = kind === "csv"
            ? document.getElementById("statsExportCsvBtn")
            : document.getElementById("statsExportPdfBtn")
        const ext = kind === "csv" ? "csv" : "pdf"
        const endpoint = kind === "csv" ? "/api/reportes/mis-ventas.csv" : "/api/reportes/mis-ventas.pdf"
        const prev = btn.textContent
        btn.disabled = true
        btn.textContent = "Generando..."
        setStatus(`Generando reporte ${ext.toUpperCase()}...`)

        try {
            const res = await authFetch(`${endpoint}?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`)
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                setStatus(err.detail || `No fue posible exportar ${ext.toUpperCase()}.`, "error")
                return
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = buildFilenameFromHeader(
                res.headers.get("Content-Disposition"),
                `mis_ventas_${desde}_${hasta}.${ext}`
            )
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            setStatus(`Reporte ${ext.toUpperCase()} descargado.`, "success")
        } catch (e) {
            console.error(`Error exportando ${ext}:`, e)
            setStatus(`Error de conexión exportando ${ext.toUpperCase()}.`, "error")
        } finally {
            btn.disabled = false
            btn.textContent = prev
        }
    }

    function renderStats(orders, fromValue, toValue) {
        const filtered = orders.filter(o => inRange(o.createdAt, fromValue, toValue))

        const totalOrders = filtered.length
        const totalIncome = filtered.reduce((acc, o) => acc + Number(o.caficultor_subtotal || 0), 0)
        const paidLike = filtered.filter(o => ["PAGADA", "EN_PREPARACION", "ENVIADA", "ENTREGADA"].includes(o.estado))
        const paidIncome = paidLike.reduce((acc, o) => acc + Number(o.caficultor_subtotal || 0), 0)
        const avgTicket = totalOrders ? (totalIncome / totalOrders) : 0

        kpiEl.innerHTML = `
            <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"><div style="font-size:12px;color:#777;">Pedidos con tus productos</div><div style="font-size:26px;font-weight:700;color:#4B2E2B;">${totalOrders}</div></div>
            <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"><div style="font-size:12px;color:#777;">Ingresos (subtotal propio)</div><div style="font-size:26px;font-weight:700;color:#4B2E2B;">${formatCop(totalIncome)}</div></div>
            <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"><div style="font-size:12px;color:#777;">Ingresos pagados/en curso</div><div style="font-size:26px;font-weight:700;color:#4B2E2B;">${formatCop(paidIncome)}</div></div>
            <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;"><div style="font-size:12px;color:#777;">Ticket promedio</div><div style="font-size:26px;font-weight:700;color:#4B2E2B;">${formatCop(avgTicket)}</div></div>
        `

        const byDay = {}
        filtered.forEach(order => {
            const day = toBogotaDateKey(order.createdAt)
            if (!day) return
            byDay[day] = (byDay[day] || 0) + Number(order.caficultor_subtotal || 0)
        })
        const dayRows = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-10)
        const maxDayValue = Math.max(1, ...dayRows.map(([, v]) => Number(v)))
        dailyEl.innerHTML = `
            <h3 style="margin:0 0 10px 0;font-size:15px;color:#4B2E2B;">Ventas por día (últimos 10 días con ventas)</h3>
            ${dayRows.length ? dayRows.map(([day, value]) => `
                <div style="display:grid;grid-template-columns:110px 1fr 120px;gap:8px;align-items:center;margin:7px 0;">
                    <span style="font-size:12px;color:#666;">${day}</span>
                    <div style="height:10px;background:#f3e6d9;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.max(4, (Number(value) / maxDayValue) * 100)}%;background:#E2902D;"></div>
                    </div>
                    <span style="font-size:12px;font-weight:700;color:#4B2E2B;">${formatCop(Number(value))}</span>
                </div>
            `).join("") : `<p style="margin:0;color:#777;">Sin ventas en el rango seleccionado.</p>`}
        `

        const productAgg = {}
        filtered.forEach(order => {
            ;(order.caficultor_items || []).forEach(item => {
                const key = item.productId || item.nombreSnapshot || "producto"
                if (!productAgg[key]) {
                    productAgg[key] = {
                        nombre: item.nombreSnapshot || "Producto",
                        cantidad: 0,
                        ingresos: 0,
                    }
                }
                productAgg[key].cantidad += Number(item.cantidad || 0)
                productAgg[key].ingresos += Number(item.subtotal || 0)
            })
        })
        const topProducts = Object.values(productAgg)
            .sort((a, b) => (b.cantidad - a.cantidad) || (b.ingresos - a.ingresos))
            .slice(0, 5)

        topEl.innerHTML = `
            <h3 style="margin:0 0 10px 0;font-size:15px;color:#4B2E2B;">Top productos vendidos</h3>
            ${topProducts.length ? `
            <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;">
                ${topProducts.map((p, idx) => `
                    <li style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #f1f1f1;padding-bottom:7px;">
                        <span style="font-size:13px;color:#4B2E2B;">${idx + 1}. ${p.nombre}</span>
                        <span style="font-size:12px;color:#666;">${p.cantidad} und | ${formatCop(p.ingresos)}</span>
                    </li>
                `).join("")}
            </ul>` : `<p style="margin:0;color:#777;">No hay productos vendidos en este rango.</p>`}
        `

        const statusCount = {}
        filtered.forEach(o => {
            statusCount[o.estado] = (statusCount[o.estado] || 0) + 1
        })
        const statusRows = Object.entries(statusCount).sort((a, b) => b[1] - a[1])
        byStatusEl.innerHTML = `
            <h3 style="margin:0 0 10px 0;font-size:15px;color:#4B2E2B;">Distribución por estado</h3>
            ${statusRows.length ? statusRows.map(([st, count]) => `
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f1f1;">
                    <span style="font-size:13px;color:#4B2E2B;">${st}</span>
                    <strong style="font-size:13px;color:#4B2E2B;">${count}</strong>
                </div>
            `).join("") : `<p style="margin:0;color:#777;">Sin datos para mostrar.</p>`}
        `

        setStatus(`Rango ${fromValue} a ${toValue}. ${totalOrders} pedido(s) encontrado(s).`, "success")
    }

    let allSales = []
    async function loadAndRender() {
        const desde = fromEl.value
        const hasta = toEl.value
        if (!desde || !hasta || desde > hasta) {
            setStatus("Rango inválido. Verifica las fechas.", "error")
            return
        }
        setStatus("Cargando métricas...")
        try {
            const res = await authFetch("/api/ordenes/ventas")
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                if (res.status === 401) setStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
                else if (res.status === 403) setStatus("No tienes permiso para ver métricas.", "error")
                else setStatus(err.detail || "No fue posible cargar métricas.", "error")
                return
            }
            allSales = await res.json()
            renderStats(allSales, desde, hasta)
        } catch (e) {
            console.error("Error cargando métricas:", e)
            setStatus("Error de conexión al cargar métricas.", "error")
        }
    }

    document.getElementById("statsApplyBtn")?.addEventListener("click", () => {
        if (allSales.length) {
            renderStats(allSales, fromEl.value, toEl.value)
        } else {
            loadAndRender()
        }
    })
    document.getElementById("statsExportCsvBtn")?.addEventListener("click", () => exportReport("csv"))
    document.getElementById("statsExportPdfBtn")?.addEventListener("click", () => exportReport("pdf"))

    await loadAndRender()
}


// ═══════════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN CON GOOGLE OAUTH 2.0
// ═══════════════════════════════════════════════════════════════════════════
//
// Flujo completo:
//   1. Usuario hace clic en "Continuar con Google"
//      → el navegador redirige al backend /api/auth/google/init
//      → el backend genera el state CSRF y redirige a Google
//   2. Google autentica y redirige al backend /api/auth/google/callback
//   3. El backend redirige a la misma página con uno de estos parámetros:
//      ?token=<jwt>            → usuario existente: login inmediato
//      ?google_pending=<tok>  → usuario nuevo: pedir rol
//      ?google_error=<reason> → algo salió mal
//   4. Este script lee los parámetros al cargar la página y actúa en consecuencia.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Botones Google (login y registro apuntan al mismo endpoint) ────────────

const googleLoginBtn = document.getElementById("googleLoginBtn")
const googleRegisterBtn = document.getElementById("googleRegisterBtn")

function redirectToGoogleAuth() {
    // Redirigir al backend; este a su vez redirige a Google
    window.location.href = `${API_CONFIG.BASE_URL}/api/auth/google/init`
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", redirectToGoogleAuth)
}
if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", redirectToGoogleAuth)
}

// ── Modal de selección de rol ──────────────────────────────────────────────

const googleRoleModal   = document.getElementById("googleRoleModal")
const googleRoleForm    = document.getElementById("googleRoleForm")
const googleRoleError   = document.getElementById("googleRoleError")
const googleUserPreview = document.getElementById("googleUserPreview")

/**
 * Muestra el modal de selección de rol para un usuario nuevo de Google.
 * @param {string} tempToken - Token temporal recibido por URL.
 * @param {string|null} name  - Nombre del usuario (decorativo, puede ser null).
 */
function showGoogleRoleModal(tempToken, name) {
    if (!googleRoleModal) return

    if (googleUserPreview && name) {
        googleUserPreview.innerHTML = `
            <p class="google-welcome">
                <i class="fas fa-user-circle" aria-hidden="true"></i>
                Bienvenido, <strong>${escapeHtml(name)}</strong>
            </p>`
    }

    googleRoleModal.classList.add("active")

    googleRoleForm.onsubmit = async (e) => {
        e.preventDefault()
        const selected = googleRoleForm.querySelector('input[name="googleRole"]:checked')

        if (!selected) {
            if (googleRoleError) googleRoleError.hidden = false
            return
        }
        if (googleRoleError) googleRoleError.hidden = true

        const submitBtn = document.getElementById("googleRoleSubmitBtn")
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.textContent = "Guardando..."
        }

        await completeGoogleRegistration(tempToken, selected.value)

        if (submitBtn) {
            submitBtn.disabled = false
            submitBtn.textContent = "Continuar"
        }
    }
}

/**
 * Llama al endpoint /api/auth/google/complete con el token temporal y el rol elegido.
 * Si tiene éxito, guarda el JWT y carga la sesión del usuario.
 */
async function completeGoogleRegistration(tempToken, role) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/google/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temp_token: tempToken, role }),
        })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem("access_token", data.access_token)

            googleRoleModal.classList.remove("active")
            cleanGoogleParams()

            const authenticated = await applyAuthenticatedState()
            if (authenticated) {
                showAppToast("¡Registro exitoso! Bienvenido a Colficultor.")
            } else {
                showAppToast("Registro completado. Por favor inicia sesión.")
            }
        } else {
            const err = await response.json()
            showAppToast(`Error al completar el registro: ${err.detail || "Inténtalo de nuevo."}`)
        }
    } catch (error) {
        console.error("Error al completar registro Google:", error)
        showAppToast("Ocurrió un error de conexión. Verifica que el servidor esté corriendo.")
    }
}

// ── Mensajes de error de Google ────────────────────────────────────────────

const GOOGLE_ERROR_MESSAGES = {
    access_denied:    "Cancelaste el inicio de sesión con Google.",
    invalid_state:    "La solicitud de autenticación expiró. Por favor inténtalo de nuevo.",
    exchange_failed:  "No se pudo comunicar con Google. Inténtalo de nuevo.",
    missing_info:     "Google no proporcionó la información necesaria. Inténtalo de nuevo.",
    account_inactive: "Tu cuenta está inactiva. Contacta al soporte.",
    invalid_request:  "Solicitud de autenticación inválida. Inténtalo de nuevo.",
}

function getGoogleErrorMessage(code) {
    return GOOGLE_ERROR_MESSAGES[code] || "Ocurrió un error al iniciar sesión con Google."
}

// ── Utilidad: escapar HTML para evitar XSS en el nombre del usuario ────────

function escapeHtml(text) {
    const div = document.createElement("div")
    div.appendChild(document.createTextNode(String(text)))
    return div.innerHTML
}

// ── Limpiar parámetros Google de la URL (sin recargar la página) ──────────

function cleanGoogleParams() {
    const url = new URL(window.location.href)
    url.searchParams.delete("token")
    url.searchParams.delete("google_pending")
    url.searchParams.delete("google_error")
    window.history.replaceState({}, document.title, url.toString())
}

// ── Inicialización: leer parámetros de URL al cargar la página ─────────────
//
// Este bloque se ejecuta al inicio. Detecta si el backend redirigió aquí
// con algún parámetro de Google OAuth y actúa en consecuencia.

;(async function handleGoogleOAuthCallback() {
    const params = new URLSearchParams(window.location.search)

    const token         = params.get("token")
    const googlePending = params.get("google_pending")
    const googleError   = params.get("google_error")

    console.log("[Google OAuth] Parámetros detectados:", {
        token: token ? "PRESENTE (login directo)" : null,
        googlePending: googlePending ? "PRESENTE (selección de rol)" : null,
        googleError: googleError || null,
    })

    if (token) {
        // — Usuario existente autenticado por Google → login inmediato —
        console.log("[Google OAuth] Iniciando sesión con token existente...")
        localStorage.setItem("access_token", token)
        cleanGoogleParams()
        const authenticated = await applyAuthenticatedState()
        if (!authenticated) {
            localStorage.removeItem("access_token")
            showAppToast("No se pudo cargar tu perfil. Por favor intenta de nuevo.")
        }

    } else if (googlePending) {
        // — Usuario nuevo → mostrar modal de selección de rol —
        console.log("[Google OAuth] Usuario nuevo → mostrando modal de rol")
        cleanGoogleParams()
        showGoogleRoleModal(googlePending, null)
        console.log("[Google OAuth] Modal de rol activado. Elemento:", googleRoleModal)

    } else if (googleError) {
        // — Error en el flujo OAuth → mostrar mensaje y abrir login —
        console.error("[Google OAuth] Error recibido:", googleError)
        cleanGoogleParams()
        showAppToast(getGoogleErrorMessage(googleError))
        if (modal) modal.classList.add("active")
    }
})()

// ── Detalle de producto + reseñas públicas ───────────────────────
async function openProductDetail(product) {
    const imgHtml = product.urls_imagenes && product.urls_imagenes.length > 0
        ? `<div class="product-detail-img-wrapper">
               <img src="${product.urls_imagenes[0]}" alt="${product.nombre}" class="product-detail-img" />
           </div>`
        : `<div class="product-detail-img-wrapper">
               <div class="product-detail-img-placeholder"><i class="fas fa-image"></i></div>
           </div>`

    openDashboard(product.nombre, `
        <div class="product-detail-panel" id="productDetailPanel">
            ${imgHtml}
            <div class="product-detail-info">
                <p class="product-detail-region">
                    <i class="fas fa-map-marker-alt"></i>
                    ${product.region || product.origen || "Sin región"}
                </p>
                <p class="product-detail-price">${formatCop(Number(product.precio || 0))}</p>
                <p class="product-detail-stock">Stock disponible: ${product.stock ?? 0}</p>
                <p class="product-detail-desc">${product.descripcion || "Sin descripción"}</p>
                <button type="button" class="dashboard-action-btn product-detail-add-btn"
                        data-product-id="${product._id}"
                        style="width:100%;justify-content:center;">
                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                </button>
            </div>

            <div class="product-reviews-section">
                <h3 class="product-reviews-heading">Reseñas</h3>
                <div class="product-reviews-summary" id="reviewsSummary">
                    <span class="reviews-loading">Cargando reseñas...</span>
                </div>
                <div class="product-reviews-list" id="reviewsList"></div>
            </div>
        </div>
    `)

    // Agregar al carrito desde el detalle
    document.getElementById("productDetailPanel")
        .querySelector(".product-detail-add-btn")
        .addEventListener("click", () => addToCartFromCatalog(product._id))

    // Cargar reseñas (endpoint público — sin token)
    const summaryEl = document.getElementById("reviewsSummary")
    const listEl    = document.getElementById("reviewsList")

    function renderStars(rating, total = 5) {
        return Array.from({ length: total }, (_, i) =>
            `<span class="review-star${i < Math.round(rating) ? " filled" : ""}" aria-hidden="true">★</span>`
        ).join("")
    }

    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/productos/${product._id}/resenas`)

        if (!res.ok) {
            summaryEl.innerHTML = `<span class="reviews-empty">No se pudieron cargar las reseñas.</span>`
            return
        }

        const data = await res.json()   // { productId, promedio, total, items }

        if (data.total === 0) {
            summaryEl.innerHTML = `<span class="reviews-empty">Este producto aún no tiene reseñas.</span>`
            return
        }

        summaryEl.innerHTML = `
            <div class="reviews-summary-box">
                <span class="reviews-avg-score">${data.promedio.toFixed(1)}</span>
                <div class="reviews-avg-stars" aria-label="Promedio: ${data.promedio.toFixed(1)} de 5">
                    ${renderStars(data.promedio)}
                </div>
                <span class="reviews-total">${data.total} reseña${data.total !== 1 ? "s" : ""}</span>
            </div>`

        listEl.innerHTML = data.items.map(r => `
            <article class="product-review-item">
                <div class="product-review-item-header">
                    <div class="review-stars" aria-label="Calificación: ${r.calificacion} de 5">
                        ${renderStars(r.calificacion)}
                    </div>
                    <span class="my-review-date">
                        ${new Date(r.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                </div>
                <p class="my-review-comentario">${r.comentario}</p>
            </article>
        `).join("")

    } catch (e) {
        console.error("Error cargando reseñas del producto:", e)
        summaryEl.innerHTML = `<span class="reviews-empty">Error de conexión al cargar reseñas.</span>`
    }
}

// ── Mis reseñas ──────────────────────────────────────────────────
async function openMyReviews() {
    if (!currentUser || currentUser.role !== "comprador") {
        openPlaceholder("Mis reseñas", "Solo los compradores pueden ver sus reseñas.")
        return
    }

    openDashboard("Mis reseñas", `
        <div class="my-reviews-panel" id="myReviewsPanel">
            <div class="buyer-cart-status" id="myReviewsStatus">Cargando reseñas...</div>
            <div class="my-reviews-list" id="myReviewsList"></div>
        </div>
    `)

    const token    = localStorage.getItem("access_token")
    const statusEl = document.getElementById("myReviewsStatus")
    const listEl   = document.getElementById("myReviewsList")
    const authFetch = makeOrderAuthFetch(token)

    function setStatus(msg, kind = "info") {
        statusEl.textContent = msg
        statusEl.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   statusEl.classList.add("is-error")
        if (kind === "success") statusEl.classList.add("is-success")
    }

    function renderStars(rating) {
        return Array.from({ length: 5 }, (_, i) =>
            `<span class="review-star${i < rating ? " filled" : ""}" aria-hidden="true">★</span>`
        ).join("")
    }

    try {
        const res = await authFetch("/api/resenas/mis")
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            if      (res.status === 401) setStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
            else if (res.status === 403) setStatus("No tienes permiso para ver reseñas.", "error")
            else                         setStatus(err.detail || "No fue posible cargar las reseñas.", "error")
            return
        }

        const reviews = await res.json()
        statusEl.classList.add("hidden")

        if (!reviews.length) {
            listEl.innerHTML = `
                <div class="my-orders-empty">
                    <i class="fas fa-star"></i>
                    <p>Aún no has escrito ninguna reseña.</p>
                    <p>Compra y recibe productos para poder reseñarlos.</p>
                </div>`
            return
        }

        listEl.innerHTML = reviews.map(r => `
            <article class="my-review-card">
                <div class="my-review-card-header">
                    <div class="review-stars" aria-label="Calificación: ${r.calificacion} de 5">
                        ${renderStars(r.calificacion)}
                    </div>
                    <span class="my-review-date">
                        ${new Date(r.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                </div>
                <p class="my-review-comentario">${r.comentario}</p>
                <p class="my-review-product-id">Producto: <code>${r.productId}</code></p>
            </article>
        `).join("")

    } catch (e) {
        console.error("Error cargando reseñas:", e)
        setStatus("Error de conexión al cargar las reseñas.", "error")
    }
}

// ── Soporte / PQR — comprador ────────────────────────────────────
async function openMyPQR() {
    if (!currentUser) {
        openPlaceholder("Soporte / PQR", "Debes iniciar sesión para acceder al soporte.")
        return
    }

    openDashboard("Soporte / PQR", `
        <div class="pqr-panel" id="pqrPanel">

            <section class="pqr-create-section">
                <h3 class="pqr-section-heading">Crear ticket</h3>
                <form class="pqr-form" id="pqrCreateForm" novalidate>
                    <div class="pqr-form-row">
                        <label class="pqr-label" for="pqrTipo">Tipo</label>
                        <select class="pqr-select" id="pqrTipo" name="tipo" required>
                            <option value="" disabled selected>Selecciona un tipo…</option>
                            <option value="PETICION">Petición</option>
                            <option value="QUEJA">Queja</option>
                            <option value="RECLAMO">Reclamo</option>
                            <option value="SOPORTE">Soporte técnico</option>
                        </select>
                    </div>
                    <div class="pqr-form-row">
                        <label class="pqr-label" for="pqrAsunto">Asunto</label>
                        <input class="pqr-input" id="pqrAsunto" name="asunto"
                               type="text" placeholder="Resumen breve del problema…"
                               minlength="3" maxlength="200" required />
                    </div>
                    <div class="pqr-form-row">
                        <label class="pqr-label" for="pqrDescripcion">Descripción</label>
                        <textarea class="pqr-textarea" id="pqrDescripcion" name="descripcion"
                                  placeholder="Describe el problema con detalle…"
                                  minlength="5" maxlength="3000" rows="4" required></textarea>
                    </div>
                    <div class="buyer-cart-status hidden" id="pqrCreateStatus"></div>
                    <button type="submit" class="dashboard-action-btn pqr-submit-btn">
                        <i class="fas fa-paper-plane"></i> Enviar ticket
                    </button>
                </form>
            </section>

            <section class="pqr-list-section">
                <h3 class="pqr-section-heading">Mis tickets</h3>
                <div class="buyer-cart-status" id="pqrListStatus">Cargando tickets…</div>
                <div class="pqr-list" id="pqrList"></div>
            </section>

        </div>
    `)

    const token     = localStorage.getItem("access_token")
    const authFetch = makeOrderAuthFetch(token)

    // ── helpers locales ──
    const PQR_TIPO_MAP = {
        PETICION: "Petición",
        QUEJA:    "Queja",
        RECLAMO:  "Reclamo",
        SOPORTE:  "Soporte técnico",
    }

    const PQR_ESTADO_MAP = {
        ABIERTO:    { label: "Abierto",      color: "#7a4800", bg: "#fdf3e7" },
        EN_PROCESO: { label: "En proceso",   color: "#1a5c8e", bg: "#e8f4ff" },
        CERRADO:    { label: "Cerrado",      color: "#0f5c2b", bg: "#d4f5e2" },
    }

    function pqrBadge(estado) {
        const e = PQR_ESTADO_MAP[estado] || { label: estado, color: "#555", bg: "#f0f0f0" }
        return `<span class="pqr-estado-badge" style="color:${e.color};background:${e.bg};">${e.label}</span>`
    }

    function setCreateStatus(msg, kind = "info") {
        const el = document.getElementById("pqrCreateStatus")
        if (!el) return
        el.textContent = msg
        el.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   el.classList.add("is-error")
        if (kind === "success") el.classList.add("is-success")
    }

    function setListStatus(msg, kind = "info") {
        const el = document.getElementById("pqrListStatus")
        if (!el) return
        el.textContent = msg
        el.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   el.classList.add("is-error")
        if (kind === "success") el.classList.add("is-success")
    }

    // ── cargar lista de tickets ──
    async function loadMyTickets() {
        const listEl = document.getElementById("pqrList")
        setListStatus("Cargando tickets…")
        if (listEl) listEl.innerHTML = ""

        try {
            const res = await authFetch("/api/pqr/mis")
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                if      (res.status === 401) setListStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
                else                         setListStatus(err.detail || "No fue posible cargar los tickets.", "error")
                return
            }

            const tickets = await res.json()
            const statusEl = document.getElementById("pqrListStatus")
            if (statusEl) statusEl.classList.add("hidden")

            if (!listEl) return

            if (!tickets.length) {
                listEl.innerHTML = `
                    <div class="my-orders-empty">
                        <i class="fas fa-headset"></i>
                        <p>No tienes tickets de soporte aún.</p>
                        <p>Usa el formulario de arriba para crear uno.</p>
                    </div>`
                return
            }

            listEl.innerHTML = tickets.map(t => `
                <article class="pqr-card">
                    <div class="pqr-card-header">
                        <div class="pqr-card-meta">
                            <span class="pqr-tipo-tag">${PQR_TIPO_MAP[t.tipo] || t.tipo}</span>
                            ${pqrBadge(t.estado)}
                        </div>
                        <span class="pqr-card-date">
                            ${new Date(t.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                    </div>
                    <p class="pqr-card-asunto">${t.asunto}</p>
                    <p class="pqr-card-desc">${t.descripcion}</p>
                    ${t.respuesta ? `
                    <div class="pqr-respuesta">
                        <p class="pqr-respuesta-label"><i class="fas fa-reply"></i> Respuesta del equipo</p>
                        <p class="pqr-respuesta-texto">${t.respuesta}</p>
                    </div>` : ""}
                </article>
            `).join("")

        } catch (e) {
            console.error("Error cargando tickets PQR:", e)
            setListStatus("Error de conexión al cargar los tickets.", "error")
        }
    }

    // ── envío del formulario ──
    document.getElementById("pqrCreateForm").addEventListener("submit", async (e) => {
        e.preventDefault()
        const form       = e.currentTarget
        const submitBtn  = form.querySelector(".pqr-submit-btn")
        const tipo        = form.querySelector("#pqrTipo").value
        const asunto      = form.querySelector("#pqrAsunto").value.trim()
        const descripcion = form.querySelector("#pqrDescripcion").value.trim()

        if (!tipo) {
            setCreateStatus("Selecciona un tipo de ticket.", "error")
            return
        }

        submitBtn.disabled = true
        setCreateStatus("Enviando ticket…")

        try {
            const res = await authFetch("/api/pqr", {
                method: "POST",
                body: { tipo, asunto, descripcion },
            })

            if (res.ok) {
                setCreateStatus("¡Ticket creado con éxito! Te responderemos pronto.", "success")
                form.reset()
                await loadMyTickets()
                return
            }

            const err = await res.json().catch(() => ({}))
            if      (res.status === 401) setCreateStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
            else if (res.status === 422) setCreateStatus("Revisa los campos: " + (err.detail?.[0]?.msg || "datos inválidos."), "error")
            else                         setCreateStatus(err.detail || "No fue posible crear el ticket.", "error")
            submitBtn.disabled = false

        } catch (err) {
            console.error("Error creando ticket PQR:", err)
            setCreateStatus("Error de conexión al enviar el ticket.", "error")
            submitBtn.disabled = false
        }
    })

    await loadMyTickets()
}

// ── Gestión PQR — admin ───────────────────────────────────────────
async function openAdminPQR() {
    if (!currentUser || currentUser.role !== "admin") {
        openPlaceholder("Gestión PQR", "Solo los administradores pueden gestionar tickets.")
        return
    }

    openDashboard("Gestión PQR", `
        <div class="pqr-admin-panel" id="pqrAdminPanel">
            <div class="pqr-admin-filters">
                <label class="pqr-label" for="pqrAdminFilter">Filtrar por estado</label>
                <select class="pqr-select" id="pqrAdminFilter">
                    <option value="">Todos</option>
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="CERRADO">Cerrado</option>
                </select>
            </div>
            <div class="buyer-cart-status" id="pqrAdminStatus">Cargando tickets…</div>
            <div class="pqr-list" id="pqrAdminList"></div>
        </div>
    `)

    const token     = localStorage.getItem("access_token")
    const authFetch = makeOrderAuthFetch(token)

    const PQR_TIPO_MAP = {
        PETICION: "Petición",
        QUEJA:    "Queja",
        RECLAMO:  "Reclamo",
        SOPORTE:  "Soporte técnico",
    }

    const PQR_ESTADO_MAP = {
        ABIERTO:    { label: "Abierto",    color: "#7a4800", bg: "#fdf3e7" },
        EN_PROCESO: { label: "En proceso", color: "#1a5c8e", bg: "#e8f4ff" },
        CERRADO:    { label: "Cerrado",    color: "#0f5c2b", bg: "#d4f5e2" },
    }

    function pqrBadge(estado) {
        const e = PQR_ESTADO_MAP[estado] || { label: estado, color: "#555", bg: "#f0f0f0" }
        return `<span class="pqr-estado-badge" style="color:${e.color};background:${e.bg};">${e.label}</span>`
    }

    function setAdminStatus(msg, kind = "info") {
        const el = document.getElementById("pqrAdminStatus")
        if (!el) return
        el.textContent = msg
        el.classList.remove("hidden", "is-error", "is-success")
        if (kind === "error")   el.classList.add("is-error")
        if (kind === "success") el.classList.add("is-success")
    }

    let allTickets = []

    function renderTickets(tickets) {
        const listEl = document.getElementById("pqrAdminList")
        if (!listEl) return

        if (!tickets.length) {
            listEl.innerHTML = `
                <div class="my-orders-empty">
                    <i class="fas fa-inbox"></i>
                    <p>No hay tickets con este filtro.</p>
                </div>`
            return
        }

        listEl.innerHTML = tickets.map(t => `
            <article class="pqr-card pqr-admin-card" data-ticket-id="${t.id || t._id}">
                <div class="pqr-card-header">
                    <div class="pqr-card-meta">
                        <span class="pqr-tipo-tag">${PQR_TIPO_MAP[t.tipo] || t.tipo}</span>
                        ${pqrBadge(t.estado)}
                    </div>
                    <span class="pqr-card-date">
                        ${new Date(t.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                </div>
                <p class="pqr-card-asunto">${t.asunto}</p>
                <p class="pqr-card-desc">${t.descripcion}</p>

                ${t.respuesta ? `
                <div class="pqr-respuesta">
                    <p class="pqr-respuesta-label"><i class="fas fa-reply"></i> Respuesta enviada</p>
                    <p class="pqr-respuesta-texto">${t.respuesta}</p>
                </div>` : ""}

                <div class="pqr-admin-actions">
                    <div class="pqr-admin-estado-row">
                        <select class="pqr-select pqr-admin-estado-select" style="flex:1;">
                            <option value="">Cambiar estado…</option>
                            ${Object.entries(PQR_ESTADO_MAP).map(([val, { label }]) =>
                                `<option value="${val}" ${t.estado === val ? "selected" : ""}>${label}</option>`
                            ).join("")}
                        </select>
                        <button type="button" class="dashboard-action-btn pqr-admin-estado-btn"
                                style="padding:8px 14px;font-size:0.85rem;background:var(--color-secondary);color:#fff;">
                            Aplicar
                        </button>
                    </div>
                    <div class="pqr-admin-feedback buyer-cart-status hidden"></div>

                    ${!t.respuesta ? `
                    <button type="button" class="pqr-responder-toggle" data-ticket-id="${t.id || t._id}">
                        <i class="fas fa-reply"></i> Responder ticket
                    </button>
                    <div class="pqr-responder-form hidden">
                        <textarea class="pqr-textarea pqr-respuesta-input"
                                  placeholder="Escribe la respuesta al usuario…"
                                  minlength="3" maxlength="3000" rows="3"></textarea>
                        <div class="pqr-responder-actions">
                            <button type="button" class="dashboard-action-btn pqr-responder-btn"
                                    style="flex:1;justify-content:center;background:var(--color-primary-dark);color:#fff;">
                                <i class="fas fa-paper-plane"></i> Enviar respuesta
                            </button>
                            <button type="button" class="pqr-responder-cancel">Cancelar</button>
                        </div>
                    </div>` : ""}
                </div>
            </article>
        `).join("")

        // ── event listeners por tarjeta ──
        listEl.querySelectorAll(".pqr-admin-card").forEach(card => {
            const ticketId  = card.dataset.ticketId
            const feedbackEl = card.querySelector(".pqr-admin-feedback")

            function setFeedback(msg, kind = "info") {
                feedbackEl.textContent = msg
                feedbackEl.classList.remove("hidden", "is-error", "is-success")
                if (kind === "error")   feedbackEl.classList.add("is-error")
                if (kind === "success") feedbackEl.classList.add("is-success")
            }

            // Cambiar estado
            card.querySelector(".pqr-admin-estado-btn")?.addEventListener("click", async () => {
                const select   = card.querySelector(".pqr-admin-estado-select")
                const newEstado = select.value
                if (!newEstado) {
                    setFeedback("Selecciona un estado.", "error")
                    return
                }
                setFeedback("Actualizando estado…")
                try {
                    const res = await authFetch(`/api/pqr/${ticketId}/estado`, {
                        method: "PUT",
                        body: { estado: newEstado },
                    })
                    if (res.ok) {
                        setFeedback("Estado actualizado.", "success")
                        // actualizar badge en la tarjeta sin recargar todo
                        const e = PQR_ESTADO_MAP[newEstado] || { label: newEstado, color: "#555", bg: "#f0f0f0" }
                        card.querySelector(".pqr-estado-badge").textContent = e.label
                        card.querySelector(".pqr-estado-badge").style.color = e.color
                        card.querySelector(".pqr-estado-badge").style.background = e.bg
                        // actualizar en el array local
                        const t = allTickets.find(t => (t.id || t._id) === ticketId)
                        if (t) t.estado = newEstado
                        return
                    }
                    const err = await res.json().catch(() => ({}))
                    if      (res.status === 401) setFeedback("Sesión no válida.", "error")
                    else if (res.status === 403) setFeedback("Sin permiso para cambiar el estado.", "error")
                    else if (res.status === 404) setFeedback("Ticket no encontrado.", "error")
                    else                         setFeedback(err.detail || "No fue posible actualizar.", "error")
                } catch {
                    setFeedback("Error de conexión.", "error")
                }
            })

            // Toggle formulario de respuesta
            card.querySelector(".pqr-responder-toggle")?.addEventListener("click", () => {
                const form = card.querySelector(".pqr-responder-form")
                const isHidden = form.classList.contains("hidden")
                form.classList.toggle("hidden", !isHidden)
                if (isHidden) form.querySelector("textarea")?.focus()
            })

            card.querySelector(".pqr-responder-cancel")?.addEventListener("click", () => {
                card.querySelector(".pqr-responder-form")?.classList.add("hidden")
            })

            // Enviar respuesta
            card.querySelector(".pqr-responder-btn")?.addEventListener("click", async () => {
                const textarea  = card.querySelector(".pqr-respuesta-input")
                const respuesta = textarea.value.trim()
                const sendBtn   = card.querySelector(".pqr-responder-btn")

                if (respuesta.length < 3) {
                    setFeedback("La respuesta debe tener al menos 3 caracteres.", "error")
                    return
                }

                sendBtn.disabled = true
                setFeedback("Enviando respuesta…")

                try {
                    const res = await authFetch(`/api/pqr/${ticketId}/respuesta`, {
                        method: "POST",
                        body: { respuesta },
                    })
                    if (res.ok) {
                        setFeedback("Respuesta enviada correctamente.", "success")
                        // reemplazar sección de respuesta en la tarjeta
                        const actionsEl = card.querySelector(".pqr-admin-actions")
                        card.querySelector(".pqr-responder-toggle")?.remove()
                        card.querySelector(".pqr-responder-form")?.remove()
                        const respBlock = document.createElement("div")
                        respBlock.className = "pqr-respuesta"
                        respBlock.innerHTML = `
                            <p class="pqr-respuesta-label"><i class="fas fa-reply"></i> Respuesta enviada</p>
                            <p class="pqr-respuesta-texto">${respuesta}</p>`
                        actionsEl.insertAdjacentElement("beforebegin", respBlock)
                        const t = allTickets.find(t => (t.id || t._id) === ticketId)
                        if (t) t.respuesta = respuesta
                        return
                    }
                    const err = await res.json().catch(() => ({}))
                    if      (res.status === 401) setFeedback("Sesión no válida.", "error")
                    else if (res.status === 403) setFeedback("Sin permiso para responder.", "error")
                    else if (res.status === 404) setFeedback("Ticket no encontrado.", "error")
                    else                         setFeedback(err.detail || "No fue posible enviar la respuesta.", "error")
                    sendBtn.disabled = false
                } catch {
                    setFeedback("Error de conexión.", "error")
                    sendBtn.disabled = false
                }
            })
        })
    }

    // ── filtro local ──
    document.getElementById("pqrAdminFilter")?.addEventListener("change", (e) => {
        const val     = e.target.value
        const filtered = val ? allTickets.filter(t => t.estado === val) : allTickets
        renderTickets(filtered)
    })

    // ── carga inicial ──
    try {
        const res = await authFetch("/api/pqr")
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            if      (res.status === 401) setAdminStatus("Sesión no válida. Inicia sesión de nuevo.", "error")
            else if (res.status === 403) setAdminStatus("No tienes permiso para ver todos los tickets.", "error")
            else                         setAdminStatus(err.detail || "No fue posible cargar los tickets.", "error")
            return
        }

        allTickets = await res.json()
        document.getElementById("pqrAdminStatus")?.classList.add("hidden")
        renderTickets(allTickets)

    } catch (e) {
        console.error("Error cargando tickets admin PQR:", e)
        setAdminStatus("Error de conexión al cargar los tickets.", "error")
    }
}
