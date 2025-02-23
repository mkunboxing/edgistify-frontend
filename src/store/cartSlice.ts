import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  _id: string;
  userId: string;
  productId: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk for adding to cart
export const addToCartAsync = createAsyncThunk<CartItem, { productId: string; quantity: number }>(
  'cart/addToCart',
  async ({ productId, quantity }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
    return await response.json(); // Ensure this returns the updated cart item
  }
);

// Async thunk for fetching cart items
export const fetchCartItems = createAsyncThunk<CartItem[]>(
  'cart/fetchItems',
  async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-cart-items`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cart items');
    }
    const data = await response.json();
    return data.cartItems; // Return the cartItems array
  }
);

// Add new thunk for removing items
export const removeFromCartAsync = createAsyncThunk<CartItem[], string>(
  'cart/removeFromCart',
  async (productId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
    const data = await response.json();
    // After removing, fetch the updated cart items
    const cartResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-cart-items`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!cartResponse.ok) {
      throw new Error('Failed to fetch updated cart items');
    }
    const cartData = await cartResponse.json();
    return cartData.cartItems; // Return the updated cart items
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart items';
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload); // Add the new item to the cart
        state.error = null;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Update the cart items with the new list
        state.error = null;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove item from cart';
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading; 