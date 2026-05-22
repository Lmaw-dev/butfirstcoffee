import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Admin.css';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role: '', username: '', active: true });
  const [staffEditingId, setStaffEditingId] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    available: true,
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [status, prods] = await Promise.all([
        api.initStorage(),
        api.getAdminProducts(),
        // Note: fetch orders separately after products resolved below
      ]);
      
      setStorageStatus(status);
      setProducts(prods);
      // fetch orders after products loaded
      try {
        const fetchedOrders = await api.getAdminOrders();
        setOrders(fetchedOrders);
      } catch (oerr) {
        console.warn('Failed to load orders:', oerr);
      }
      // fetch staff
      try {
        const fetchedStaff = await api.getStaff();
        setStaff(fetchedStaff);
      } catch (serr) {
        console.warn('Failed to load staff:', serr);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin panel');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...staffForm };
      if (staffEditingId) {
        const res = await api.updateStaff(staffEditingId, payload);
        if (res.success) {
          setStaff(staff.map(s => s.id === staffEditingId ? { ...s, ...payload } : s));
          alert('Staff updated');
        }
      } else {
        const res = await api.addStaff(payload);
        if (res.success) {
          setStaff([...staff, { id: res.id, ...payload }]);
          alert('Staff added');
        }
      }
      setStaffForm({ name: '', role: '', username: '', active: true });
      setStaffEditingId(null);
      setShowAddStaffForm(false);
    } catch (err) {
      alert('Staff save error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = (s) => {
    setStaffForm({ name: s.name, role: s.role, username: s.username, active: !!s.active });
    setStaffEditingId(s.id);
    setShowAddStaffForm(true);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete staff account?')) return;
    try {
      setSubmitting(true);
      const res = await api.deleteStaff(id);
      if (res.success) {
        setStaff(staff.filter(s => s.id !== id));
        alert('Staff deleted');
      }
    } catch (err) {
      alert('Delete staff failed: ' + err.message);
    } finally { setSubmitting(false); }
  };

  const handleToggleActive = async (s) => {
    try {
      const payload = { name: s.name, role: s.role, active: !s.active };
      setSubmitting(true);
      const res = await api.updateStaff(s.id, payload);
      if (res.success) {
        setStaff(staff.map(st => st.id === s.id ? { ...st, active: !st.active } : st));
      }
    } catch (err) {
      alert('Failed to update staff: ' + err.message);
    } finally { setSubmitting(false); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingId) {
        const result = await api.updateProduct(editingId, productData);
        if (result.success) {
          setProducts(
            products.map((p) =>
              p.id === editingId ? { ...p, ...productData } : p
            )
          );
          alert('Product updated successfully');
        }
      } else {
        const result = await api.addProduct(productData);
        if (result.success) {
          setProducts([...products, result.product || { id: result.id, ...productData }]);
          alert('Product added successfully');
        }
      }

      setFormData({
        name: '',
        category: '',
        price: '',
        image: '',
        available: true,
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
      console.error('Product save error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      image: product.image || '',
      available: product.available,
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await api.deleteProduct(productId);
      if (result.success) {
        setProducts(products.filter((p) => p.id !== productId));
        alert('Product deleted successfully');
      }
    } catch (err) {
      alert('Error: ' + err.message);
      console.error('Product delete error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dt) => {
    try {
      const d = new Date(dt);
      return d.toLocaleString();
    } catch (e) {
      return dt;
    }
  };

  const resolveImagePath = (imagePath) => {
    if (!imagePath) return '/bfc/images/bfc.jpg';
    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) return imagePath;
    return `/bfc/${imagePath.replace(/^\/+/, '')}`;
  };

  const getProductImage = (product) => {
    if (!product) return '/bfc/images/bfc.jpg';
    if (product.image && product.image.includes('/bfc/')) return product.image;
    return resolveImagePath(product.image);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert('Order status updated');
    } catch (err) {
      alert('Failed to update order: ' + (err.message || err));
      console.error('Update order error:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all order history? This cannot be undone.')) return;
    try {
      const res = await api.clearOrders();
      if (res.success) {
        setOrders([]);
        alert('Order history cleared');
      }
    } catch (err) {
      alert('Failed to clear orders: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="admin-container"><p>Loading admin panel...</p></div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <h1>But First, Coffee</h1>
          <p>Admin Dashboard</p>
        </div>
        <div className="header-right">
          <span className="user-info">
            <strong>{user?.name}</strong> ({user?.role})
          </span>
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        {storageStatus && (
          <div className="status-section">
            <h2>Database Status</h2>
            <div className="status-grid">
              {storageStatus.tables?.map((table) => (
                <div key={table.name} className="status-card">
                  <h3>{table.name}</h3>
                  <p>Records: {table.rows}</p>
                  <p className={table.exists ? 'exists' : 'missing'}>
                    {table.exists ? '✓ Exists' : '✗ Missing'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="orders-section">
          <div className="section-header">
            <h2>Order History</h2>
            <button className="clear-button" onClick={handleClearHistory}>🗑️ Clear History</button>
          </div>

          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            <div className="orders-table products-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Change</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id}>
                      <td>{idx + 1}</td>
                      <td>{formatDateTime(order.order_date || order.orderDate || order.created_at || order.createdAt)}</td>
                      <td>
                        <div className="order-items">
                          {Array.isArray(order.items) ? order.items.map((it, i) => {
                            const prod = products.find((p) => String(p.id) === String(it.id) || String(p.id) === String(it.product_id) || p.name === it.name);
                            return (
                              <div key={i} className="order-item">
                                {prod && (
                                  <img src={getProductImage(prod)} alt={prod.name} onError={(e)=>{e.currentTarget.src='/bfc/images/bfc.jpg'}} />
                                )}
                                <span>{it.name || it.product_name || ''} ×{it.quantity || it.qty || 1}</span>
                              </div>
                            );
                          }) : String(order.items)}
                        </div>
                      </td>
                      <td>₱{parseFloat(order.total || 0).toFixed(2)}</td>
                      <td>₱{parseFloat(order.paid || 0).toFixed(2)}</td>
                      <td>₱{parseFloat(order.change_amount || order.change || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${(order.status||'pending').toLowerCase()}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="order-actions">
                          <select defaultValue={order.status || 'pending'} onChange={(e)=> handleUpdateOrderStatus(order.id, e.target.value)}>
                            <option value="pending">pending</option>
                            <option value="preparing">preparing</option>
                            <option value="ready">ready</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        

        <div className="products-section">
          <div className="section-header">
            <h2>Products Management</h2>
            <button
              className="add-button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setFormData({
                  name: '',
                  category: '',
                  price: '',
                  image: '',
                  available: true,
                });
              }}
            >
              {showAddForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showAddForm && (
            <form className="product-form" onSubmit={handleAddProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    id="category"
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (₱) *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="image">Image URL</label>
                  <input
                    id="image"
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group checkbox">
                  <label htmlFor="available">
                    <input
                      id="available"
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    Available
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          )}

          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₱{parseFloat(product.price).toFixed(2)}</td>
                      <td>
                        <span className={product.available ? 'badge-available' : 'badge-unavailable'}>
                          {product.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEditProduct(product)}
                          disabled={submitting}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={submitting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="staff-section">
          <div className="section-header">
            <h2>Staff Management</h2>
            <button
              className="add-button"
              onClick={() => {
                setShowAddStaffForm(!showAddStaffForm);
                setStaffEditingId(null);
                setStaffForm({ name: '', role: '', username: '', active: true });
              }}
            >
              {showAddStaffForm ? 'Cancel' : '+ Add Staff'}
            </button>
          </div>

          {showAddStaffForm && (
            <form className="product-form" onSubmit={handleAddStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="staff-name">Name *</label>
                  <input id="staff-name" name="name" value={staffForm.name} onChange={handleStaffInputChange} required disabled={submitting} />
                </div>

                <div className="form-group">
                  <label htmlFor="staff-role">Role *</label>
                  <input id="staff-role" name="role" value={staffForm.role} onChange={handleStaffInputChange} required disabled={submitting} />
                </div>

                <div className="form-group">
                  <label htmlFor="staff-username">Username *</label>
                  <input id="staff-username" name="username" value={staffForm.username} onChange={handleStaffInputChange} required disabled={submitting || !!staffEditingId} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox">
                  <label htmlFor="staff-active">
                    <input id="staff-active" name="active" type="checkbox" checked={staffForm.active} onChange={handleStaffInputChange} disabled={submitting} /> Active
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={submitting}>{submitting ? 'Saving...' : staffEditingId ? 'Update Staff' : 'Add Staff'}</button>
            </form>
          )}

          {staff.length === 0 ? (
            <p>No staff accounts</p>
          ) : (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.role}</td>
                      <td>{s.username}</td>
                      <td><span className={s.active ? 'badge-available' : 'badge-unavailable'}>{s.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td className="action-buttons">
                        <button className="edit-button" onClick={()=>handleEditStaff(s)} disabled={submitting}>Edit</button>
                        <button className="delete-button" onClick={()=>handleToggleActive(s)} disabled={submitting}>{s.active ? 'Deactivate' : 'Activate'}</button>
                        <button className="delete-button" onClick={()=>handleDeleteStaff(s.id)} disabled={submitting}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
