
import { useState } from "react";
import { secureFetch } from "../services/api";

function Admin({ products, onProductsChanged }) {
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Återställer formuläret efter att redigering stängts.
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
    });

    setEditingId(null);
  };

  // Fyller formuläret med produktens nuvarande värden.
  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sparar eller uppdaterar produkten med validering.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !Number.isFinite(price) ||
      price < 0.01 ||
      price > 1000000 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 100000
    ) {
      setMessage("Please enter valid product information.");
      return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
      ? `/api/products/${editingId}`
      : "/api/products";

    const method = isEditing ? "PUT" : "POST";

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await secureFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Invalid product information.");
        }

        if (response.status === 401) {
          throw new Error("Please log in again.");
        }

        if (response.status === 403) {
          throw new Error("Access denied.");
        }

        if (response.status === 404) {
          throw new Error("Product not found.");
        }

        throw new Error("Could not save product.");
      }

      resetForm();

      setMessage(
        isEditing
          ? "Product updated successfully!"
          : "Product created successfully!"
      );

      await onProductsChanged();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-section">
      <h1>Admin Dashboard</h1>
      <p>Manage JENSENOnline products.</p>

      <div className="auth-card">
        <h2>
          {editingId !== null
            ? "Edit Product"
            : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="product-name">
            Product Name
          </label>

          <input
            id="product-name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <label htmlFor="product-description">
            Description
          </label>

          <textarea
            id="product-description"
            maxLength={500}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <label htmlFor="product-price">
            Price (SEK)
          </label>

          <input
            id="product-price"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            required
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />

          <label htmlFor="product-stock">
            Stock
          </label>

          <input
            id="product-stock"
            type="number"
            min="0"
            max="100000"
            step="1"
            required
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value,
              })
            }
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId !== null
                ? "Update Product"
                : "Create Product"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                resetForm();
                setMessage("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {message && <p role="status">{message}</p>}
      </div>

      <h2>Existing Products</h2>

      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
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
                type="button"
                disabled={loading}
                onClick={() => handleEdit(product)}
              >
                Edit Product
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Admin;
