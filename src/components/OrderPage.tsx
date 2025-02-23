import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

// Define interfaces for Product and Order
interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
}

interface Order {
  _id: string;
  userId: string;
  products: {
    productId: Product;
    quantity: number;
    price: number;
    _id: string;
  }[];
  totalPrice: number;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
}

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartItemsCount={0} userName={localStorage.getItem('fullName') || 'Guest'} />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6">Your Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700 mb-4">You have no orders yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            {orders.map((order) => (
              <div key={order._id} className="mb-4 p-4 border-b">
                <h3 className="text-lg font-semibold">Order ID: {order._id}</h3>
                <p className="text-gray-700">Total Price: ${order.totalPrice.toFixed(2)}</p>
                <p className="text-gray-700">Shipping Address: {order.shippingAddress}</p>
                <p className="text-gray-700">Order Status: {order.orderStatus}</p>
                <h4 className="font-semibold mt-2">Products:</h4>
                <ul>
                  {order.products.map((product) => (
                    <li key={product._id} className="flex items-center text-gray-600 mb-2">
                      <img 
                        src={product.productId.image} 
                        alt={product.productId.name} 
                        className="w-16 h-16 object-cover rounded mr-2"
                      />
                      <span>{product.productId.name} - ${product.price.toFixed(2)} x {product.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage; 