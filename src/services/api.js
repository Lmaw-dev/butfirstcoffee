// API Service Layer - Communicates with PHP Backend
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost/webdev/bfc';

const api = {
  // AUTHENTICATION
  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('login_id', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE}/log-in.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: formData,
      });

      // Parse JSON when possible, otherwise return text as error
      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          // Non-JSON response (HTML redirect or error) — include it in the thrown error
          throw new Error(text || 'Login failed (non-JSON response)');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // PRODUCTS / MENU
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/store-api.php?action=get_products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // ORDERS
  createOrder: async (items, total, paid, changeAmount) => {
    try {
      const response = await fetch(`${API_BASE}/store-api.php?action=add_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          total,
          paid,
          change_amount: changeAmount,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // ADMIN ENDPOINTS
  initStorage: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=init_storage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize storage');
      }

      return data;
    } catch (error) {
      console.error('Init storage error:', error);
      throw error;
    }
  },

  getAdminProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=get_products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admin products');
      }

      return data;
    } catch (error) {
      console.error('Get admin products error:', error);
      throw error;
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=add_product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      return data;
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=update_product&id=${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      return data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=delete_product&id=${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      return data;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },

  // ADMIN ORDERS
  getAdminOrders: async (limit = 200) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=get_orders&limit=${encodeURIComponent(limit)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      return data;
    } catch (error) {
      console.error('Get admin orders error:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=update_order_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: orderId, status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      return data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  clearOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=clear_orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear orders');
      }

      return data;
    } catch (error) {
      console.error('Clear orders error:', error);
      throw error;
    }
  },

  // STAFF MANAGEMENT
  getStaff: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=get_staff`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch staff');
      }

      return data;
    } catch (error) {
      console.error('Get staff error:', error);
      throw error;
    }
  },

  addStaff: async (staffData) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=add_staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(staffData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add staff');
      }

      return data;
    } catch (error) {
      console.error('Add staff error:', error);
      throw error;
    }
  },

  updateStaff: async (staffId, staffData) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=update_staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: staffId, ...staffData }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update staff');
      }

      return data;
    } catch (error) {
      console.error('Update staff error:', error);
      throw error;
    }
  },

  deleteStaff: async (staffId) => {
    try {
      const response = await fetch(`${API_BASE}/admin-api.php?action=delete_staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: staffId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete staff');
      }

      return data;
    } catch (error) {
      console.error('Delete staff error:', error);
      throw error;
    }
  },
};

export default api;
