export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    sku: string;
  };
  quantity: number;
  total: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  itemId: string;
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}