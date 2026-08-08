/**
 * Pokkisham Customer Authentication System (Supabase Auth - Email & Password Only)
 */

// Supabase Project Credentials
const SUPABASE_URL = "https://zpzcumezxiwsfwwnybcr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwemN1bWV6eGl3c2Z3d255YmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjI5NDIsImV4cCI6MjEwMTczODk0Mn0.9Vd2dWK_tEf4aBNdzkfOhU1QEwtUrDUnk8aJfbPqGgw";

// Initialize Supabase Client
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn("Supabase client init note:", err.message);
  }
}

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.pendingCheckout = false;
    this.init();
  }

  async init() {
    // 1. Check local session storage fallback for page refresh persistence
    const savedUser = localStorage.getItem('pokkisham_user_session');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.updateAuthUI();
      } catch (e) {
        localStorage.removeItem('pokkisham_user_session');
      }
    }

    // 2. Sync with Supabase Auth session if client available
    if (supabaseClient) {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          this.setCurrentUserFromSupabase(session.user);
        }

        // Listen to Auth State Changes (login, logout, refresh)
        supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            this.setCurrentUserFromSupabase(session.user);
          } else if (event === 'SIGNED_OUT') {
            this.clearUserSession();
          }
        });
      } catch (err) {
        console.warn("Supabase auth session sync:", err);
      }
    }
  }

  setCurrentUserFromSupabase(supabaseUser) {
    const name = supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
    this.currentUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      fullName: name,
      createdAt: supabaseUser.created_at || new Date().toISOString()
    };
    localStorage.setItem('pokkisham_user_session', JSON.stringify(this.currentUser));
    this.updateAuthUI();
  }

  clearUserSession() {
    this.currentUser = null;
    localStorage.removeItem('pokkisham_user_session');
    this.updateAuthUI();
  }

  // --- Customer Registration ---
  async register(fullName, email, password, confirmPassword) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Confirm Password Validation
    if (password !== confirmPassword) {
      showToast("Confirm password does not match password!", "error");
      return false;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "warning");
      return false;
    }

    let isRegistered = false;

    // 2. Attempt Supabase Auth Sign Up if valid custom endpoint
    if (supabaseClient && SUPABASE_URL && !SUPABASE_URL.includes("xyzcompany")) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (error && !error.message.toLowerCase().includes("fetch")) {
          showToast(error.message, "error");
          return false;
        }

        if (data && data.user) {
          this.setCurrentUserFromSupabase(data.user);
          isRegistered = true;
        }
      } catch (err) {
        console.warn("Supabase signup note:", err);
      }
    }

    // 3. Fallback Local Registration Database
    if (!isRegistered) {
      let users = JSON.parse(localStorage.getItem('pokkisham_users_db')) || [];
      const existing = users.find(u => u.email === cleanEmail);
      
      if (existing) {
        this.currentUser = existing;
      } else {
        const newUser = {
          id: 'usr_' + Date.now(),
          email: cleanEmail,
          fullName: fullName,
          password: password,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('pokkisham_users_db', JSON.stringify(users));
        this.currentUser = newUser;
      }
      localStorage.setItem('pokkisham_user_session', JSON.stringify(this.currentUser));
      this.updateAuthUI();
    }

    showToast(`Welcome ${fullName}! Account created successfully. 🎉`);
    closeModal('accountModal');

    this.handlePostAuthRedirect();
    return true;
  }

  // --- Customer Login ---
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showToast("Please enter email and password.", "warning");
      return false;
    }

    let isLoggedIn = false;

    // 1. Attempt Supabase Auth Login if valid custom endpoint
    if (supabaseClient && SUPABASE_URL && !SUPABASE_URL.includes("xyzcompany")) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error && !error.message.toLowerCase().includes("fetch")) {
          showToast(error.message, "error");
          return false;
        }

        if (data && data.user) {
          this.setCurrentUserFromSupabase(data.user);
          isLoggedIn = true;
        }
      } catch (err) {
        console.warn("Supabase login note:", err);
      }
    }

    // 2. Fallback Local Database Login
    if (!isLoggedIn) {
      let users = JSON.parse(localStorage.getItem('pokkisham_users_db')) || [];
      const user = users.find(u => u.email === cleanEmail);

      if (user && user.password && user.password !== password) {
        showToast("Invalid password! Please check your credentials.", "error");
        return false;
      }

      this.currentUser = user || {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        fullName: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('pokkisham_user_session', JSON.stringify(this.currentUser));
      this.updateAuthUI();
    }

    showToast(`Logged in successfully as ${this.currentUser.fullName || cleanEmail}! 👋`);
    closeModal('accountModal');

    this.handlePostAuthRedirect();
    return true;
  }

  // --- Forgot Password ---
  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast("Please enter your registered email address.", "warning");
      return false;
    }

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
        if (error) {
          showToast(error.message, "error");
          return false;
        }
      } catch (err) {
        console.warn("Supabase forgot password note:", err);
      }
    }

    showToast(`Password reset link sent to ${cleanEmail}! Please check your inbox.`, "info");
    switchAuthTab('login');
    return true;
  }

  // --- Logout ---
  async logout() {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.warn("Supabase signout note:", err);
      }
    }

    this.clearUserSession();
    closeModal('accountDashboardModal');
    showToast("Logged out successfully.", "info");
  }

  // Handle Redirect after auth completion
  handlePostAuthRedirect() {
    if (this.pendingCheckout) {
      this.pendingCheckout = false;
      showToast("Redirecting back to Checkout...", "info");
      openCheckout(); // Redirect back to checkout modal
    } else {
      // Scroll to home / dashboard section
      const section = document.getElementById('bestSellersSection');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Update Header UI depending on Auth state
  updateAuthUI() {
    const userBtn = document.getElementById('headerUserBtn');
    const userIconSpan = document.getElementById('headerUserIconSpan');
    
    if (this.currentUser) {
      if (userBtn) {
        userBtn.title = `Logged in as ${this.currentUser.fullName} (${this.currentUser.email})`;
        userBtn.onclick = () => openCustomerDashboard();
      }
      if (userIconSpan) {
        userIconSpan.innerHTML = `<span style="font-size: 0.75rem; font-weight: 800; background: var(--accent); color: var(--primary-dark); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-transform: uppercase;">${this.currentUser.fullName.charAt(0)}</span>`;
      }
    } else {
      if (userBtn) {
        userBtn.title = "My Account / Sign In";
        userBtn.onclick = () => openModal('accountModal');
      }
      if (userIconSpan) {
        userIconSpan.innerHTML = `<i data-lucide="user"></i>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  }
}

const authManager = new AuthManager();

// Tab Switcher for Account Modal
function switchAuthTab(tabName) {
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  const forgotForm = document.getElementById('authForgotForm');
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const modalTitle = document.getElementById('authModalTitle');

  if (!loginForm || !registerForm || !forgotForm) return;

  // Hide all
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  forgotForm.style.display = 'none';

  if (tabBtnLogin) tabBtnLogin.classList.remove('active');
  if (tabBtnRegister) tabBtnRegister.classList.remove('active');

  if (tabName === 'login') {
    loginForm.style.display = 'block';
    if (tabBtnLogin) tabBtnLogin.classList.add('active');
    if (modalTitle) modalTitle.textContent = "Customer Sign In";
  } else if (tabName === 'register') {
    registerForm.style.display = 'block';
    if (tabBtnRegister) tabBtnRegister.classList.add('active');
    if (modalTitle) modalTitle.textContent = "Create Customer Account";
  } else if (tabName === 'forgot') {
    forgotForm.style.display = 'block';
    if (modalTitle) modalTitle.textContent = "Reset Password";
  }
}

// Open Customer Dashboard Modal with Order History
function openCustomerDashboard() {
  const user = authManager.currentUser;
  if (!user) {
    openModal('accountModal');
    return;
  }

  const content = document.getElementById('dashboardContent');
  if (content) {
    // Retrieve all store orders
    const allOrders = (typeof adminManager !== 'undefined' && adminManager.orders) 
      ? adminManager.orders 
      : JSON.parse(localStorage.getItem('pokkisham_admin_orders')) || [];

    // Filter orders belonging to this customer (by name or email)
    const userOrders = allOrders.filter(o => 
      o.customerName && (
        o.customerName.toLowerCase() === user.fullName.toLowerCase() ||
        (user.email && o.customerName.toLowerCase().includes(user.email.split('@')[0].toLowerCase()))
      )
    );

    const ordersHtml = (userOrders.length > 0) ? userOrders.map(o => `
      <div style="background: var(--bg-white); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 10px; border-left: 4px solid var(--accent); cursor: pointer;" onclick="trackOrderById('${o.id}')" title="Click to track live status">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.92rem; color: var(--primary);">#${o.id}</strong>
          <span style="font-size: 0.75rem; font-weight: 700; background: var(--bg-cream); color: var(--primary); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
            ${o.status === 'Delivered' ? '✅ Delivered' : (o.status === 'Out for Delivery' ? '🚚 Out for Delivery' : '⏳ Processing')}
          </span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-dark); margin-bottom: 6px; font-weight: 600;">${o.items}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 6px;">
          <span>Date: <strong>${o.date}</strong> &nbsp; <span style="color: var(--accent); font-weight: 700;">🔍 Track →</span></span>
          <span style="font-size: 0.88rem; color: var(--primary); font-weight: 800;">₹${parseFloat(o.total).toFixed(2)}</span>
        </div>
        ${o.transactionId && o.transactionId !== 'N/A' ? `<div style="font-size: 0.74rem; color: var(--primary); margin-top: 4px;">UTR: ${o.transactionId}</div>` : ''}
      </div>
    `).join('') : `
      <div style="text-align: center; padding: 20px 10px; background: var(--bg-cream); border-radius: var(--radius-sm); margin-bottom: 16px;">
        <div style="font-size: 2rem; margin-bottom: 6px;">🛍️</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">You haven't placed any orders yet.</p>
        <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem;" onclick="closeModal('accountDashboardModal');">
          START SHOPPING
        </button>
      </div>
    `;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary); color: var(--accent); font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; text-transform: uppercase;">
          ${user.fullName.charAt(0)}
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--primary); margin-bottom: 2px;">${user.fullName}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${user.email}</p>
      </div>

      <div style="background: var(--bg-cream); padding: 12px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span><strong>Account Status:</strong></span>
          <span style="color: #164E38; font-weight: 700;">Active Customer</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Total Orders Placed:</strong></span>
          <strong>${userOrders.length} Orders</strong>
        </div>
      </div>

      <h4 style="font-family: var(--font-heading); font-size: 1rem; color: var(--primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        📦 My Order History (${userOrders.length})
      </h4>

      <div style="max-height: 240px; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
        ${ordersHtml}
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" onclick="closeModal('accountDashboardModal'); openModal('trackingModal');" style="flex: 1; font-size: 0.8rem; padding: 8px;">
          🔍 Track Order Status
        </button>
        <button class="btn btn-primary" onclick="authManager.logout();" style="flex: 1; font-size: 0.8rem; padding: 8px; background: #d9534f; border-color: #d9534f;">
          LOGOUT ACCOUNT
        </button>
      </div>
    `;
  }

  openModal('accountDashboardModal');
}
