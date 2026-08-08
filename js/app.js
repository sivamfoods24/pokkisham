/**
 * Pokkisham Main Application Initialization & Event Handlers
 */

// Toast Notifications System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.innerHTML = `
    <span>🍃</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Render Category Filter Tabs
function renderCategoryTabs() {
  const container = document.querySelector('.product-filter-tabs');
  if (!container) return;

  const categories = POKKISHAM_DATA.categories;
  container.innerHTML = `
    <button class="filter-tab active" data-category="all" onclick="filterProductsByCategory('all')">All Products</button>
    ${categories.map(c => `<button class="filter-tab" data-category="${c.id}" onclick="filterProductsByCategory('${c.id}')">${c.name}</button>`).join('')}
  `;
}

// Render Categories
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (grid) {
    grid.innerHTML = POKKISHAM_DATA.categories.map(cat => `
      <div class="category-card" onclick="filterProductsByCategory('${cat.id}')">
        <div class="category-thumb">
          <img src="${cat.image}" alt="${cat.name}" />
        </div>
        <h4 class="category-name">${cat.icon || ''} ${cat.name}</h4>
        <span class="category-badge">${cat.badge}</span>
      </div>
    `).join('');
  }

  renderCategoryTabs();
}

// Render Product Cards
function renderProducts(categoryFilter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  let products = POKKISHAM_DATA.products;
  if (categoryFilter !== 'all') {
    products = products.filter(p => p.category === categoryFilter);
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <span class="product-badge-tag">${product.badge}</span>
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" />
        <button class="quick-view-overlay-btn" onclick="openQuickView('${product.id}')">
          👁️ Quick View
        </button>
      </div>
      
      <h3 class="product-title">${product.name}</h3>
      
      <select class="product-weight-selector" id="variant-${product.id}" onchange="updateProductCardPrice('${product.id}')">
        ${product.variants.map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>

      <div class="product-price-row">
        <span class="current-price" id="price-${product.id}">₹${product.price.toFixed(2)}</span>
        ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice.toFixed(2)}</span>` : ''}
      </div>

      <button class="add-cart-btn" onclick="handleCardAddToCart('${product.id}')">
        🛒 ADD TO CART
      </button>
    </div>
  `).join('');
}

// Dynamic Price Update on Product Card selector
function updateProductCardPrice(productId) {
  const product = POKKISHAM_DATA.products.find(p => p.id === productId);
  const select = document.getElementById(`variant-${productId}`);
  const priceDisplay = document.getElementById(`price-${productId}`);

  if (product && select && priceDisplay) {
    const selectedVariant = select.value;
    const newPrice = product.variantPrices ? product.variantPrices[selectedVariant] : product.price;
    priceDisplay.textContent = `₹${newPrice.toFixed(2)}`;
  }
}

function handleCardAddToCart(productId) {
  const select = document.getElementById(`variant-${productId}`);
  const variant = select ? select.value : null;
  cartManager.addItem(productId, variant, 1);
}

function filterProductsByCategory(categoryId) {
  // Update active tab buttons
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    if (tab.dataset.category === categoryId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderProducts(categoryId);

  // Scroll smoothly to best sellers section
  const section = document.getElementById('bestSellersSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Render Testimonials
function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;

  grid.innerHTML = POKKISHAM_DATA.testimonials.map(item => `
    <div class="testimonial-card">
      <div class="quote-icon">“</div>
      <p class="testimonial-text">"${item.comment}"</p>
      <div>
        <div class="customer-author">- ${item.name}</div>
        <div class="star-rating">${'★'.repeat(item.rating)}</div>
      </div>
    </div>
  `).join('');
}

// Hero Banner Carousel Slider Logic
let currentSlide = 0;
const totalSlides = 3;
let slideInterval = null;

function goToHeroSlide(index) {
  currentSlide = (index + totalSlides) % totalSlides;
  const track = document.getElementById('heroSliderTrack');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (track) {
    track.style.transform = `translateX(-${(currentSlide * 100) / totalSlides}%)`;
  }

  slides.forEach((slide, i) => {
    if (i === currentSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  dots.forEach((dot, i) => {
    if (i === currentSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function startHeroAutoSlide() {
  stopHeroAutoSlide();
  slideInterval = setInterval(() => {
    goToHeroSlide(currentSlide + 1);
  }, 4500);
}

function stopHeroAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts('all');
  renderTestimonials();

  // Initialize Hero Slider Controls
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const dotsWrap = document.getElementById('heroDotsWrap');
  const heroSection = document.getElementById('heroSliderSection');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToHeroSlide(currentSlide - 1);
      startHeroAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToHeroSlide(currentSlide + 1);
      startHeroAutoSlide();
    });
  }

  if (dotsWrap) {
    dotsWrap.addEventListener('click', (e) => {
      if (e.target.classList.contains('hero-dot')) {
        const slideIndex = parseInt(e.target.dataset.slide);
        if (!isNaN(slideIndex)) {
          goToHeroSlide(slideIndex);
          startHeroAutoSlide();
        }
      }
    });
  }

  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopHeroAutoSlide);
    heroSection.addEventListener('mouseleave', startHeroAutoSlide);

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;
    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        goToHeroSlide(currentSlide + 1); // Swipe left
        startHeroAutoSlide();
      } else if (touchEndX - touchStartX > 50) {
        goToHeroSlide(currentSlide - 1); // Swipe right
        startHeroAutoSlide();
      }
    }, { passive: true });
  }

  // Start auto-play
  startHeroAutoSlide();

  // Search input event listener
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  // Header scroll sticky shadow effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (header) {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 6px 25px rgba(15, 57, 43, 0.12)';
      } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
      }
    }
  });
});
