/**
 * Pokkisham Site-Wide Full CMS & Admin Control Panel Module
 */

class AdminManager {
  constructor() {
    this.isAdminLoggedIn = JSON.parse(sessionStorage.getItem('pokkisham_admin_session')) || false;
    this.orders = this.getDefaultOrders();
    this.customProducts = [...POKKISHAM_DATA.products];
    this.categories = [...POKKISHAM_DATA.categories];
    this.testimonials = [...POKKISHAM_DATA.testimonials];
    this.storeSettings = { ...POKKISHAM_DATA.storeInfo };
    this.init();
  }

  async init() {
    // 1. Fetch live data from Supabase Cloud Database if connected
    await this.fetchProductsFromSupabase();
    await this.fetchCategoriesFromSupabase();
    await this.fetchOrdersFromSupabase();
    await this.fetchTestimonialsFromSupabase();
    await this.fetchStoreSettingsFromSupabase();

    // 2. Keep POKKISHAM_DATA in sync
    POKKISHAM_DATA.products = this.customProducts;
    POKKISHAM_DATA.categories = this.categories;
    POKKISHAM_DATA.testimonials = this.testimonials;
    POKKISHAM_DATA.storeInfo = this.storeSettings;

    // Apply site-wide settings to DOM
    this.applyStoreSettingsToDOM();
    if (typeof renderCategories === 'function') renderCategories();
    if (typeof renderProducts === 'function') renderProducts('all');
    if (typeof renderTestimonials === 'function') renderTestimonials();
  }

  async fetchProductsFromSupabase() {
    if (typeof pokkishamDB !== 'undefined' && pokkishamDB.isCloudEnabled) {
      const dbProducts = await pokkishamDB.getProducts();
      if (dbProducts && dbProducts.length > 0) {
        this.customProducts = dbProducts;
        POKKISHAM_DATA.products = dbProducts;
        if (typeof renderProducts === 'function') renderProducts('all');
      }
    }
  }

  async fetchCategoriesFromSupabase() {
    if (typeof pokkishamDB !== 'undefined' && pokkishamDB.isCloudEnabled) {
      const dbCats = await pokkishamDB.getCategories();
      if (dbCats && dbCats.length > 0) {
        this.categories = dbCats;
        POKKISHAM_DATA.categories = dbCats;
        if (typeof renderCategories === 'function') renderCategories();
      }
    }
  }

  async fetchOrdersFromSupabase() {
    if (typeof pokkishamDB !== 'undefined' && pokkishamDB.isCloudEnabled) {
      const dbOrders = await pokkishamDB.getOrders();
      if (dbOrders) {
        this.orders = dbOrders;
        if (this.isAdminLoggedIn) {
          this.renderOrdersTable();
          this.renderOverview();
        }
      }
    }
  }

  async fetchTestimonialsFromSupabase() {
    if (typeof pokkishamDB !== 'undefined' && pokkishamDB.isCloudEnabled) {
      const dbTest = await pokkishamDB.getTestimonials();
      if (dbTest && dbTest.length > 0) {
        this.testimonials = dbTest;
        POKKISHAM_DATA.testimonials = dbTest;
        if (typeof renderTestimonials === 'function') renderTestimonials();
      }
    }
  }

  async fetchStoreSettingsFromSupabase() {
    if (typeof pokkishamDB !== 'undefined' && pokkishamDB.isCloudEnabled) {
      const dbSettings = await pokkishamDB.getStoreSettings();
      if (dbSettings) {
        this.storeSettings = dbSettings;
        POKKISHAM_DATA.storeInfo = dbSettings;
        this.applyStoreSettingsToDOM();
      }
    }
  }

  getDefaultOrders() {
    return [
      {
        id: 'POK-849201',
        customerName: 'Priya Sundaram',
        phone: '+91 90474 77499',
        address: 'No 45, Cross Street, Thillai Nagar, Trichy - 620018',
        items: 'Wooden Cold Pressed Gingelly Oil (1L x 2), Badam Nuts (250g x 1)',
        paymentMethod: 'UPI / GPay',
        total: 1350.00,
        date: '2026-08-06',
        status: 'Out for Delivery'
      },
      {
        id: 'POK-512940',
        customerName: 'Ravi Kumar',
        phone: '+91 94431 12345',
        address: 'Plot 12, Anna Nagar, Chennai - 600040',
        items: 'Karuppu Kavuni Rice (1Kg x 2), Himalayan Rock Salt (500g x 1)',
        paymentMethod: 'Cash on Delivery',
        total: 340.00,
        date: '2026-08-05',
        status: 'Delivered'
      },
      {
        id: 'POK-391082',
        customerName: 'Meena Lakshmanan',
        phone: '+91 98422 67890',
        address: '14 KK Nagar, Madurai - 625020',
        items: 'Pure Coconut Oil (1L x 1), Traditional Idli Podi (250g x 2)',
        paymentMethod: 'NetBanking',
        total: 430.00,
        date: '2026-08-06',
        status: 'Processing'
      }
    ];
  }

  async saveProducts() {
    POKKISHAM_DATA.products = this.customProducts;
    if (typeof renderProducts === 'function') renderProducts('all');
  }

  async saveCategories() {
    POKKISHAM_DATA.categories = this.categories;
    if (typeof renderCategories === 'function') renderCategories();
  }

  async saveTestimonials() {
    POKKISHAM_DATA.testimonials = this.testimonials;
    if (typeof renderTestimonials === 'function') renderTestimonials();
  }

  async saveOrders() {
    // Orders updated in UI
  }

  async saveStoreSettings(name, phone, whatsapp, email, address, freeShipping, upiId, qrCodeImage, bankName, accNo, ifsc) {
    const existingPs = this.storeSettings.paymentSettings || {};
    this.storeSettings = {
      ...this.storeSettings,
      name: name || this.storeSettings.name,
      phone: phone || this.storeSettings.phone,
      whatsapp: whatsapp || this.storeSettings.whatsapp,
      email: email || this.storeSettings.email,
      address: address || this.storeSettings.address,
      freeShippingThreshold: parseFloat(freeShipping) || 999,
      paymentSettings: {
        upiId: upiId || existingPs.upiId || '9047477499@ybl',
        upiName: this.storeSettings.name || 'Pokkisham Store',
        qrCodeImage: qrCodeImage || existingPs.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=9047477499@ybl&pn=Pokkisham%20Store',
        bankName: bankName || existingPs.bankName || 'State Bank of India',
        accNo: accNo || existingPs.accNo || '39485720194',
        ifsc: ifsc || existingPs.ifsc || 'SBIN0004819'
      }
    };
    if (typeof pokkishamDB !== 'undefined') {
      await pokkishamDB.saveStoreSettings(this.storeSettings);
    }
    POKKISHAM_DATA.storeInfo = this.storeSettings;
    this.applyStoreSettingsToDOM();
    showToast("Store Settings & Payment Methods updated live in Database! ⚙️💳");
  }

  applyStoreSettingsToDOM() {
    if (!this.storeSettings) return;

    // Update Phone numbers in DOM
    const phoneEls = document.querySelectorAll('.site-phone-display');
    phoneEls.forEach(el => el.textContent = this.storeSettings.phone || '');

    // Update Email elements in DOM
    const emailEls = document.querySelectorAll('.site-email-display');
    emailEls.forEach(el => el.textContent = this.storeSettings.email || '');

    // Update Address elements
    const addrEls = document.querySelectorAll('.site-address-display');
    addrEls.forEach(el => el.textContent = this.storeSettings.address || '');
  }

  handleQrImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      document.getElementById('settingQrCodeImage').value = dataUrl;
      const previewImg = document.getElementById('settingQrPreview');
      if (previewImg) previewImg.src = dataUrl;
      showToast("Store QR Code image selected! 📲");
    };
    reader.readAsDataURL(file);
  }

  // --- Settings Form ---
  populateStoreSettingsForm() {
    const s = this.storeSettings;
    const ps = s.paymentSettings || {};
    if (document.getElementById('settingPhone')) document.getElementById('settingPhone').value = s.phone || '';
    if (document.getElementById('settingEmail')) document.getElementById('settingEmail').value = s.email || '';
    if (document.getElementById('settingWhatsapp')) document.getElementById('settingWhatsapp').value = s.whatsapp || '';
    if (document.getElementById('settingAddress')) document.getElementById('settingAddress').value = s.address || '';
    if (document.getElementById('settingFreeShip')) document.getElementById('settingFreeShip').value = s.freeShippingThreshold || 999;
    
    // Payment Settings Form Controls
    if (document.getElementById('settingUpiId')) document.getElementById('settingUpiId').value = ps.upiId || '9047477499@ybl';
    if (document.getElementById('settingQrCodeImage')) document.getElementById('settingQrCodeImage').value = ps.qrCodeImage || '';
    if (document.getElementById('settingQrPreview')) document.getElementById('settingQrPreview').src = ps.qrCodeImage || '';
    if (document.getElementById('settingBankName')) document.getElementById('settingBankName').value = ps.bankName || '';
    if (document.getElementById('settingAccNo')) document.getElementById('settingAccNo').value = ps.accNo || '';
    if (document.getElementById('settingIfsc')) document.getElementById('settingIfsc').value = ps.ifsc || '';
  }

  // --- Render Orders Table ---
  renderOrdersTable() {
    const container = document.getElementById('adminOrdersTableBody');
    if (!container) return;

    container.innerHTML = this.orders.map((o, index) => `
      <tr>
        <td><strong>#${o.id}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">${o.date}</span></td>
        <td>
          <strong>${o.customerName}</strong><br/>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${o.phone}</span>
        </td>
        <td style="max-width: 200px; font-size: 0.82rem;">${o.items}</td>
        <td><strong>₹${o.total.toFixed(2)}</strong></td>
        <td>
          <span style="font-size: 0.8rem; background: var(--bg-cream); padding: 4px 8px; border-radius: 4px; display: inline-block;">${o.paymentMethod}</span>
          ${o.transactionId && o.transactionId !== 'N/A' ? `<br/><span style="font-size: 0.76rem; color: var(--primary); font-weight: 700; display: inline-block; margin-top: 4px;">UTR: ${o.transactionId}</span>` : ''}
        </td>
        <td>
          <select onchange="adminManager.updateOrderStatus(${index}, this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 700;">
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  // --- Admin Login ---
  login(email, password) {
    if ((email.trim().toLowerCase() === 'admin@pokkisham.com' || email.trim().toLowerCase() === 'admin') && password === 'admin123') {
      this.isAdminLoggedIn = true;
      localStorage.setItem('pokkisham_admin_session', 'true');
      showToast("Welcome Admin! Logged into Pokkisham Control Panel. 🔑");
      closeModal('adminLoginModal');
      this.openAdminDashboard();
      return true;
    } else {
      showToast("Invalid admin credentials! Hint: admin@pokkisham.com / admin123", "error");
      return false;
    }
  }

  logout() {
    this.isAdminLoggedIn = false;
    localStorage.removeItem('pokkisham_admin_session');
    closeModal('adminDashboardModal');
    showToast("Logged out from Admin Panel.", "info");
  }

  openAdminDashboard() {
    if (!this.isAdminLoggedIn) {
      openModal('adminLoginModal');
      return;
    }

    this.renderOverview();
    this.renderProductsTable();
    this.renderOrdersTable();
    this.renderCategoriesTable();
    this.renderTestimonialsTable();
    this.renderCustomersTable();
    this.populateStoreSettingsForm();
    openModal('adminDashboardModal');
  }

  // --- Render Overview Tab ---
  renderOverview() {
    const totalSales = this.orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrdersCount = this.orders.length;
    const totalProductsCount = this.customProducts.length;

    document.getElementById('adminStatRevenue').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('adminStatOrders').textContent = totalOrdersCount;
    document.getElementById('adminStatProducts').textContent = totalProductsCount;
  }

  // --- Render Products Table ---
  renderProductsTable() {
    const container = document.getElementById('adminProductsTableBody');
    if (!container) return;

    container.innerHTML = this.customProducts.map((p, index) => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" />
        </td>
        <td>
          <strong>${p.name}</strong><br/>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${p.unit}</span>
        </td>
        <td><span class="product-badge-tag" style="position: static; display: inline-block;">${p.category.toUpperCase()}</span></td>
        <td><strong>₹${p.price.toFixed(2)}</strong></td>
        <td><span style="color: #164E38; font-weight: 700;">In Stock</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminManager.deleteProduct('${p.id}')">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Handle Product Image Upload
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      document.getElementById('newProdImage').value = dataUrl;
      const previewImg = document.getElementById('newProdImagePreview');
      const previewBox = document.getElementById('newProdImagePreviewBox');
      if (previewImg && previewBox) {
        previewImg.src = dataUrl;
        previewBox.style.display = 'block';
      }
      showToast("Product image uploaded successfully! 🖼️");
    };
    reader.readAsDataURL(file);
  }

  openAddProductModal() {
    // Populate category dropdown dynamically
    const catSelect = document.getElementById('newProdCategory');
    if (catSelect) {
      catSelect.innerHTML = this.categories.map(c => `
        <option value="${c.id}">${c.icon || ''} ${c.name}</option>
      `).join('');
    }

    // Reset image preview
    const previewBox = document.getElementById('newProdImagePreviewBox');
    if (previewBox) previewBox.style.display = 'none';

    const fileInput = document.getElementById('newProdFileInput');
    if (fileInput) fileInput.value = '';

    openModal('adminAddProductModal');
  }

  // --- Add Product ---
  async addProduct(name, category, price, oldPrice, unit, badge, image, description) {
    const newProd = {
      id: 'prod-' + Date.now(),
      name: name,
      category: category,
      badge: badge || 'New Arrival',
      rating: 5,
      reviewsCount: 1,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      unit: unit,
      variants: [unit],
      variantPrices: { [unit]: parseFloat(price) },
      image: image || 'assets/images/hero_banner.jpg',
      description: description || 'Fresh wooden cold pressed store produce.',
      inStock: true
    };

    if (typeof pokkishamDB !== 'undefined') {
      await pokkishamDB.saveProduct(newProd);
    }

    this.customProducts.unshift(newProd);
    this.saveProducts();
    this.renderProductsTable();
    this.renderOverview();
    closeModal('adminAddProductModal');
    showToast(`Added product "${name}" to store database! 🎉`);
  }

  async deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product from store?")) {
      if (typeof pokkishamDB !== 'undefined') {
        await pokkishamDB.deleteProduct(productId);
      }
      this.customProducts = this.customProducts.filter(p => p.id !== productId);
      this.saveProducts();
      this.renderProductsTable();
      this.renderOverview();
      showToast("Product deleted from database.");
    }
  }

  // --- Category Customizer CMS ---
  renderCategoriesTable() {
    const container = document.getElementById('adminCategoriesTableBody');
    if (!container) return;

    container.innerHTML = this.categories.map((c, index) => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">${c.icon || '🛍️'}</span>
            <img src="${c.image || 'assets/images/gingelly_oil.jpg'}" alt="${c.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
          </div>
        </td>
        <td><strong>${c.name}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">ID: ${c.id}</span></td>
        <td><span class="category-badge">${c.badge}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminManager.openEditCategoryModal(${index})">
              ✏️ Edit
            </button>
            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminManager.deleteCategory(${index})">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  addCategory(name, badge, icon, image) {
    const catId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newCat = {
      id: catId || 'cat_' + Date.now(),
      name: name,
      badge: badge || '6+ Products',
      icon: icon || '🌿',
      image: image || 'assets/images/gingelly_oil.jpg',
      description: '100% natural organic products.'
    };

    this.categories.push(newCat);
    this.saveCategories();
    this.renderCategoriesTable();
    closeModal('adminAddCategoryModal');
    showToast(`Added Custom Category "${name}"! 🎉`);
  }

  openEditCategoryModal(index) {
    const cat = this.categories[index];
    if (!cat) return;

    document.getElementById('editCatIndex').value = index;
    document.getElementById('editCatName').value = cat.name;
    document.getElementById('editCatBadge').value = cat.badge || '';
    document.getElementById('editCatIcon').value = cat.icon || '🌿';
    document.getElementById('editCatImage').value = cat.image || '';

    openModal('adminEditCategoryModal');
  }

  updateCategory(index, name, badge, icon, image) {
    if (this.categories[index]) {
      this.categories[index].name = name;
      this.categories[index].badge = badge || '6+ Products';
      this.categories[index].icon = icon || '🌿';
      this.categories[index].image = image || 'assets/images/gingelly_oil.jpg';

      this.saveCategories();
      this.renderCategoriesTable();
      closeModal('adminEditCategoryModal');
      showToast(`Category "${name}" updated successfully! ✨`);
    }
  }

  deleteCategory(index) {
    if (confirm("Are you sure you want to delete this category from the site?")) {
      const removed = this.categories.splice(index, 1);
      this.saveCategories();
      this.renderCategoriesTable();
      showToast(`Category "${removed[0]?.name}" deleted.`);
    }
  }

  // --- Testimonial CMS ---
  renderTestimonialsTable() {
    const container = document.getElementById('adminTestimonialsTableBody');
    if (!container) return;

    container.innerHTML = this.testimonials.map((t, index) => `
      <tr>
        <td><strong>${t.name}</strong> (${t.location || 'Tamil Nadu'})</td>
        <td><span style="color: #F5A623;">${'★'.repeat(t.rating)}</span></td>
        <td style="font-size: 0.85rem; font-style: italic;">"${t.comment}"</td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminManager.deleteTestimonial(${index})">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  addTestimonial(name, location, rating, comment) {
    const newT = {
      id: Date.now(),
      name: name,
      location: location || 'Tamil Nadu',
      rating: parseInt(rating) || 5,
      comment: comment
    };

    this.testimonials.unshift(newT);
    this.saveTestimonials();
    this.renderTestimonialsTable();
    closeModal('adminAddTestimonialModal');
    showToast(`Added testimonial review from ${name}!`);
  }

  deleteTestimonial(index) {
    if (confirm("Remove this customer review?")) {
      this.testimonials.splice(index, 1);
      this.saveTestimonials();
      this.renderTestimonialsTable();
      showToast("Review removed.");
    }
  }

  // --- Settings Form ---
  populateStoreSettingsForm() {
    const s = this.storeSettings;
    if (document.getElementById('settingPhone')) document.getElementById('settingPhone').value = s.phone || '';
    if (document.getElementById('settingEmail')) document.getElementById('settingEmail').value = s.email || '';
    if (document.getElementById('settingWhatsapp')) document.getElementById('settingWhatsapp').value = s.whatsapp || '';
    if (document.getElementById('settingAddress')) document.getElementById('settingAddress').value = s.address || '';
    if (document.getElementById('settingFreeShip')) document.getElementById('settingFreeShip').value = s.freeShippingThreshold || 999;
  }

  // --- Render Orders Table ---
  renderOrdersTable() {
    const container = document.getElementById('adminOrdersTableBody');
    if (!container) return;

    container.innerHTML = this.orders.map((o, index) => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>
          <strong>${o.customerName}</strong><br/>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${o.phone}</span>
        </td>
        <td style="max-width: 200px; font-size: 0.82rem;">${o.items}</td>
        <td><strong>₹${o.total.toFixed(2)}</strong></td>
        <td><span style="font-size: 0.8rem; background: var(--bg-cream); padding: 4px 8px; border-radius: 4px;">${o.paymentMethod}</span></td>
        <td>
          <select onchange="adminManager.updateOrderStatus(${index}, this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 700;">
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  async updateOrderStatus(index, newStatus) {
    if (this.orders[index]) {
      const order = this.orders[index];
      order.status = newStatus;
      if (typeof pokkishamDB !== 'undefined') {
        await pokkishamDB.updateOrderStatus(order.id, newStatus);
      }
      showToast(`Order #${order.id} status updated to "${newStatus}"! 🚚`);
    }
  }

  async addOrderFromCheckout(newOrder) {
    if (typeof pokkishamDB !== 'undefined') {
      await pokkishamDB.insertOrder(newOrder);
    }
    this.orders.unshift(newOrder);
    if (this.isAdminLoggedIn) {
      this.renderOrdersTable();
      this.renderOverview();
    }
  }

  // --- Render Customers Table ---
  renderCustomersTable() {
    const container = document.getElementById('adminCustomersTableBody');
    if (!container) return;

    const registeredUser = authManager ? authManager.currentUser : null;
    const customers = [
      { name: 'Priya Sundaram', email: 'priya.s@example.com', orders: 4, joined: '2025-11-12' },
      { name: 'Ravi Kumar', email: 'ravi.k@example.com', orders: 2, joined: '2026-01-20' },
      { name: 'Meena Lakshmanan', email: 'meena.l@example.com', orders: 5, joined: '2025-08-15' }
    ];

    if (registeredUser) {
      customers.unshift({
        name: registeredUser.fullName,
        email: registeredUser.email,
        orders: 1,
        joined: new Date(registeredUser.createdAt).toLocaleDateString()
      });
    }

    container.innerHTML = customers.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.orders} orders</td>
        <td>${c.joined}</td>
      </tr>
    `).join('');
  }
}

const adminManager = new AdminManager();

// Tab Switcher inside Admin Dashboard
function switchAdminTab(tabId) {
  const tabs = ['overview', 'products', 'categories', 'orders', 'testimonials', 'customers', 'settings'];
  tabs.forEach(t => {
    const section = document.getElementById(`adminTabContent-${t}`);
    const btn = document.getElementById(`adminTabBtn-${t}`);
    if (section) section.style.display = (t === tabId) ? 'block' : 'none';
    if (btn) {
      if (t === tabId) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
}
