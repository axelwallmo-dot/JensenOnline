import MyOrders from "./pages/MyOrders";
import { useEffect, useState } from "react";
import { secureFetch } from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  // ========================================
  // STATES
  // ========================================

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [page, setPage] = useState("home");

  // User contains email and roles
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Products from backend
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // Check if current user is an Admin
  const isAdmin = user?.roles?.includes("Admin") ?? false;

  // ========================================
  // CHECK CURRENT LOGIN SESSION
  // ========================================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  // ========================================
  // FETCH PRODUCTS FROM BACKEND
  // ========================================

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError("");

    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      setProductsError("Could not load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========================================
  // PRODUCT SEARCH
  // ========================================

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // ========================================
  // SHOPPING CART
  // ========================================

  const addToCart = (product) => {
    setCart((currentCart) => [
      ...currentCart,
      product,
    ]);
  };

  const removeFromCart = (index) => {
    setCart((currentCart) =>
      currentCart.filter((_, i) => i !== index)
    );
  };

  const cartTotal = cart.reduce(
    (total, product) => total + product.price,
    0
  );

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Could not load user information.");
      }

      const data = await response.json();

      setUser(data);
      setPage("home");
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
      setPage("login");
    }
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {
    try {
      const response = await secureFetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setCart([]);
      setPage("home");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Could not log out. Please try again.");
    }
  };

  
  const handlePlaceOrder = async () => {
    if (!user) {
      setPage("login");
      return;
    }

    if (cart.length === 0 || orderLoading) return;

    setOrderLoading(true);
    setOrderMessage("");

    // Group identical products into order rows
    const quantities = new Map();

    for (const product of cart) {
      quantities.set(
        product.id,
        (quantities.get(product.id) || 0) + 1
      );
    }

    const items = Array.from(quantities, ([productId, quantity]) => ({
      productId,
      quantity,
    }));

    try {
      const response = await secureFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Could not place order."
        );
      }

    const data = await response.json();

    setCart([]);
    setOrderMessage(
      `Order #${data.orderId} placed successfully!`
    );

    await fetchProducts();
  } catch (error) {
    setOrderMessage(error.message);
  } finally {
    setOrderLoading(false);
  }
};


  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app">

      {/* NAVIGATION */}
      <header className="navbar">
        <h2>
          JENSEN<span>Online</span>
        </h2>

        <nav>
          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("home")}>
            Products
          </button>

          <button onClick={() => setPage("cart")}>
            Cart ({cart.length})
          </button>

          {!authLoading && user && (
            <button onClick={() => setPage("orders")}>
            My Orders
            </button>
          )}

          {/* ADMIN ONLY */}
          {!authLoading && isAdmin && (
            <button onClick={() => setPage("admin")}>
              Admin Dashboard
            </button>
          )}

          {/* AUTHENTICATION NAVIGATION */}
          {authLoading ? (
            <span>Checking session...</span>
          ) : !user ? (
            <>
              <button onClick={() => setPage("login")}>
                Login
              </button>

              <button onClick={() => setPage("register")}>
                Register
              </button>
            </>
          ) : (
            <>
              <span>Welcome, {user.email}</span>

              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ========================================
          HOME PAGE
      ======================================== */}

      {page === "home" && (
        <>
          {/* HERO SECTION */}
          <section className="hero">
            <h1>Technology made simple.</h1>

            <p>
              Discover electronics and office essentials.
            </p>

            <a href="#products" className="shop-btn">
              Shop Now
            </a>
          </section>

          {/* PRODUCTS SECTION */}
          <main id="products" className="products">
            <h2>Our Products</h2>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="product-grid">
              {productsLoading ? (
                <p>Loading products...</p>
              ) : productsError ? (
                <p role="alert">{productsError}</p>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-image">
                      📦
                    </div>

                    <h3>{product.name}</h3>

                    <p>{product.description}</p>

                    <p>{product.price} SEK</p>

                    <p>Stock: {product.stock}</p>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>
                ))
              ) : (
                <p>No products found.</p>
              )}
            </div>
          </main>
        </>
      )}

      
      {/* SHOPPING CART PAGE */}
      {page === "cart" && (
        <section id="cart" className="cart-section">
          <h2>Shopping Cart ({cart.length})</h2>

          {/* ORDER CONFIRMATION */}
          {orderMessage && (
            <p role="status" className="order-message">
              {orderMessage}
            </p>
          )}

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((product, index) => (
                <div className="cart-item" key={index}>
                  <span>{product.name}</span>
                  <span>{product.price} SEK</span>

                  <button
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <h3>Total: {cartTotal} SEK</h3>

              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
              >
                {orderLoading
                  ? "Placing Order..."
                  : "Place Order"}
              </button>{user && (
  <button onClick={() => setPage("orders")}>
    My Orders
  </button>
)}
            </>
          )}

          <button
            className="shop-btn"
            onClick={() => setPage("home")}
          >
            Continue Shopping
          </button>
        </section>
      )}


      {/* ========================================
          LOGIN PAGE
      ======================================== */}

      {page === "login" && (
        <Login
          onNavigate={setPage}
          onLogin={handleLogin}
        />
      )}

      {/* ========================================
          REGISTER PAGE
      ======================================== */}

      {page === "register" && (
        <Register
          onNavigate={setPage}
        />
      )}

      {/* ========================================
          ADMIN DASHBOARD
      ======================================== */}

      {page === "admin" && !authLoading && isAdmin && (
        <Admin
          products={products}
          onProductsChanged={fetchProducts}
        />
      )}

      {page === "orders" && !authLoading && user && (
      <MyOrders />
)}

    </div>
  );
}

export default App;
