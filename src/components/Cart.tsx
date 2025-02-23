import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCartItems, 
  removeFromCartAsync,
  selectCartItems, 
  selectCartLoading, 
  selectCartError 
} from '../store/cartSlice';
import Navbar from './Navbar';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  
  // State for shipping address
  const [shippingAddress, setShippingAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
      toast.success('Item removed from cart!');
    } catch (error) {
      toast.error('Failed to remove item from cart');
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      toast.success('Order placed successfully!');
      navigate('/orders'); // Redirect to the Order Page
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
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

  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.productId.price * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} userName={localStorage.getItem('fullName') || 'Guest'} />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6">Your Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700 mb-4">Your cart is empty.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between mb-4 p-4 border-b">
                <img 
                  src={item.productId.image}
                  alt={item.productId.name} 
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-grow ml-4">
                  <h3 className="text-lg font-semibold">{item.productId.name}</h3>
                  <p className="text-gray-700">${item.productId.price.toFixed(2)} x {item.quantity}</p>
                  <p className="text-gray-900 font-bold">
                    Total: ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-4 py-2 bg-gray-100 rounded">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(item.productId._id)}
                    className="bg-gray-200 text-gray-800 rounded px-3 py-1 hover:bg-gray-300 transition duration-200 ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Total:</h3>
                <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-semibold mb-2">Shipping Address:</label>
                <input 
                  type="text" 
                  value={shippingAddress} 
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    setIsAddressValid(e.target.value.trim() !== ''); // Validate address
                  }}
                  className="border border-gray-300 rounded p-2"
                  placeholder="Enter your shipping address"
                />
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => navigate('/')} 
                  className="bg-gray-200 text-gray-800 rounded px-6 py-2 hover:bg-gray-300 transition duration-200"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={handleCheckout} 
                  className={`bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700 transition duration-200 ${!isAddressValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isAddressValid} // Disable if address is not valid
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 