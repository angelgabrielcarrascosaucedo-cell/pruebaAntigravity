/**
 * ==========================================================
 * PromoLocal - Lógica Principal (Vanilla JS)
 * ==========================================================
 */

// 1. ARREGLO DE DATOS DE PRUEBA (MOCK DATA)
// Cada elemento contiene: marca, título, descripción, fechas (inicio/fin) y etiqueta.
const promotionsData = [
  {
    id: 1,
    brand: "Cafetería Aroma & Grano",
    category: "Gastronomía",
    title: "Tardes de café y repostería artesanal",
    description: "Pide cualquier café de especialidad y llévate el segundo totalmente gratis de 4:00 PM a 8:00 PM.",
    startDate: "2026-11-01",
    endDate: "2026-11-15",
    tag: "2x1"
  },
  {
    id: 2,
    brand: "Boutique Urbana",
    category: "Moda & Calzado",
    title: "Cambio de temporada: hasta 60% OFF",
    description: "Liquidación total en abrigos, chaquetas y accesorios seleccionados de temporada hasta agotar existencias.",
    startDate: "2026-11-05",
    endDate: "2026-11-20",
    tag: "Liquidación"
  },
  {
    id: 3,
    brand: "Librería & Papelería Cervantes",
    category: "Educación & Libros",
    title: "Gran venta por remodelación de sucursal",
    description: "Todos los libros de literatura, papelería fina y materiales de arte con 50% de descuento directo en caja.",
    startDate: "2026-11-10",
    endDate: "2026-11-30",
    tag: "Cierre de puertas"
  },
  {
    id: 4,
    brand: "Pizzería Bella Notte",
    category: "Restaurante",
    title: "Pizzas familiares al horno de leña",
    description: "Compra una pizza familiar tradicional de masa madre y recibe la segunda gratis para consumir en salón o llevar.",
    startDate: "2026-11-01",
    endDate: "2026-11-25",
    tag: "2x1"
  }
];

// 2. REFERENCIAS AL DOM
const offersGrid = document.getElementById("offers-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

// Estado de filtrado actual
let activeTag = "all";
let searchTerm = "";

// 3. FUNCIONES DE UTILIDAD

/**
 * Formatea cadenas ISO 'YYYY-MM-DD' a formato legible 'DD MMM'
 * @param {string} dateStr 
 * @returns {string} Fecha formateada
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/**
 * Devuelve la clase CSS correspondiente según la etiqueta de la promoción
 * @param {string} tag 
 * @returns {string} Clase CSS
 */
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

// 4. FUNCIÓN PARA INYECTAR LAS TARJETAS EN EL DOM
/**
 * Renderiza la lista de promociones filtradas en el contenedor principal
 * @param {Array} promotions - Arreglo de promociones a renderizar
 */
function renderPromotions(promotions) {
  // Limpiar contenedor existente
  offersGrid.innerHTML = "";

  // Manejo de estado vacío
  if (promotions.length === 0) {
    emptyState.classList.remove("hidden");
    offersGrid.classList.add("hidden");
    resultsCount.textContent = "0 ofertas encontradas";
    return;
  }

  emptyState.classList.add("hidden");
  offersGrid.classList.remove("hidden");
  resultsCount.textContent = `Mostrando ${promotions.length} ${promotions.length === 1 ? 'oferta' : 'ofertas'}`;

  // Construir e inyectar cada tarjeta
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
        <button class="promo-btn" type="button" onclick="alert('¡Cupón activado para ${promo.brand}!')">
          Ver promo
        </button>
      </footer>
    `;

    offersGrid.appendChild(card);
  });
}

// 5. LÓGICA DE FILTRADO Y BÚSQUEDA COMBINADA
function applyFilters() {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filtered = promotionsData.filter(promo => {
    // Coincidencia con etiqueta seleccionada
    const matchesTag = (activeTag === "all") || (promo.tag.toLowerCase() === activeTag.toLowerCase());

    // Coincidencia con texto buscado (en marca, título o descripción)
    const matchesSearch = (
      promo.brand.toLowerCase().includes(normalizedSearch) ||
      promo.title.toLowerCase().includes(normalizedSearch) ||
      promo.description.toLowerCase().includes(normalizedSearch) ||
      promo.tag.toLowerCase().includes(normalizedSearch)
    );

    return matchesTag && matchesSearch;
  });

  renderPromotions(filtered);
}

// 6. EVENT LISTENERS

// Buscador de texto
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  applyFilters();
});

// Botones de filtro rápido
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Actualizar estilo visual activo
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    // Actualizar filtro y ejecutar
    activeTag = button.getAttribute("data-filter");
    applyFilters();
  });
});

// Botón de restablecer filtros en caso de búsqueda sin resultados
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

// 7. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  renderPromotions(promotionsData);
});
