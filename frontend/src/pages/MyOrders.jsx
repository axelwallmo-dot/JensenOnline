
import { useEffect, useState } from "react";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/my", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Could not load orders.");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <section className="orders-section">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div className="auth-card" key={order.id}>
            <h2>Order #{order.id}</h2>

            <p>
              Date:{" "}
              {new Date(order.createdAt).toLocaleString("sv-SE")}
            </p>

            <p>Total: {order.totalPrice} SEK</p>

            <h3>Products</h3>

            {order.items.map((item) => (
              <div key={item.productId}>
                <p>Product ID: {item.productId}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {item.unitPrice} SEK</p>
              </div>
            ))}
          </div>
        ))
      )}
    </section>
  );
}

export default MyOrders;
