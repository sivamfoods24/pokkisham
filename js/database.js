/**
 * Pokkisham Supabase Real-time Cloud Database Integration Engine
 * Replaces LocalStorage with Live Supabase Cloud Database & WebSockets
 */

class PokkishamDB {
  constructor() {
    this.isCloudEnabled = false;
    this.init();
  }

  init() {
    if (supabaseClient && SUPABASE_URL) {
      this.isCloudEnabled = true;
      console.log("⚡ Pokkisham Supabase Cloud Database Live & Connected.");
      this.subscribeRealtime();
    } else {
      console.warn("⚠️ Supabase Credentials Pending. Using Fallback mode until URL/Key is configured.");
    }
  }

  // --- Realtime WebSocket Subscriptions for Instant Live Updates ---
  subscribeRealtime() {
    if (!this.isCloudEnabled || !supabaseClient) return;

    try {
      // 1. Subscribe to Live Orders Changes (for instant admin & tracking updates)
      supabaseClient
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
          console.log('🔔 Live Order Event Received:', payload);
          if (typeof adminManager !== 'undefined' && adminManager) {
            adminManager.fetchOrdersFromSupabase();
          }
        })
        .subscribe();

      // 2. Subscribe to Products Changes
      supabaseClient
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
          if (typeof adminManager !== 'undefined' && adminManager) {
            adminManager.fetchProductsFromSupabase();
          }
        })
        .subscribe();

      // 3. Subscribe to Categories Changes
      supabaseClient
        .channel('public:categories')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
          if (typeof adminManager !== 'undefined' && adminManager) {
            adminManager.fetchCategoriesFromSupabase();
          }
        })
        .subscribe();

      // 4. Subscribe to Store Settings Changes
      supabaseClient
        .channel('public:store_settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, payload => {
          if (typeof adminManager !== 'undefined' && adminManager) {
            adminManager.fetchStoreSettingsFromSupabase();
          }
        })
        .subscribe();
    } catch (err) {
      console.warn("Realtime subscription note:", err);
    }
  }

  // --- PRODUCTS DB METHODS ---
  async getProducts() {
    if (!this.isCloudEnabled || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        badge: p.badge,
        rating: p.rating,
        reviewsCount: p.reviews_count,
        price: parseFloat(p.price),
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        unit: p.unit,
        variants: p.variants || [p.unit],
        variantPrices: p.variant_prices || {},
        image: p.image,
        description: p.description,
        inStock: p.in_stock
      }));
    } catch (err) {
      console.warn("Supabase fetch products error:", err.message);
      return null;
    }
  }

  async saveProduct(product) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        badge: product.badge,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        price: product.price,
        old_price: product.oldPrice,
        unit: product.unit,
        variants: product.variants,
        variant_prices: product.variantPrices,
        image: product.image,
        description: product.description,
        in_stock: product.inStock
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase save product error:", err.message);
      return false;
    }
  }

  async deleteProduct(productId) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('products').delete().eq('id', productId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase delete product error:", err.message);
      return false;
    }
  }

  // --- CATEGORIES DB METHODS ---
  async getCategories() {
    if (!this.isCloudEnabled || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('categories').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase fetch categories error:", err.message);
      return null;
    }
  }

  async saveCategory(cat) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('categories').upsert({
        id: cat.id,
        name: cat.name,
        badge: cat.badge,
        icon: cat.icon,
        image: cat.image,
        description: cat.description
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase save category error:", err.message);
      return false;
    }
  }

  async deleteCategory(catId) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('categories').delete().eq('id', catId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase delete category error:", err.message);
      return false;
    }
  }

  // --- ORDERS DB METHODS ---
  async getOrders() {
    if (!this.isCloudEnabled || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(o => ({
        id: o.id,
        customerName: o.customer_name,
        phone: o.phone,
        address: o.address,
        items: o.items,
        itemsJson: o.items_json,
        paymentMethod: o.payment_method,
        transactionId: o.transaction_id,
        total: parseFloat(o.total),
        date: o.date,
        status: o.status
      }));
    } catch (err) {
      console.warn("Supabase fetch orders error:", err.message);
      return null;
    }
  }

  async insertOrder(order) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('orders').insert({
        id: order.id,
        customer_id: authManager.currentUser?.id || null,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        items: order.items,
        items_json: order.itemsJson || cartManager.cart,
        payment_method: order.paymentMethod,
        transaction_id: order.transactionId,
        total: order.total,
        date: order.date,
        status: order.status || 'Processing'
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase insert order error:", err.message);
      return false;
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase update order status error:", err.message);
      return false;
    }
  }

  // --- TESTIMONIALS DB METHODS ---
  async getTestimonials() {
    if (!this.isCloudEnabled || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase fetch testimonials error:", err.message);
      return null;
    }
  }

  async saveTestimonial(t) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('testimonials').insert({
        name: t.name,
        location: t.location,
        rating: t.rating,
        comment: t.comment
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase save testimonial error:", err.message);
      return false;
    }
  }

  async deleteTestimonial(id) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase delete testimonial error:", err.message);
      return false;
    }
  }

  // --- STORE SETTINGS DB METHODS ---
  async getStoreSettings() {
    if (!this.isCloudEnabled || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('store_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      return {
        name: "Pokkisham Cold Pressed Oil Mill & Grocery Store",
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp,
        address: data.address,
        freeShippingThreshold: parseFloat(data.free_shipping_threshold),
        paymentSettings: data.payment_settings
      };
    } catch (err) {
      console.warn("Supabase fetch store settings error:", err.message);
      return null;
    }
  }

  async saveStoreSettings(settings) {
    if (!this.isCloudEnabled || !supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('store_settings').upsert({
        id: 1,
        phone: settings.phone,
        email: settings.email,
        whatsapp: settings.whatsapp,
        address: settings.address,
        free_shipping_threshold: settings.freeShippingThreshold,
        payment_settings: settings.paymentSettings,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase save store settings error:", err.message);
      return false;
    }
  }
}

const pokkishamDB = new PokkishamDB();
