/**
 * Pokkisham Cart & Wishlist State Management
 */

class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('pokkisham_cart')) || [];
    this.appliedCoupon = JSON.parse(localStorage.getItem('pokkisham_coupon')) || null;
    this.init();
  }

  init() {
    this.updateCartCountUI();
  }

  save() {
    localStorage.setItem('pokkisham_cart', JSON.stringify(this.cart));
    localStorage.setItem('pokkisham_coupon', JSON.stringify(this.appliedCoupon));
    this.updateCartCountUI();
    this.renderCartDrawer();
  }

  addItem(productId, selectedVariant = null, quantity = 1) {
    const product = POKKISHAM_DATA.products.find(p => p.id === productId);
    if (!product) return;

    const variant = selectedVariant || product.unit;
    const price = product.variantPrices ? product.variantPrices[variant] : product.price;

    const existingIndex = this.cart.findIndex(
      item => item.id === productId && item.variant === variant
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        variant: variant,
        unitPrice: price,
        quantity: quantity
      });
    }

    this.save();
    showToast(`Added ${product.name} (${variant}) to your cart!`);
    openCartDrawer();
  }

  updateQuantity(index, delta) {
    if (this.cart[index]) {
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.cart.splice(index, 1);
      }
      this.save();
    }
  }

  removeItem(index) {
    if (this.cart[index]) {
      const removed = this.cart.splice(index, 1);
      this.save();
      showToast(`Removed ${removed[0].name} from cart`);
    }
  }

  clear() {
    this.cart = [];
    this.appliedCoupon = null;
    this.save();
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getDiscount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotal();
    const coupon = POKKISHAM_DATA.coupons[this.appliedCoupon];
    if (!coupon) return 0;

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return 0; // requirement not met
    }

    if (coupon.discountPercent) {
      return Math.round((subtotal * coupon.discountPercent) / 100);
    }
    if (coupon.fixedDiscount) {
      return coupon.fixedDiscount;
    }
    return 0;
  }

  getShippingCost() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= POKKISHAM_DATA.storeInfo.freeShippingThreshold ? 0 : 60;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscount();
    const shipping = this.getShippingCost();
    return Math.max(0, subtotal - discount + shipping);
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    if (POKKISHAM_DATA.coupons[cleanCode]) {
      const coupon = POKKISHAM_DATA.coupons[cleanCode];
      const subtotal = this.getSubtotal();
      if (coupon.minSpend && subtotal < coupon.minSpend) {
        showToast(`Coupon requires minimum spend of ₹${coupon.minSpend}`, 'warning');
        return false;
      }
      this.appliedCoupon = cleanCode;
      this.save();
      showToast(`Coupon '${cleanCode}' applied successfully! 🎉`);
      return true;
    } else {
      showToast(`Invalid coupon code. Try 'POKKISHAM10'`, 'error');
      return false;
    }
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.save();
    showToast('Coupon removed');
  }

  updateCartCountUI() {
    const count = this.cart.reduce((total, item) => total + item.quantity, 0);
    const countBadges = document.querySelectorAll('.cart-count-badge');
    countBadges.forEach(badge => badge.textContent = count);
  }

  renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 10px;">🛍️</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--primary);">Your Cart is Empty</h4>
          <p style="font-size: 0.85rem; margin-top: 6px;">Browse our 100% natural cold pressed oils and groceries!</p>
        </div>
      `;
    } else {
      container.innerHTML = this.cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">Variant: ${item.variant}</div>
            <div style="font-weight: 700; color: var(--primary); margin-top: 4px;">₹${item.unitPrice.toFixed(2)}</div>
            <div class="cart-qty-controls">
              <button class="qty-btn" onclick="cartManager.updateQuantity(${index}, -1)">-</button>
              <span style="font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
              <button class="qty-btn" onclick="cartManager.updateQuantity(${index}, 1)">+</button>
              <button onclick="cartManager.removeItem(${index})" style="margin-left: auto; color: #d9534f; font-size: 0.8rem;">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Subtotal, Discount & Total UI
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShippingCost();
    const total = this.getTotal();

    document.getElementById('cartSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `-₹${discount.toFixed(2)}`;
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;

    // Free shipping progress bar
    const threshold = POKKISHAM_DATA.storeInfo.freeShippingThreshold;
    const progressFill = document.getElementById('freeShippingProgressFill');
    const progressText = document.getElementById('freeShippingText');
    if (progressFill && progressText) {
      if (subtotal >= threshold) {
        progressFill.style.width = '100%';
        progressText.innerHTML = `🎉 You unlocked <strong>FREE Shipping!</strong>`;
      } else {
        const remaining = threshold - subtotal;
        const percentage = Math.min(100, (subtotal / threshold) * 100);
        progressFill.style.width = `${percentage}%`;
        progressText.innerHTML = `Add <strong>₹${remaining.toFixed(2)}</strong> more to get <strong>FREE Delivery!</strong>`;
      }
    }
  }
}

const cartManager = new CartManager();
