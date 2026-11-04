/**
 * ==========================================================
 * PromoLocal - Lógica Principal (Vanilla JS)
 * ==========================================================
 */

// 1. ARREGLO DE DATOS DE PRUEBA (MOCK DATA)
// Incluye marcas, títulos, descripciones, categorías, fechas, etiquetas,
// horarios, direcciones, reglas, redes sociales y configuración de eventos web con cupos.
const promotionsData = [
  {
    id: 1,
    brand: "CinePlanet Central",
    category: "Entretenimiento",
    title: "Avant-Première Exclusiva Online: Entradas 2x1",
    description: "Consigue tus pases dobles digitales para el estreno del festival de cine independiente en nuestra plataforma web.",
    startDate: "2026-11-01",
    endDate: "2026-11-15",
    tag: "2x1",
    schedule: "Funciones digitales continuas 24/7",
    address: "Evento 100% Online / Canje en plataforma web",
    rules: [
      "Válido exclusivamente para usuarios registrados en la web",
      "Límite de 1 pase doble por cuenta de usuario",
      "Cupos limitados hasta agotar existencias",
      "El código generado tiene vigencia de 48 horas"
    ],
    socialMedia: {
      instagram: "@cineplanet_central",
      facebook: "CinePlanetCentralOficial",
      whatsapp: "+51 912 345 678"
    },
    // Propiedades para evento web con cupos limitados
    isWebEvent: true,
    slots: 2,                     // Cupos directos disponibles (puedes hacer clic para reclamar hasta 0)
    videoRewardAvailable: true,   // Oportunidad por video publicitario disponible (no reclamado aún)
    paidReserveStock: 1,          // Cupo de reserva para la opción de pago
    userClaimedCode: null         // Código asignado si el usuario gana
  },
  {
    id: 2,
    brand: "Burger Fest Virtual",
    category: "Gastronomía",
    title: "Combo Fest Artesanal: 50% de descuento web",
    description: "Disfruta de la mejor hamburguesa artesanal con papas rústicas solicitando tu cupón digital exclusivo para delivery.",
    startDate: "2026-11-05",
    endDate: "2026-11-20",
    tag: "Liquidación",
    schedule: "Atención pedidos web: 12:00 PM - 11:00 PM",
    address: "Plataforma de delivery web con cobertura local",
    rules: [
      "Válido únicamente mediante pedidos en la app o web oficial",
      "Promoción sujeta a cobertura de entrega a domicilio",
      "Máximo 1 cupón de descuento por orden"
    ],
    socialMedia: {
      instagram: "@burgerfest_virtual",
      twitter: "@BurgerFestWeb"
    },
    // Evento web con cupos directos AGOTADOS (slots: 0) para probar de inmediato las 2 oportunidades alternativas
    isWebEvent: true,
    slots: 0,
    videoRewardAvailable: true,   // El cupo de video aún está libre; si intentas pagar, te guiará aquí sin cobrar
    paidReserveStock: 0,          // Stock agotado: simula la protección al usuario (no cobra/reembolsa)
    userClaimedCode: null
  },
  {
    id: 3,
    brand: "Cafetería Aroma & Grano",
    category: "Cafetería",
    title: "Tardes de café y repostería artesanal",
    description: "Pide cualquier café de especialidad y llévate el segundo totalmente gratis de 4:00 PM a 8:00 PM en nuestro salón.",
    startDate: "2026-11-01",
    endDate: "2026-11-15",
    tag: "2x1",
    schedule: "Lunes a Sábado: 8:00 AM - 9:00 PM | Domingo: 9:00 AM - 2:00 PM",
    address: "Calle Los Sauces 412, San Isidro",
    rules: [
      "Consumo exclusivo en salón físico",
      "Aplica para cafés americano, cappuccino, flat white y latte",
      "No acumulable con otras ofertas o promociones bancarias"
    ],
    socialMedia: {
      instagram: "@aroma_y_grano",
      facebook: "AromaYGranoOficial"
    },
    isWebEvent: false // Local físico: no requiere botón de participación web
  },
  {
    id: 4,
    brand: "Ferretería & Pinturas El Roble",
    category: "Hogar & Construcción",
    title: "Liquidación total por cierre de sucursal",
    description: "Descuentos de hasta 50% en pinturas impermeabilizantes, barnices y herramientas eléctricas por mudanza.",
    startDate: "2026-11-10",
    endDate: "2026-11-30",
    tag: "Cierre de puertas",
    schedule: "Lunes a Viernes: 8:00 AM - 6:30 PM | Sábados: 8:30 AM - 2:00 PM",
    address: "Av. Industrial 885, Zona Comercial",
    rules: [
      "Pago únicamente en efectivo, tarjeta de débito o transferencia",
      "No se aceptan cambios ni devoluciones en artículos en liquidación",
      "Hasta agotar existencias físicas en tienda"
    ],
    socialMedia: null, // Caso de prueba sin redes sociales registradas
    isWebEvent: false
  }
];

// 2. REFERENCIAS AL DOM
const offersGrid = document.getElementById("offers-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

// Referencias del Modal
const promoModal = document.getElementById("promo-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalContent = document.getElementById("modal-content");

// Estado global de filtrado
let activeTag = "all";
let searchTerm = "";
let currentOpenPromoId = null;

// 3. FUNCIONES DE UTILIDAD
function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function getBadgeClass(tag) {
  switch (tag.toLowerCase()) {
    case "2x1":
      return "badge-2x1";
    case "liquidación":
    case "liquidacion":
      return "badge-liquidacion";
    case "cierre de puertas":
      return "badge-cierre";
    default:
      return "badge-default";
  }
}

// 4. RENDERIZADO DE LAS TARJETAS EN EL CATÁLOGO
function renderPromotions(promotions) {
  offersGrid.innerHTML = "";

  if (promotions.length === 0) {
    emptyState.classList.remove("hidden");
    offersGrid.classList.add("hidden");
    resultsCount.textContent = "0 ofertas encontradas";
    return;
  }

  emptyState.classList.add("hidden");
  offersGrid.classList.remove("hidden");
  resultsCount.textContent = `Mostrando ${promotions.length} ${promotions.length === 1 ? 'oferta' : 'ofertas'}`;

  promotions.forEach(promo => {
    const card = document.createElement("article");
    card.className = "promo-card";

    const badgeClass = getBadgeClass(promo.tag);
    const formattedStart = formatDate(promo.startDate);
    const formattedEnd = formatDate(promo.endDate);

    card.innerHTML = `
      <div class="promo-card-top">
        <header class="promo-card-header">
          <div class="brand-info">
            <span class="promo-category">${promo.category || 'Comercio Local'}</span>
            <h2 class="promo-brand">${promo.brand}</h2>
          </div>
          <span class="promo-badge ${badgeClass}">${promo.tag}</span>
        </header>

        <div class="promo-body">
          <h3 class="promo-title">${promo.title}</h3>
          <p class="promo-description">${promo.description}</p>
        </div>
      </div>

      <footer class="promo-footer">
        <div class="promo-dates">
          <span class="promo-dates-icon" aria-hidden="true">📅</span>
          <span>Del <strong>${formattedStart}</strong> al <strong>${formattedEnd}</strong></span>
        </div>
        <button class="promo-btn" type="button" data-id="${promo.id}">
          🔍 Ver promo
        </button>
      </footer>
    `;

    // Asignar evento al botón "Ver promo" para abrir el Modal
    const btnVerPromo = card.querySelector(".promo-btn");
    btnVerPromo.addEventListener("click", () => openModal(promo.id));

    offersGrid.appendChild(card);
  });
}

// 5. LÓGICA DEL BUSCADOR DE TEXTO
// Filtra estrictamente verificando si coincide con el título, la descripción o la 'categoría' de la tienda
function applyFilters() {
  const query = searchTerm.trim().toLowerCase();

  const filtered = promotionsData.filter(promo => {
    // Filtro rápido por etiqueta (Todas, 2x1, Liquidación, etc.)
    const matchesTag = (activeTag === "all") || (promo.tag.toLowerCase() === activeTag.toLowerCase());

    // Verificación requerida: Título, Descripción o Categoría
    const matchesTitle = promo.title ? promo.title.toLowerCase().includes(query) : false;
    const matchesDescription = promo.description ? promo.description.toLowerCase().includes(query) : false;
    const matchesCategory = promo.category ? promo.category.toLowerCase().includes(query) : false;

    const matchesSearch = (query === "") || (matchesTitle || matchesDescription || matchesCategory);

    return matchesTag && matchesSearch;
  });

  renderPromotions(filtered);
}

// 6. COMPONENTE MODAL SUPERPUESTO
function openModal(promoId) {
  const promo = promotionsData.find(item => item.id === promoId);
  if (!promo) return;

  currentOpenPromoId = promo.id;
  renderModalBody(promo);
  promoModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Evitar scroll del fondo
}

function closeModal() {
  promoModal.classList.add("hidden");
  document.body.style.overflow = "auto";
  currentOpenPromoId = null;
}

// Renderiza dinámicamente todo el contenido interno del modal
function renderModalBody(promo) {
  const badgeClass = getBadgeClass(promo.tag);
  const formattedStart = formatDate(promo.startDate);
  const formattedEnd = formatDate(promo.endDate);

  // Generar HTML de redes sociales
  let socialMediaHtml = "";
  if (promo.socialMedia && Object.keys(promo.socialMedia).length > 0) {
    const socialButtons = Object.entries(promo.socialMedia).map(([network, handle]) => {
      let icon = "🌐";
      let netName = network.charAt(0).toUpperCase() + network.slice(1);
      if (network.toLowerCase() === "instagram") icon = "📸";
      if (network.toLowerCase() === "facebook") icon = "📘";
      if (network.toLowerCase() === "whatsapp") icon = "💬";
      if (network.toLowerCase() === "twitter") icon = "🐦";

      return `
        <button class="social-btn ${network.toLowerCase()}" 
          type="button" 
          onclick="handleSocialClick('${netName}', '${promo.brand}', '${handle}')">
          <span>${icon}</span>
          <span>${netName}: <strong>${handle}</strong></span>
        </button>
      `;
    }).join("");

    socialMediaHtml = `
      <div class="social-buttons-container">
        ${socialButtons}
      </div>
    `;
  } else {
    socialMediaHtml = `
      <p class="no-social-message">
        <span>ℹ️</span> Este local no cuenta con redes sociales registradas actualmente.
      </p>
    `;
  }

  // Generar lista de reglas
  const rulesListHtml = (promo.rules && promo.rules.length > 0)
    ? promo.rules.map(rule => `<li>${rule}</li>`).join("")
    : "<li>Aplican términos y condiciones generales del comercio.</li>";

  // Generar sección de participación web (SOLO si el evento es web)
  let webParticipationHtml = "";
  if (promo.isWebEvent) {
    webParticipationHtml = generateWebParticipationMarkup(promo);
  }

  modalContent.innerHTML = `
    <header class="modal-header">
      <div class="modal-top-tags">
        <span class="modal-category-tag">${promo.category}</span>
        <span class="promo-badge ${badgeClass}">${promo.tag}</span>
        ${promo.isWebEvent ? '<span class="modal-web-tag">💻 Evento Web</span>' : ''}
      </div>
      <h2 class="modal-brand" id="modal-promo-title">${promo.brand}</h2>
      <h3 class="modal-title">${promo.title}</h3>
    </header>

    <p class="modal-description">${promo.description}</p>

    <!-- Información detallada del local -->
    <div class="modal-info-grid">
      <div class="info-item">
        <span class="info-icon">🕒</span>
        <div class="info-text">
          <strong>Horario de atención</strong>
          <span>${promo.schedule || 'Consultar directamente con el comercio'}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">📍</span>
        <div class="info-text">
          <strong>Ubicación</strong>
          <span>${promo.address || 'Ubicación local no especificada'}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">📅</span>
        <div class="info-text">
          <strong>Período de validez</strong>
          <span>Del ${formattedStart} al ${formattedEnd}</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-icon">🏷️</span>
        <div class="info-text">
          <strong>Tipo de beneficio</strong>
          <span>${promo.tag}</span>
        </div>
      </div>
    </div>

    <!-- Reglas y condiciones -->
    <div class="modal-rules-box">
      <h4 class="modal-rules-title">📌 Reglas y condiciones de la promoción:</h4>
      <ul class="modal-rules-list">
        ${rulesListHtml}
      </ul>
    </div>

    <!-- Redes Sociales -->
    <div class="modal-social-section">
      <h4 class="modal-social-title">📱 Redes Sociales del Comercio:</h4>
      ${socialMediaHtml}
    </div>

    <!-- Función Nueva: Participación en Evento Web -->
    ${webParticipationHtml}
  `;
}

// Simulación de navegación a redes sociales con alerta
window.handleSocialClick = function(network, brand, handle) {
  alert(`Redirigiendo al perfil oficial de ${network} de "${brand}" (${handle})...\nEnlace verificado.`);
};

// 7. FUNCIÓN NUEVA: PARTICIPACIÓN EN EVENTOS WEB Y GESTIÓN DE CUPOS
function generateWebParticipationMarkup(promo) {
  // Caso 1: El usuario ya reclamó su cupón con éxito
  if (promo.userClaimedCode) {
    return `
      <section class="web-participation-section">
        <div class="participation-header">
          <span class="participation-title">🎉 ¡Promoción Obtenida!</span>
        </div>
        <div class="participation-result-box success">
          <p><strong>¡Felicitaciones!</strong> Has asegurado tu promoción para <strong>${promo.brand}</strong>.</p>
          <p style="margin-top: 0.35rem;">Tu código digital exclusivo es: <strong style="font-size: 1.1rem; letter-spacing: 0.05em; background: #fff; padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px dashed #059669;">${promo.userClaimedCode}</strong></p>
        </div>
      </section>
    `;
  }

  // Caso 2: Todavía quedan cupos directos (slots > 0)
  if (promo.slots > 0) {
    return `
      <section class="web-participation-section">
        <div class="participation-header">
          <span class="participation-title">🌐 Evento Web Exclusivo</span>
          <span class="slots-counter-badge available">Quedan ${promo.slots} ${promo.slots === 1 ? 'cupo' : 'cupos'}</span>
        </div>
        <p style="font-size: 0.85rem; color: #4338ca;">
          Este es un evento digital con cupos limitados. Haz clic a continuación para reclamar tu beneficio antes de que se agote.
        </p>
        <button class="participate-action-btn" type="button" onclick="claimDirectSlot(${promo.id})">
          🎟️ Participar y reclamar cupo ahora
        </button>
      </section>
    `;
  }

  // Caso 3: Cupos directos AGOTADOS (slots === 0)
  // Se revelan las 2 oportunidades (Video de suerte y Opción con tarifa protegida)
  return `
    <section class="web-participation-section">
      <div class="participation-header">
        <span class="participation-title">🌐 Evento Web: Cupos Directos</span>
        <span class="slots-counter-badge exhausted">¡Cupos Agotados!</span>
      </div>

      <div class="opportunities-box">
        <p class="opportunities-intro">
          Los cupos directos para este evento web se han terminado. Sin embargo, se han habilitado <strong>dos oportunidades alternativas</strong> para conseguir la promoción:
        </p>

        <div id="guidance-banner-container"></div>

        <!-- OPORTUNIDAD 1: Video Publicitario (Gratuito con suerte) -->
        <div class="opportunity-card" id="card-video-chance">
          <h5 class="opportunity-title">
            <span>🎬 Oportunidad 1: Video Publicitario (Gratis)</span>
          </h5>
          <p class="opportunity-desc">
            Mira un breve anuncio publicitario patrocinado y pon a prueba tu suerte con nuestro algoritmo aleatorio para desbloquear la promoción sin costo.
          </p>
          ${promo.videoRewardAvailable 
            ? `
              <div id="video-sim-wrapper">
                <button class="btn-video-chance" type="button" onclick="startVideoAdSimulation(${promo.id})">
                  ▶️ Ver video publicitario y probar suerte
                </button>
              </div>
            `
            : `
              <div class="participation-result-box info">
                ℹ️ La oportunidad por video publicitario ya ha sido utilizada en este local.
              </div>
            `
          }
        </div>

        <!-- OPORTUNIDAD 2: Verificación de cupo de reserva con Tarifa -->
        <div class="opportunity-card" id="card-paid-chance">
          <h5 class="opportunity-title">
            <span>💳 Oportunidad 2: Verificación de reserva con Tarifa ($2.50)</span>
          </h5>
          <p class="opportunity-desc">
            Consulta si el sistema cuenta con alguna plaza de reserva especial. Si se encuentra agotada de forma definitiva, se cancelará la operación y no se te cobrará nada.
          </p>
          <button class="btn-paid-chance" type="button" onclick="handlePaidReserveCheck(${promo.id})">
            💲 Consultar cupo pagando tarifa ($2.50)
          </button>
        </div>

        <div id="action-result-feedback"></div>
      </div>
    </section>
  `;
}

// Acción: Reclamar cupo directo mientras queden disponibles
window.claimDirectSlot = function(promoId) {
  const promo = promotionsData.find(p => p.id === promoId);
  if (!promo || promo.slots <= 0) return;

  promo.slots -= 1;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  promo.userClaimedCode = `WEB-DIRECT-${randomSuffix}`;

  renderModalBody(promo);
  applyFilters(); // Refresca catálogo si fuera necesario
};

// Acción: Simular visualización de video publicitario y evaluar índice de suerte
window.startVideoAdSimulation = function(promoId) {
  const promo = promotionsData.find(p => p.id === promoId);
  if (!promo || !promo.videoRewardAvailable) return;

  const wrapper = document.getElementById("video-sim-wrapper");
  if (!wrapper) return;

  // Interfaz de reproducción simulada del video publicitario
  wrapper.innerHTML = `
    <div class="video-sim-container">
      <span class="video-sim-title">📺 Reproduciendo anuncio de marca patrocinadora...</span>
      <div class="video-progress-bar">
        <div class="video-progress-fill" id="ad-progress-fill"></div>
      </div>
      <span class="video-sim-countdown" id="ad-countdown">Espera 3 segundos para el sorteo de suerte...</span>
    </div>
  `;

  const fill = document.getElementById("ad-progress-fill");
  const countdown = document.getElementById("ad-countdown");
  let timeLeft = 3;

  const interval = setInterval(() => {
    timeLeft--;
    if (fill) fill.style.width = `${((3 - timeLeft) / 3) * 100}%`;
    if (countdown) countdown.textContent = `Espera ${timeLeft} ${timeLeft === 1 ? 'segundo' : 'segundos'} para el sorteo de suerte...`;

    if (timeLeft <= 0) {
      clearInterval(interval);
      evaluateVideoLuck(promo);
    }
  }, 1000);
};

// Evaluación de la suerte tras el video publicitario
function evaluateVideoLuck(promo) {
  // Índice aleatorio de suerte (50% de probabilidad)
  const luckIndex = Math.random();
  const isLuckyWinner = luckIndex >= 0.45;

  const feedbackContainer = document.getElementById("action-result-feedback");

  if (isLuckyWinner) {
    promo.videoRewardAvailable = false;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    promo.userClaimedCode = `SUERTE-AD-${randomSuffix}`;

    renderModalBody(promo);
  } else {
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="participation-result-box warning">
          <strong>🎲 Resultado del sorteo:</strong> No tuviste suerte en este intento de video (Índice de suerte: ${(luckIndex * 100).toFixed(0)}%).
          <br>Puedes intentar la otra opción disponible o consultar nuevamente más tarde.
        </div>
      `;
    }
    const wrapper = document.getElementById("video-sim-wrapper");
    if (wrapper) {
      wrapper.innerHTML = `
        <button class="btn-video-chance" type="button" onclick="startVideoAdSimulation(${promo.id})">
          🔁 Intentar ver otro video publicitario
        </button>
      `;
    }
  }
}

// Acción: Verificación de cupo pagado con protección y regla de guía al video
window.handlePaidReserveCheck = function(promoId) {
  const promo = promotionsData.find(p => p.id === promoId);
  if (!promo) return;

  const bannerContainer = document.getElementById("guidance-banner-container");
  const feedbackContainer = document.getElementById("action-result-feedback");
  const videoCard = document.getElementById("card-video-chance");

  // REGLA CLAVE:
  // "si el cupo sigue vigente en el lado del video publicitario entonces guialo alli, no cobres, que solo lo guie para esa parte (en caso el de alli aun no haya sido reclamado, o que no le haya tocado a nadie)"
  if (promo.videoRewardAvailable) {
    if (bannerContainer) {
      bannerContainer.innerHTML = `
        <div class="guidance-banner">
          <span style="font-size: 1.25rem;">💡</span>
          <div>
            <strong>¡Aún tienes una oportunidad gratuita disponible!</strong>
            <p>El cupo por <strong>Video Publicitario</strong> sigue vigente y no ha sido reclamado aún. Te hemos guiado hacia allí para que pruebes tu suerte primero sin gastar dinero.</p>
          </div>
        </div>
      `;
    }

    // Resaltar visualmente la tarjeta de video para guiar al usuario
    if (videoCard) {
      videoCard.classList.add("highlight");
      videoCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (feedbackContainer) {
      feedbackContainer.innerHTML = "";
    }
    return; // NO cobra ni continúa con la opción de pago
  }

  // Si el cupo de video ya no está disponible (ya fue reclamado), se procede con la opción de pago:
  if (promo.paidReserveStock > 0) {
    // Hay reserva disponible: asigna cupo
    promo.paidReserveStock -= 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    promo.userClaimedCode = `VIP-RESERVA-${randomSuffix}`;

    alert(`¡Verificación de reserva exitosa!\nSe encontró 1 cupo disponible. El cobro de la tarifa ($2.50) ha sido procesado.`);
    renderModalBody(promo);
  } else {
    // NO hay cupos en reserva:
    // "en caso no haya y el cliente haya colocado esta opcion entonces debe regresarlo e indicar que se ha agotado realmente para que el usuario no pierda dinero"
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="participation-result-box danger">
          <strong>⛔ Promoción 100% agotada:</strong>
          <p>Tras consultar con el servidor central, se confirmó que las reservas para esta promoción se han terminado en su totalidad.</p>
          <p style="margin-top: 0.35rem;"><strong>Protección al cliente:</strong> No se ha realizado ningún cobro de tarifa ($0.00 cobrados) para evitar que pierdas dinero.</p>
        </div>
      `;
    }

    alert(`Aviso de disponibilidad:\nLa promoción está realmente agotada en su totalidad.\nNo se ha realizado ningún cobro para que no pierdas tu dinero.`);
  }
};

// 8. EVENT LISTENERS
// Buscador de texto en tiempo real
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  applyFilters();
});

// Botones de filtro rápido
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    activeTag = button.getAttribute("data-filter");
    applyFilters();
  });
});

// Botón de restablecer filtros
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", () => {
    searchTerm = "";
    activeTag = "all";
    searchInput.value = "";

    filterButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-filter") === "all");
    });

    applyFilters();
  });
}

// Eventos de cierre del Modal
modalCloseBtn.addEventListener("click", closeModal);

// Clic fuera del contenedor para cerrar
promoModal.addEventListener("click", (e) => {
  if (e.target === promoModal) {
    closeModal();
  }
});

// Cerrar con tecla Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !promoModal.classList.contains("hidden")) {
    closeModal();
  }
});

// 9. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  renderPromotions(promotionsData);
});
