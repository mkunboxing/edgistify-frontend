import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import { addToCartAsync, selectCartItems, fetchCartItems } from '../store/cartSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to add items to the cart.');
      return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      const result = await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
      
      // Refetch products to update stock information
      await fetchProducts();
      dispatch(fetchCartItems());
    } catch (error: any) { // Type assertion for error
      // Try to get the error message from the response if available
      const errorMessage = error?.message || 'Failed to add item to cart';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
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
      <Navbar 
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} 
        userName={localStorage.getItem('fullName') || 'Guest'} 
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-4 transform transition-transform duration-200 hover:scale-105">
              <img 
                src={product.image}
                alt={product.name} 
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
              <p className="text-gray-700 text-xl font-bold mb-4">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mb-4">Stock: {product.stock}</p>
              <div className="flex items-center justify-between">
                {cartItems[product._id] ? (
                  <>
                    <button 
                      onClick={() => handleAddToCart(product._id)} 
                      className="bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 transition duration-200"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleAddToCart(product._id)} 
                    className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition duration-200"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 