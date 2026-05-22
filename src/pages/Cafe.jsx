import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Cafe.css';
import BackButton from '../components/BackButton';

const DEFAULT_PRODUCTS = [
  { id:1,  name:"Espresso",              category:"Coffees",  price:42.00, image:"/bfc/images/espresso.jpg",   available:true },
  { id:2,  name:"Americano",             category:"Coffees",  price:52.50, image:"/bfc/images/americano.jpg",  available:true },
  { id:3,  name:"Cappuccino",           category:"Coffees",  price:43.00, image:"/bfc/images/cappuccino.jpg", available:true },
  { id:4,  name:"Latte",                category:"Coffees",  price:33.50, image:"/bfc/images/latte.jpg",      available:true },
  { id:5,  name:"Mocha",                category:"Coffees",  price:34.00, image:"/bfc/images/mocha.jpg",      available:true },
  { id:6,  name:"Macchiato",            category:"Coffees",  price:32.75, image:"/bfc/images/macchiato.jpg",  available:true },
  { id:17, name:"Kape Stick",           category:"Coffees",  price:2.00,  image:"/bfc/images/bc.png",       available:true },
  { id:7,  name:"Malunggay Pandesal",   category:"Pastries", price:5.00,  image:"/bfc/images/pandesal.jpg",   available:true },
  { id:8,  name:"Egg Bread",            category:"Pastries", price:5.00,  image:"/bfc/images/egg.jpg",        available:true },
  { id:9,  name:"Pan de Coco",          category:"Pastries", price:5.00,  image:"/bfc/images/coco.jpg",       available:true },
  { id:10, name:"Choco/Vanilla Bavarian", category:"Pastries", price:10.00, image:"/bfc/images/bavarian.jpg", available:true }
];

const PRODUCT_IMAGE_OVERRIDES = {
  'Kape Stick': '/bfc/images/bc.png'
};

function normalizeProducts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.products)) {
      return data.products;
    }

    return Object.values(data).flatMap((value) => (Array.isArray(value) ? value : []));
  }

  return [];
}

function resolveImagePath(imagePath) {
  if (!imagePath) return '/bfc/images/bfc.jpg';
  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath;
  }
  return `/bfc/${imagePath.replace(/^\/+/, '')}`;
}

function getProductImage(product) {
  return PRODUCT_IMAGE_OVERRIDES[product.name] || resolveImagePath(product.image);
}

export default function Cafe() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderItems, setOrderItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState('');
  const [changeMessage, setChangeMessage] = useState('');
  const [transactionDialog, setTransactionDialog] = useState({ open: false, type: 'success', title: '', message: '' });
  const canvasRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProducts();
        const normalized = normalizeProducts(data);
        if (normalized.length) {
          const availableProducts = normalized.filter(p => p.available);
          setProducts(availableProducts);
          const cats = ['All', ...new Set(availableProducts.map(p => p.category))];
          setCategories(cats);
        } else {
          throw new Error('Empty data');
        }
      } catch (e) {
        // fallback
        const raw = localStorage.getItem('bfc_products');
        const local = raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
        const availableProducts = local.filter(p => p.available);
        setProducts(availableProducts);
        const cats = ['All', ...new Set(availableProducts.map(p => p.category))];
        setCategories(cats);
      }
    }
    load();
  }, []);

  useEffect(() => {
    // simple particle background (port from legacy)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    }

    function init() {
      particles = [];
      const n = Math.max(20, Math.floor((canvas.width * canvas.height) / 100000));
      for (let i = 0; i < n; i++) particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        dx: (Math.random() * 1.2) - 0.6,
        dy: (Math.random() * 1.2) - 0.6
      });
    }

    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fillStyle = '#22323a'; ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafId); };
  }, []);

  const shownProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  function addToOrder(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [{ id: prod.id, name: prod.name, price: prod.price, quantity: 1 }, ...prev];
    });
  }

  function increase(i) { setOrderItems(prev => prev.map((it,idx) => idx===i?{...it,quantity:it.quantity+1}:it)); }
  function decrease(i) { setOrderItems(prev => { const copy = [...prev]; if (copy[i].quantity>1) copy[i].quantity--; else copy.splice(i,1); return copy; }); }
  function clearOrder() { if (!orderItems.length) return; if (!window.confirm('Clear all items?')) return; setOrderItems([]); setAmountPaid(''); }

  function openTransactionDialog(type, title, message) {
    setTransactionDialog({ open: true, type, title, message });
  }

  async function checkout() {
    if (!orderItems.length) { alert('Your order is empty.'); return; }
    const total = orderItems.reduce((s,i)=>s+i.price*i.quantity,0);
    const paid = parseFloat(amountPaid) || 0;
    if (paid < total) { alert('Please enter a valid payment amount.'); return; }
    const order = { id: Date.now(), items: orderItems, total, paid, change: paid - total, timestamp: new Date().toLocaleString('en-PH') };
    try {
      await api.createOrder(order.items, order.total, order.paid, order.change);
      // save locally
      const orders = JSON.parse(localStorage.getItem('bfc_orders')||'[]'); orders.unshift(order); localStorage.setItem('bfc_orders', JSON.stringify(orders.slice(0,200)));
      setReceiptData(order); setReceiptOpen(true); setOrderItems([]); setAmountPaid('');
      openTransactionDialog('success', 'Order Completed', `Order #${order.id} completed successfully. Change: ₱${order.change.toFixed(2)}`);
    } catch (err) {
      openTransactionDialog('error', 'Order Failed', err.message || 'Unknown');
    }
  }

  function calculateChange() {
    const total = orderItems.reduce((s,i)=>s+i.price*i.quantity,0);
    const paid = parseFloat(amountPaid) || 0;
    const change = paid - total;
    if (!orderItems.length) { setChangeMessage('<p class="error">Please add items first!</p>'); openTransactionDialog('error', 'Cannot Calculate Change', 'Please add items to the order first.'); return; }
    if (!paid) { setChangeMessage('<p class="error">Please enter amount paid!</p>'); openTransactionDialog('error', 'Cannot Calculate Change', 'Please enter the amount paid.'); return; }
    if (change < 0) { setChangeMessage(`<p class="error">Need ₱${Math.abs(change).toFixed(2)} more!</p>`); openTransactionDialog('error', 'Insufficient Payment', `You still need ₱${Math.abs(change).toFixed(2)} more.`); return; }
    setChangeMessage(`<p class="success">Change: ₱${change.toFixed(2)}</p>`);
    openTransactionDialog('success', 'Change Calculated', `Your change is ₱${change.toFixed(2)}.`);
  }

  return (
    <div className="cafe-root">
      <canvas id="canvas1" ref={canvasRef} />
      <div className="container">
        <div className="menu-pane">
          <div className="menu-header">
            <BackButton />
            <div className="image-area" aria-hidden>
              <img src="/bfc/images/bfc.jpg" width="190" height="210" alt="But First Coffee logo" />
            </div>
            <h1>Menu</h1>
            <p className="menu-subtitle">But first, Coffee</p>
            <div className="hero-badge-row" aria-label="Menu highlights">
              <span className="hero-badge">Fast pickup</span>
              <span className="hero-badge">Fresh brewed</span>
              <span className="hero-badge">Best sellers</span>
            </div>
          </div>

          <div className="featured-strip" id="featuredStrip">
            {products.slice(0,3).map(p=> (
              <div className="featured-card" key={p.id}>
                <img
                  src={getProductImage(p)}
                  alt={p.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => addToOrder(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      addToOrder(p.id);
                    }
                  }}
                  aria-label={`Add ${p.name} to order`}
                />
                <div>
                  <h4>{p.name}</h4>
                  <p>{p.category} favorite for a quick, easy reorder.</p>
                  <div className="price-row">
                    <span className="featured-price">₱{parseFloat(p.price).toFixed(2)}</span>
                    <button className="featured-add" onClick={()=>addToOrder(p.id)}>Quick add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="category-tabs" id="categoryTabs">
            {categories.map(cat => (
              <button key={cat} className={`cat-tab ${cat===activeCategory? 'active':''}`} onClick={()=>setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div className="menu-scroll">
            <div id="menuContainer">
              {shownProducts.length === 0 ? (
                <p style={{textAlign:'center',padding:40,color:'#888'}}>No items available right now.</p>
              ) : Object.entries(shownProducts.reduce((acc, p) => {
                (acc[p.category] = acc[p.category] || []).push(p);
                return acc;
              }, {})).map(([cat, items]) => (
                <div className="menu-section" key={cat}>
                  <h3>{cat}</h3>
                  <div className="menu-grid" role="list">
                    {items.map(p=> (
                      <div className="menu-card" data-id={p.id} key={p.id} role="listitem">
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          className="item-image"
                          onClick={() => addToOrder(p.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e)=>{
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              addToOrder(p.id);
                            }
                          }}
                          aria-label={`Add ${p.name} to order`}
                          onError={(e)=>{e.currentTarget.src='/bfc/images/bfc.jpg'}}
                        />
                        <div className="item-copy">
                          <h4 className="item-name">{p.name}</h4>
                          <p className="item-desc">Freshly prepared in-house, served hot and made to order.</p>
                        </div>
                        <div className="item-actions">
                          <p className="item-price">₱{parseFloat(p.price).toFixed(2)}</p>
                          <button className="order-btn" onClick={()=>addToOrder(p.id)}>Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-section">
          <div className="order-header">
            <h2><strong>Your Order</strong></h2>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
            </div>
          </div>
          <div className="order-container">
            <div className="order-snapshot">
              <div className="snapshot-chip"><span>Ready fast</span><strong>Build your order in a few taps</strong></div>
              <div className="snapshot-chip"><span>Suggested combo</span><strong>Latte + pandesal</strong></div>
            </div>

            <p className="checkout-note">Choose a favorite, add a pastry, and head straight to checkout.</p>

            <div className="order-items" id="orderItems">
              {orderItems.length===0 ? <p className="empty-order">No items yet. Click "Add" to start!</p> : (
                orderItems.map((it,i)=> (
                  <div className="order-item" key={it.id+"-"+i}>
                    <div className="item-info"><span className="item-name-order">{it.name}</span><span className="item-price-order">₱{(it.price*it.quantity).toFixed(2)}</span></div>
                    <div className="quantity-controls">
                      <button onClick={()=>decrease(i)}>-</button>
                      <span className="quantity">{it.quantity}</span>
                      <button onClick={()=>increase(i)}>+</button>
                      <button className="remove-btn" onClick={()=>{ setOrderItems(prev=>{ const cp=[...prev]; cp.splice(i,1); return cp; }); }}>&#x2715;</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="order-summary">
              <div className="summary-row"><span>Total Items:</span><span id="totalItems">{orderItems.reduce((s,i)=>s+i.quantity,0)}</span></div>
              <div className="summary-row total"><span>Total Price:</span><span id="totalPrice">₱ {orderItems.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)}</span></div>
            </div>

            <div className="payment-section">
              <h3>Payment</h3>
              <div className="payment-input"><label htmlFor="amountPaid">Amount Paid (₱):</label><input id="amountPaid" type="number" value={amountPaid} onChange={e=>setAmountPaid(e.target.value)} placeholder="Enter amount" min="0" step="0.01" /></div>
              <button className="calculate-btn" onClick={calculateChange}>Calculate Change</button>
              <div className="change-display" id="changeDisplay" dangerouslySetInnerHTML={{ __html: changeMessage }}></div>
            </div>

            <div className="order-actions">
              <button className="clear-btn" onClick={clearOrder}>Clear Order</button>
              <button className="checkout-btn" onClick={checkout}>Complete Order</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`dialog-overlay ${transactionDialog.open ? 'open' : ''}`}>
        <div className="dialog-box">
          <div className="dialog-head">
            <h4>{transactionDialog.title}</h4>
            <button className="dialog-close" onClick={() => setTransactionDialog((prev) => ({ ...prev, open: false }))}>×</button>
          </div>
          <div className="dialog-content">{transactionDialog.message}</div>
          <div className="dialog-actions">
            <button className={`dialog-btn ok ${transactionDialog.type === 'error' ? 'danger' : ''}`} onClick={() => setTransactionDialog((prev) => ({ ...prev, open: false }))}>OK</button>
          </div>
        </div>
      </div>

      {receiptOpen && receiptData && (
        <div className="receipt-overlay open">
          <div className="receipt-box">
            <h3>☕ But first, Coffee</h3>
            <p id="receiptDate">{receiptData.timestamp}</p>
            <hr className="receipt-divider" />
            <div className="receipt-items">{receiptData.items.map(i=>(<div className="receipt-item-row" key={i.id}><span>{i.name} ×{i.quantity}</span><span>₱{(i.price*i.quantity).toFixed(2)}</span></div>))}</div>
            <hr className="receipt-divider" />
            <div className="receipt-items">
              <div className="receipt-item-row receipt-total"><span>Total:</span><span id="receiptTotal">₱{receiptData.total.toFixed(2)}</span></div>
              <div className="receipt-item-row"><span>Amount Paid:</span><span id="receiptPaid">₱{receiptData.paid.toFixed(2)}</span></div>
              <div className="receipt-item-row"><span>Change:</span><span id="receiptChange">₱{receiptData.change.toFixed(2)}</span></div>
            </div>
            <hr className="receipt-divider" />
            <p style={{fontSize:13,color:'#888'}}>Thank you for your order!</p>
            <button className="receipt-btn" onClick={()=>{ setReceiptOpen(false); setReceiptData(null); }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
