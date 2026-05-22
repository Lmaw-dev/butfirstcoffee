import { supabase, isSupabaseConfigured } from './supabaseClient';

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  }
}

function stripUndefined(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function normalizeProduct(product) {
  return { ...product, available: product.available !== false };
}

function normalizeOrder(order) {
  return { ...order, items: Array.isArray(order.items) ? order.items : [], status: order.status || 'pending' };
}

function normalizeStaff(staff) {
  return { ...staff, active: Boolean(staff.active) };
}

const api = {
  login: async (email, password) => {
    try {
      ensureConfigured();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const role = data.user?.user_metadata?.role || 'staff';
      return {
        success: true,
        staff: {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email,
          email: data.user.email,
          role,
          isAdmin: role === 'admin',
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      ensureConfigured();
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map(normalizeProduct);
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  createOrder: async (items, total, paid, changeAmount) => {
    try {
      ensureConfigured();
      const { data, error } = await supabase
        .from('orders')
        .insert({ items, total, paid, change_amount: changeAmount, status: 'pending' })
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, id: data.id, order: normalizeOrder(data) };
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  initStorage: async () => {
    try {
      ensureConfigured();
      return { success: true, message: 'Supabase connection ready. Create the schema in the Supabase SQL editor.' };
    } catch (error) {
      console.error('Init storage error:', error);
      throw error;
    }
  },

  getAdminProducts: async () => api.getProducts(),

  addProduct: async (productData) => {
    try {
      ensureConfigured();
      const payload = stripUndefined({ ...productData, available: productData.available !== false });
      const { data, error } = await supabase.from('products').insert(payload).select('*').single();
      if (error) throw error;
      return { success: true, id: data.id, product: normalizeProduct(data) };
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      ensureConfigured();
      const payload = stripUndefined({ ...productData, available: productData.available !== false });
      const { data, error } = await supabase.from('products').update(payload).eq('id', productId).select('*').single();
      if (error) throw error;
      return { success: true, product: normalizeProduct(data) };
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      ensureConfigured();
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },

  getAdminOrders: async (limit = 200) => {
    try {
      ensureConfigured();
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return (data || []).map(normalizeOrder);
    } catch (error) {
      console.error('Get admin orders error:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      ensureConfigured();
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select('*').single();
      if (error) throw error;
      return { success: true, order: normalizeOrder(data) };
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  clearOrders: async () => {
    try {
      ensureConfigured();
      const { error } = await supabase.from('orders').delete().gte('id', 0);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Clear orders error:', error);
      throw error;
    }
  },

  getStaff: async () => {
    try {
      ensureConfigured();
      const { data, error } = await supabase.from('staff').select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map(normalizeStaff);
    } catch (error) {
      console.error('Get staff error:', error);
      throw error;
    }
  },

  addStaff: async (staffData) => {
    try {
      ensureConfigured();
      const payload = stripUndefined({
        name: staffData.name,
        role: staffData.role,
        username: staffData.username,
        active: staffData.active !== false,
      });
      const { data, error } = await supabase.from('staff').insert(payload).select('*').single();
      if (error) throw error;
      return { success: true, id: data.id, staff: normalizeStaff(data) };
    } catch (error) {
      console.error('Add staff error:', error);
      throw error;
    }
  },

  updateStaff: async (staffId, staffData) => {
    try {
      ensureConfigured();
      const payload = stripUndefined({
        name: staffData.name,
        role: staffData.role,
        username: staffData.username,
        active: staffData.active,
      });
      const { data, error } = await supabase.from('staff').update(payload).eq('id', staffId).select('*').single();
      if (error) throw error;
      return { success: true, staff: normalizeStaff(data) };
    } catch (error) {
      console.error('Update staff error:', error);
      throw error;
    }
  },

  deleteStaff: async (staffId) => {
    try {
      ensureConfigured();
      const { error } = await supabase.from('staff').delete().eq('id', staffId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete staff error:', error);
      throw error;
    }
  },
};

export default api;
