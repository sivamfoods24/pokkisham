/**
 * Pokkisham Modals & Drawer Management
 */

// Open / Close Cart Drawer
function openCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.add('open');
  cartManager.renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('open');
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Quick View Modal
function openQuickView(productId) {
  const product = POKKISHAM_DATA.products.find(p => p.id === productId);
  if (!product) return;

  const content = document.getElementById('quickViewContent');
  let selectedVariant = product.unit;

  const renderQuickView = () => {
    const currentPrice = product.variantPrices ? product.variantPrices[selectedVariant] : product.price;
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
        <div style="border-radius: var(--radius-md); overflow: hidden; background: var(--bg-cream);">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 280px; object-fit: cover;" />
        </div>
        <div>
          <span class="hero-tag" style="margin-bottom: 8px;">${product.badge}</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--primary); margin-bottom: 8px;">${product.name}</h3>
          <div style="display: flex; gap: 4px; color: #F5A623; margin-bottom: 12px; font-size: 0.9rem;">
            ${'★'.repeat(product.rating)} <span style="color: var(--text-muted); font-size: 0.8rem;">(${product.reviewsCount} reviews)</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">${product.description}</p>

          <label style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 6px;">Select Packaging Size:</label>
          <select id="quickViewVariantSelect" class="product-weight-selector" style="margin-bottom: 16px;">
            ${product.variants.map(v => `<option value="${v}" ${v === selectedVariant ? 'selected' : ''}>${v} - ₹${product.variantPrices ? product.variantPrices[v] : product.price}</option>`).join('')}
          </select>

          <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px;">
            <span style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--primary);" id="quickViewPrice">₹${currentPrice.toFixed(2)}</span>
            ${product.oldPrice ? `<span style="text-decoration: line-through; color: var(--text-light); font-size: 0.95rem;">₹${(currentPrice * 1.15).toFixed(2)}</span>` : ''}
          </div>

          <div style="display: flex; gap: 12px;">
            <input type="number" id="quickViewQty" value="1" min="1" max="10" style="width: 60px; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); text-align: center; font-weight: 700;" />
            <button class="btn btn-primary" style="flex: 1;" onclick="handleQuickAdd('${product.id}')">
              🛒 ADD TO CART
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('quickViewVariantSelect').addEventListener('change', (e) => {
      selectedVariant = e.target.value;
      const newPrice = product.variantPrices ? product.variantPrices[selectedVariant] : product.price;
      document.getElementById('quickViewPrice').textContent = `₹${newPrice.toFixed(2)}`;
    });
  };

  renderQuickView();
  openModal('quickViewModal');
}

function handleQuickAdd(productId) {
  const select = document.getElementById('quickViewVariantSelect');
  const qtyInput = document.getElementById('quickViewQty');
  const variant = select ? select.value : null;
  const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  cartManager.addItem(productId, variant, qty);
  closeModal('quickViewModal');
}

// Search Modal Filter
function handleSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('searchResults');

  if (query.length < 2) {
    resultsContainer.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted); text-align: center; padding: 20px;">Type at least 2 characters to search products...</p>`;
    return;
  }

  const matches = POKKISHAM_DATA.products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<p style="font-size: 0.88rem; color: var(--text-muted); text-align: center; padding: 20px;">No products found matching "${query}"</p>`;
  } else {
    resultsContainer.innerHTML = matches.map(p => `
      <div style="display: flex; align-items: center; gap: 14px; padding: 10px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="openQuickView('${p.id}'); closeModal('searchModal');">
        <img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" />
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--primary);">${p.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${p.unit}</div>
        </div>
        <div style="font-weight: 800; color: var(--primary);">₹${p.price.toFixed(2)}</div>
      </div>
    `).join('');
  }
}

// Visual Progress Stepper Component
function renderTrackingStepper(status) {
  const isProc = status === 'Processing' || status === 'Out for Delivery' || status === 'Delivered';
  const isOut = status === 'Out for Delivery' || status === 'Delivered';
  const isDel = status === 'Delivered';

  return `
    <div style="display: flex; justify-content: space-between; position: relative; margin: 20px 0 10px; padding: 0 10px;">
      <div style="position: absolute; top: 16px; left: 30px; right: 30px; height: 4px; background: #e0e0e0; z-index: 1;"></div>
      <div style="position: absolute; top: 16px; left: 30px; width: ${isDel ? '85%' : (isOut ? '55%' : '25%')}; height: 4px; background: var(--primary); z-index: 2; transition: all 0.5s ease;"></div>

      <div style="position: relative; z-index: 3; text-align: center;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-weight: 700; font-size: 0.8rem;">✓</div>
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">Placed</div>
      </div>

      <div style="position: relative; z-index: 3; text-align: center;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isProc ? 'var(--primary)' : '#e0e0e0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-weight: 700; font-size: 0.8rem;">${isProc ? '✓' : '2'}</div>
        <div style="font-size: 0.72rem; font-weight: ${isProc ? '700' : '400'}; color: ${isProc ? 'var(--primary)' : 'var(--text-muted)'};">Packing</div>
      </div>

      <div style="position: relative; z-index: 3; text-align: center;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isOut ? 'var(--primary)' : '#e0e0e0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-weight: 700; font-size: 0.8rem;">${isOut ? '✓' : '3'}</div>
        <div style="font-size: 0.72rem; font-weight: ${isOut ? '700' : '400'}; color: ${isOut ? 'var(--primary)' : 'var(--text-muted)'};">On The Way</div>
      </div>

      <div style="position: relative; z-index: 3; text-align: center;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isDel ? '#164E38' : '#e0e0e0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-weight: 700; font-size: 0.8rem;">${isDel ? '✓' : '4'}</div>
        <div style="font-size: 0.72rem; font-weight: ${isDel ? '700' : '400'}; color: ${isDel ? '#164E38' : 'var(--text-muted)'};">Delivered</div>
      </div>
    </div>
  `;
}

// Order Tracking System
function trackOrder(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('trackOrderId');
  const orderId = inputEl ? inputEl.value.trim().toUpperCase() : '';
  const resultBox = document.getElementById('trackingResult');

  if (!orderId || !resultBox) return;

  const cleanId = orderId.replace('#', '');
  const allOrders = (typeof adminManager !== 'undefined' && adminManager.orders) 
    ? adminManager.orders 
    : JSON.parse(localStorage.getItem('pokkisham_admin_orders')) || [];

  const foundOrder = allOrders.find(o => o.id.toUpperCase() === cleanId || o.id.toUpperCase() === 'POK-' + cleanId);

  const status = foundOrder ? foundOrder.status : 'Out for Delivery';
  const customerName = foundOrder ? foundOrder.customerName : 'Customer';
  const itemsText = foundOrder ? foundOrder.items : 'Pokkisham Store Produce';

  resultBox.innerHTML = `
    <div style="margin-top: 18px; padding: 16px; background: var(--bg-white); border-radius: var(--radius-sm); border: 1px solid var(--border-color); border-left: 4px solid var(--primary); box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 700; color: var(--primary); font-size: 1rem;">Order #${foundOrder ? foundOrder.id : cleanId}</div>
        <span style="font-size: 0.8rem; font-weight: 700; background: var(--bg-cream); color: var(--primary); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-color);">
          ${status === 'Delivered' ? '✅ Delivered' : (status === 'Out for Delivery' ? '🚚 Out for Delivery' : '⚙️ Processing')}
        </span>
      </div>

      <div style="font-size: 0.85rem; color: var(--text-dark); margin: 8px 0 4px; font-weight: 600;">Customer: ${customerName}</div>
      <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">Items: ${itemsText}</div>

      <!-- Visual Progress Stepper -->
      ${renderTrackingStepper(status)}

      <div style="font-size: 0.8rem; background: var(--bg-cream); padding: 8px 12px; border-radius: 4px; color: var(--text-muted); margin-top: 14px; text-align: center;">
        ${status === 'Delivered' 
          ? '🎉 Package delivered successfully! Thank you for choosing Pokkisham.' 
          : (status === 'Out for Delivery' 
            ? '🚚 Out for delivery with local mill express courier. Expected today by 6 PM.' 
            : '⚙️ Order received & currently undergoing traditional wooden chekku extraction & packing.')
        }
      </div>
    </div>
  `;
}

function trackOrderById(orderId) {
  closeModal('accountDashboardModal');
  const inputEl = document.getElementById('trackOrderId');
  if (inputEl) inputEl.value = orderId;
  openModal('trackingModal');
  trackOrder(null);
}

// Copy UPI ID helper function
function copyUpiId() {
  const upiId = POKKISHAM_DATA.storeInfo.paymentSettings?.upiId || "9047477499@ybl";
  navigator.clipboard.writeText(upiId).then(() => {
    showToast(`UPI ID "${upiId}" copied to clipboard! 📋`);
  }).catch(err => {
    showToast(`UPI ID: ${upiId}`);
  });
}

// Open Specific Mobile UPI App (Google Pay, PhonePe, Paytm, Universal UPI) via iOS/Android Cross-Platform Intent Schemes
function openUpiApp(appName) {
  const ps = POKKISHAM_DATA.storeInfo.paymentSettings || {};
  const upiId = ps.upiId || "9047477499@ybl";
  const payeeName = encodeURIComponent(ps.upiName || POKKISHAM_DATA.storeInfo.name || "Pokkisham Store");
  const amount = cartManager ? cartManager.getTotal().toFixed(2) : "0.00";
  const note = encodeURIComponent("Pokkisham Store Order Payment");

  // Detect iOS vs Android
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

  // Standard Universal UPI URI (Works on iOS & Android native apps)
  const standardUpiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;

  let targetUri = standardUpiUri;

  if (isIOS) {
    // iOS Specific Scheme Handlers & Fallbacks
    if (appName === 'gpay') {
      targetUri = `gpay://upi/pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (appName === 'phonepe') {
      targetUri = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (appName === 'paytm') {
      targetUri = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else {
      targetUri = standardUpiUri;
    }
  } else {
    // Android Specific App Scheme Handlers
    if (appName === 'gpay') {
      targetUri = `tez://upi/pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (appName === 'phonepe') {
      targetUri = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (appName === 'paytm') {
      targetUri = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else {
      targetUri = standardUpiUri;
    }
  }

  const appDisplayName = appName ? appName.toUpperCase() : "UPI App";
  showToast(`Opening ${appDisplayName} for ₹${amount} payment... 📲`, 'info');

  // Copy UPI ID to Clipboard automatically for smooth pasting inside app
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(upiId).catch(() => {});
  }

  // Mobile Web Intent Launcher
  try {
    const a = document.createElement('a');
    a.href = targetUri;
    a.rel = 'noopener';
    a.click();
  } catch (err) {
    window.location.href = targetUri;
  }
}

function togglePaymentDetails() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
  const upiBox = document.getElementById('checkoutUpiBox');

  if (upiBox) {
    if (paymentMethod && paymentMethod.includes('UPI')) {
      upiBox.style.display = 'block';
    } else {
      upiBox.style.display = 'none';
    }
  }
}

// Checkout Execution Wizard
function openCheckout() {
  if (cartManager.cart.length === 0) {
    showToast('Your cart is empty!', 'warning');
    return;
  }

  // Check if customer is logged in
  if (!authManager.currentUser) {
    authManager.pendingCheckout = true;
    showToast('Please sign in or register to proceed to checkout.', 'info');
    closeCartDrawer();
    openModal('accountModal');
    return;
  }

  closeCartDrawer();
  
  // Pre-fill customer details if available
  const nameInput = document.getElementById('checkoutName');
  if (nameInput && authManager.currentUser.fullName) {
    nameInput.value = authManager.currentUser.fullName;
  }

  const total = cartManager.getTotal();
  document.getElementById('checkoutPayableTotal').textContent = `₹${total.toFixed(2)}`;
  
  // Update UPI display in checkout modal
  const upiDisplay = document.getElementById('checkoutUpiDisplay');
  const qrDisplay = document.getElementById('checkoutQrImage');
  const ps = POKKISHAM_DATA.storeInfo.paymentSettings || {};
  if (upiDisplay) upiDisplay.textContent = ps.upiId || '9047477499@ybl';
  if (qrDisplay) qrDisplay.src = ps.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=9047477499@ybl&pn=Pokkisham%20Store';

  togglePaymentDetails();
  openModal('checkoutModal');
}

function processCheckout(e) {
  if (e) {
    e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }

  const name = document.getElementById('checkoutName')?.value.trim() || '';
  const phone = document.getElementById('checkoutPhone')?.value.trim() || '';
  const address = document.getElementById('checkoutAddress')?.value.trim() || '';

  if (!name) {
    showToast('Please enter your Customer Name.', 'warning');
    return false;
  }
  if (!phone) {
    showToast('Please enter your Phone Number.', 'warning');
    return false;
  }
  if (!address) {
    showToast('Please enter your Delivery Address.', 'warning');
    return false;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery';
  const transactionId = document.getElementById('checkoutTransactionId')?.value.trim() || '';

  // Mandatory Transaction ID check when paying via UPI
  if (paymentMethod.includes('UPI') && (!transactionId || transactionId.length < 4)) {
    showToast('Please enter your Payment Transaction ID / UTR No after paying via UPI! 📲', 'warning');
    const txnInput = document.getElementById('checkoutTransactionId');
    if (txnInput) {
      txnInput.focus();
      txnInput.style.border = '2px solid red';
      setTimeout(() => { txnInput.style.border = '1px solid var(--border-color)'; }, 3500);
    }
    return false;
  }

  const orderNum = 'POK-' + Math.floor(100000 + Math.random() * 900000);
  const itemsSummary = cartManager.cart.map(i => `${i.name} (${i.variant} x ${i.quantity})`).join(', ');
  const orderTotal = cartManager.getTotal();
  const ps = POKKISHAM_DATA.storeInfo.paymentSettings || {};

  // Add order to admin manager
  try {
    if (typeof adminManager !== 'undefined' && adminManager) {
      adminManager.addOrderFromCheckout({
        id: orderNum,
        customerName: name,
        phone: phone,
        address: address,
        items: itemsSummary,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        total: orderTotal,
        date: new Date().toISOString().split('T')[0],
        status: 'Processing'
      });
    }
  } catch (err) {
    console.warn("Admin order recording note:", err);
  }

  closeModal('checkoutModal');

  // Trigger receipt popup modal with QR Code, UPI ID, Copy button, and Transaction ID
  document.getElementById('successOrderDetails').innerHTML = `
    <div style="text-align: center; padding: 10px;">
      <div style="font-size: 3rem; margin-bottom: 8px;">🎉</div>
      <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--primary);">Thank You, ${name}!</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin: 4px 0 14px;">Your order #${orderNum} has been received.</p>

      ${paymentMethod.includes('UPI') ? `
        <div style="background: var(--bg-white); border: 2px solid var(--accent); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 16px; text-align: center;">
          <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 10px;">📱 Pay via Instant Mobile App</div>

          <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
            <button type="button" class="btn" onclick="openUpiApp('gpay')" style="flex: 1; background: #4285F4; color: white; border: none; font-size: 0.78rem; font-weight: 700; padding: 8px 6px; border-radius: 6px;">🔵 GPay</button>
            <button type="button" class="btn" onclick="openUpiApp('phonepe')" style="flex: 1; background: #5f259f; color: white; border: none; font-size: 0.78rem; font-weight: 700; padding: 8px 6px; border-radius: 6px;">🟣 PhonePe</button>
            <button type="button" class="btn" onclick="openUpiApp('paytm')" style="flex: 1; background: #00baf2; color: white; border: none; font-size: 0.78rem; font-weight: 700; padding: 8px 6px; border-radius: 6px;">🔷 Paytm</button>
            <button type="button" class="btn" onclick="openUpiApp('any')" style="flex: 1; background: var(--primary); color: white; border: none; font-size: 0.78rem; font-weight: 700; padding: 8px 6px; border-radius: 6px;">📲 All Apps</button>
          </div>
          
          <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin-bottom: 10px;">
            <img src="${ps.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=9047477499@ybl&pn=Pokkisham%20Store'}" alt="UPI QR Code" style="width: 170px; height: 170px; border-radius: 8px; border: 2px solid var(--primary); display: block; margin: 0 auto; object-fit: contain; background: white; padding: 6px; box-shadow: var(--shadow-sm);" />
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
            <strong style="font-size: 1rem; color: var(--primary);">${ps.upiId || '9047477499@ybl'}</strong>
            <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; border-color: var(--primary); color: var(--primary);" onclick="copyUpiId()">
              📋 Copy UPI ID
            </button>
          </div>

          <div style="font-size: 0.82rem; background: var(--bg-cream); padding: 6px 12px; border-radius: 4px; display: inline-block;">
            Transaction ID / UTR Recorded: <strong style="color: var(--primary);">${transactionId}</strong>
          </div>
        </div>
      ` : ''}
      
      <div style="background: var(--bg-cream); padding: 14px; border-radius: var(--radius-sm); text-align: left; font-size: 0.85rem; margin-bottom: 16px; border-left: 4px solid var(--primary);">
        <div><strong>Order ID:</strong> #${orderNum}</div>
        <div><strong>Total Amount:</strong> ₹${orderTotal.toFixed(2)}</div>
        <div><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</div>
        ${paymentMethod.includes('UPI') ? `<div><strong>UTR / Txn ID:</strong> ${transactionId}</div>` : ''}
        <div><strong>Delivery Address:</strong> ${address}</div>
        <div><strong>Contact Phone:</strong> ${phone}</div>
      </div>
      
      <p style="font-size: 0.8rem; color: var(--text-muted);">Order confirmation updates will be sent via SMS / WhatsApp to ${phone}.</p>
    </div>
  `;

  cartManager.clear();
  const txnInput = document.getElementById('checkoutTransactionId');
  if (txnInput) txnInput.value = '';
  openModal('orderSuccessModal');
}

// WhatsApp Direct Order Wizard
function orderViaWhatsApp(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const nameInput = document.getElementById('checkoutName');
  const phoneInput = document.getElementById('checkoutPhone');
  const addressInput = document.getElementById('checkoutAddress');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';

  if (!name || !phone || !address) {
    showToast('Please fill in your Name, Phone Number, and Delivery Address first!', 'warning');
    return false;
  }

  const items = cartManager.cart;
  if (!items || items.length === 0) {
    showToast('Your cart is empty!', 'warning');
    return false;
  }

  const orderNum = 'POK-WA-' + Math.floor(100000 + Math.random() * 900000);
  const total = cartManager.getTotal();

  // Format clean products list for WhatsApp message
  let itemsListText = items.map((item, idx) => 
    `• *${item.name}* (${item.variant}) x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  // Formatted WhatsApp Message
  const textMessage = 
`🌾 *POKKISHAM COLD PRESSED OIL MILL* 🌾
*NEW DIRECT WHATSAPP ORDER (#${orderNum})*
---------------------------------------
👤 *Customer Name:* ${name}
📞 *Phone Number:* ${phone}
📍 *Delivery Address:* ${address}

📦 *ORDERED ITEMS:*
${itemsListText}

💰 *TOTAL PAYABLE:* ₹${total.toFixed(2)}
💳 *Payment Mode:* Direct Mill Order / Pay on Delivery
---------------------------------------
Please confirm my order & delivery status. Thank you! 🙏`;

  const cleanPhone = "919047477499";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textMessage)}`;

  // Record order in Admin Panel
  try {
    if (typeof adminManager !== 'undefined' && adminManager) {
      adminManager.addOrderFromCheckout({
        id: orderNum,
        customerName: name,
        phone: phone,
        address: address,
        items: items.map(i => `${i.name} (${i.variant} x ${i.quantity})`).join(', '),
        paymentMethod: 'WhatsApp Direct Order',
        transactionId: 'N/A (WhatsApp Order)',
        total: total,
        date: new Date().toISOString().split('T')[0],
        status: 'Processing'
      });
    }
  } catch (err) {
    console.warn("Admin order recording note:", err);
  }

  cartManager.clear();
  closeModal('checkoutModal');

  // Immediate location redirect to bypass popup blockers on mobile & desktop
  showToast('Opening WhatsApp to send your order... 📲');
  setTimeout(() => {
    window.location.href = whatsappUrl;
  }, 250);

  return false;
}
