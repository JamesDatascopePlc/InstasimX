import { Product } from "../../http/products/products-in-category.get";
import { Rignal, StoreFn, createStore } from "src/app/shared/angular/rignal";

export type CartItem = {
  product: Product,
  quantity: number
}

export const useCartItems: StoreFn<CartItem[]> = createStore([]);

export function withHasCartItem(this: Rignal<CartItem[]>, productId: number): boolean {
  return this().some(item => item.product.productId === productId);
}

export function withAddCartItem(this: Rignal<CartItem[]>, item: CartItem): void {
  this.update(items => [...items, item]);
}