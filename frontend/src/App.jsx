import { secureFetch } from "./services/api";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function App() {
  // States
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  
  const [authLoading, setAuthLoading] = useState(true);

  // Check whether the user already has a valid session.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });

        if (response.ok) {
          const data = await response.json();

          setUser(data.email);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);


  // Temporary products until our backend API is ready
  const products = [
    { id: 1, name: "Gaming Laptop", price: 12999 },
    { id: 2, name: "Mechanical Keyboard", price: 899 },
    { id: 3, name: "Wireless Mouse", price: 499 },
    { id: 4, name: "27-inch Monitor", price: 2499 },
  ];

  // Filter products based on search input
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product) => {
    setCart((currentCart) => [...currentCart, product]);
  };

  // Remove product from cart
  const removeFromCart = (index) => {
    setCart((currentCart) =>
      currentCart.filter((_, i) => i !== index)
    );
  };

  // Calculate total cart price
  const cartTotal = cart.reduce(
    (total, product) => total + product.price,
    0
  );

  // Handle successful login
  const handleLogin = (email) => {
    setUser(email);
    setPage("home");
  };

  // Handle logout
  
  const handleLogout = async () => {
    try {
      const response = await secureFetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setCart([]);
      setPage("home");
    } catch {
      alert("Could not log out. Please try again.");
    }
  };



  return (
    <div className="app">

      {/* Navigation */}
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
          <span>Welcome, {user}</span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      )}

        </nav>
      </header>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <h1>Technology made simple.</h1>

            <p>
              Discover electronics and office essentials.
            </p>

            <a href="#products" className="shop-btn">
              Shop Now
            </a>
          </section>

          {/* Products Section */}
          <main id="products" className="products">
            <h2>Our Products</h2>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-image">
                      📦
                    </div>

                    <h3>{product.name}</h3>

                    <p>{product.price} SEK</p>

                    <button
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
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

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((product, index) => (
                <div
                  className="cart-item"
                  key={index}
                >
                  <span>{product.name}</span>

                  <span>{product.price} SEK</span>

                  <button
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <h3>
                Total: {cartTotal} SEK
              </h3>
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

      {/* LOGIN PAGE */}
      {page === "login" && (
        <Login
          onNavigate={setPage}
          onLogin={handleLogin}
        />
      )}

      {/* REGISTER PAGE */}
      {page === "register" && (
        <Register
          onNavigate={setPage}
        />
      )}

    </div>
  );
}

export default App;
