import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, X, Plus, Minus, Trash2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Stripe and API Config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const products = [
  { id: '1', name: 'Premium Wireless Headphones', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Minimalist Smart Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Pro Gaming Mouse', price: 89.99, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60' },
  { id: '4', name: 'Mechanical Keyboard', price: 149.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format&fit=crop&q=60' },
  { id: '5', name: 'Ultra-Wide Monitor', price: 449.99, image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=800&auto=format&fit=crop&q=60' },
  { id: '6', name: 'Noise Cancelling Earbuds', price: 129.99, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60' },
];

const App = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [email, setEmail] = useState('');

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!email) return alert('Please enter your email!');
    try {
      const response = await axios.post(`${API_URL}/checkout/create-session`, { items: cart, email });
      if (response.data.url) window.location.href = response.data.url;
    } catch (error) {
      alert('Checkout failed');
    }
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container nav-content">
            <Link to="/" className="logo">MAGNET STORE</Link>
            <div className="cart-icon-container" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </div>
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
          </Routes>
        </main>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="cart-overlay" onClick={() => setIsCartOpen(false)} 
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="cart-modal open"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2>Your Cart</h2>
                  <X cursor="pointer" onClick={() => setIsCartOpen(false)} />
                </div>

                <div className="cart-items-list">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: 'var(--primary)' }}>${item.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                          <Minus size={16} cursor="pointer" onClick={() => updateQuantity(item.id, -1)} />
                          <span>{item.quantity}</span>
                          <Plus size={16} cursor="pointer" onClick={() => updateQuantity(item.id, 1)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="cart-summary">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="cart-total">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <button className="btn" onClick={handleCheckout}>Checkout <CreditCard size={18} /></button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

const Home = ({ products, addToCart }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container">
    <header className="hero-section">
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Premium Tech Gear
      </motion.h1>
      <p>Elevate your workspace with high-performance accessories.</p>
    </header>

    <div className="product-grid">
      {products.map((product, index) => (
        <motion.div 
          key={product.id} 
          className="product-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="product-image-container">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="image-overlay">
               <button className="quick-add" onClick={() => addToCart(product)}>
                 <Plus size={24} />
               </button>
            </div>
          </div>
          <div className="product-info">
            <span className="category-tag">Premium Accessory</span>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-footer">
              <p className="product-price">${product.price}</p>
              {/* Note: changed class to 'btn' to match your optimized CSS */}
              <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => addToCart(product)}>
                Add <Plus size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (!sessionId) return;

    axios
      .get(`${API_URL}/checkout/verify/${sessionId}`)
      .then((res) => {
        console.log("Payment verification:", res.data.status);
      })
      .catch((err) => {
        console.error("Verification failed", err);
      });
  }, []);

  return (
    <div className="status-container animate-fade">
      <CheckCircle2 size={80} color="var(--primary)" className="status-icon" />
      <h1 className="success-text">Payment Successful!</h1>
      <p>Your order has been confirmed.</p>
      <Link to="/" className="btn" style={{ width: 'auto', marginTop: '2rem' }}>
        Back to Shop
      </Link>
    </div>
  );
};


const Cancel = () => {
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (!sessionId) return;

    axios
      .get(`${API_URL}/checkout/cancel/${sessionId}`)
      .then(() => {
        console.log("Order marked as cancelled");
      })
      .catch((err) => {
        console.error("Failed to update cancelled order", err);
      });
  }, []);

  return (
    <div className="status-container animate-fade">
      <XCircle size={80} color="var(--danger)" className="status-icon" />
      <h1 className="error-text">Payment Cancelled</h1>
      <p>Your payment was not completed.</p>
      <Link
        to="/"
        className="btn btn-secondary"
        style={{ width: "auto", marginTop: "2rem" }}
      >
        Return to Store
      </Link>
    </div>
  );
};


export default App;