import { useState, useEffect } from 'react';
import api from '../services/api';
import './Menu.css';
import BackButton from '../components/BackButton';

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Espresso', category: 'Coffees', price: 42.0, image: '/bfc/images/espresso.jpg', available: true },
  { id: 2, name: 'Americano', category: 'Coffees', price: 52.5, image: '/bfc/images/americano.jpg', available: true },
  { id: 3, name: 'Cappuccino', category: 'Coffees', price: 43.0, image: '/bfc/images/cappuccino.jpg', available: true },
  { id: 4, name: 'Latte', category: 'Coffees', price: 33.5, image: '/bfc/images/latte.jpg', available: true },
  { id: 5, name: 'Mocha', category: 'Coffees', price: 34.0, image: '/bfc/images/mocha.jpg', available: true },
  { id: 6, name: 'Macchiato', category: 'Coffees', price: 32.75, image: '/bfc/images/macchiato.jpg', available: true },
  { id: 17, name: 'Kape Stick', category: 'Coffees', price: 2.0, image: '/bfc/images/bc.png', available: true },
  { id: 7, name: 'Malunggay Pandesal', category: 'Pastries', price: 5.0, image: '/bfc/images/pandesal.jpg', available: true },
  { id: 8, name: 'Egg Bread', category: 'Pastries', price: 5.0, image: '/bfc/images/egg.jpg', available: true },
  { id: 9, name: 'Pan de Coco', category: 'Pastries', price: 5.0, image: '/bfc/images/coco.jpg', available: true },
  { id: 10, name: 'Choco/Vanilla Bavarian', category: 'Pastries', price: 10.0, image: '/bfc/images/bavarian.jpg', available: true }
];

const PRODUCT_IMAGE_OVERRIDES = {
  'Kape Stick': '/bfc/images/bc.png'
};

function normalizeProducts(data) {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    if (Array.isArray(data.products)) return data.products;
    return Object.values(data).flatMap((value) => (Array.isArray(value) ? value : []));
  }

  return [];
}

function resolveImagePath(imagePath) {
  if (!imagePath) return '/bfc/images/bfc.jpg';
  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) return imagePath;
  return `/bfc/${imagePath.replace(/^\/+/, '')}`;
}

function getProductImage(product) {
  return PRODUCT_IMAGE_OVERRIDES[product.name] || resolveImagePath(product.image);
}

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(true);
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    // Allow anonymous users to view the menu; only admin requires login.
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      const normalized = normalizeProducts(data).filter((product) => product.available !== false);
      setProducts(normalized.length > 0 ? normalized : DEFAULT_PRODUCTS);
    } catch (err) {
      setError(err.message || 'Failed to load menu');
      console.error('Fetch products error:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const openFeedbackDialog = (type, title, message) => {
    setFeedbackDialog({ open: true, type, title, message });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (paid < total) {
      alert('Insufficient payment');
      return;
    }

    setSubmitting(true);

    try {
      const changeAmount = paid - total;
      const result = await api.createOrder(
        cart,
        total,
        paid,
        changeAmount
      );

      if (result.success) {
        openFeedbackDialog('success', 'Order Completed', `Order #${result.id} completed successfully. Change: ₱${changeAmount.toFixed(2)}`);
        setCart([]);
        setPaid(0);
        setShowCart(true);
      } else {
        openFeedbackDialog('error', 'Order Failed', result.error || 'Unknown error');
      }
    } catch (err) {
      openFeedbackDialog('error', 'Checkout Error', err.message || 'Unknown error');
      console.error('Checkout error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="menu-container"><p>Loading menu...</p></div>;
  }

  return (
    <div className="menu-container">
      <header className="menu-header">
        <BackButton />
        <div className="header-left">
          <h1>But First, Coffee</h1>
          <p>Menu</p>
        </div>
        <div className="header-right">
          <button
            className="cart-button"
            onClick={() => setShowCart((prev) => !prev)}
          >
            🛒 Cart ({cart.length})
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="menu-content">
        <div className="products-section">
          <h2>Available Products</h2>
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.image && (
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      className="product-image"
                      role="button"
                      tabIndex={0}
                      onClick={() => addToCart(product)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          addToCart(product);
                        }
                      }}
                      aria-label={`Add ${product.name} to cart`}
                      onError={(e) => { e.currentTarget.src = '/bfc/images/bfc.jpg'; }}
                    />
                  )}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="product-footer">
                      <span className="price">₱{parseFloat(product.price).toFixed(2)}</span>
                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCart && (
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>₱{parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="item-controls">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                        />
                        <button
                          className="remove-button"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <label htmlFor="paid">Amount Paid:</label>
                    <input
                      id="paid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paid}
                      onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                    />
                  </div>
                  {paid > 0 && (
                    <div className="summary-row">
                      <span>Change:</span>
                      <span>₱{(paid - total).toFixed(2)}</span>
                    </div>
                  )}
                  <button
                    className="checkout-button"
                    onClick={handleCheckout}
                    disabled={submitting || paid < total}
                  >
                    {submitting ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={`dialog-overlay ${feedbackDialog.open ? 'open' : ''}`}>
        <div className="dialog-box">
          <div className="dialog-head">
            <h4>{feedbackDialog.title}</h4>
            <button className="dialog-close" onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}>×</button>
          </div>
          <div className="dialog-content">{feedbackDialog.message}</div>
          <div className="dialog-actions">
            <button className={`dialog-btn ok ${feedbackDialog.type === 'error' ? 'danger' : ''}`} onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}
