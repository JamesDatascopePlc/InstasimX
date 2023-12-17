import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RxFor } from "@rx-angular/template/for";
import { RxIf } from "@rx-angular/template/if";
import { RxUnpatch } from "@rx-angular/template/unpatch";
import { sumBy } from "lodash-es";
import { CartItem, useCartItems } from "src/app/core/stores/cart/cart.store";
import { AdaptedRignal, Rignal } from "src/app/shared/angular/rignal";
import { AppRouter, useAppRouter } from "src/routes";

@Component({
  selector: "cart-page",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RxFor, RxIf, RxUnpatch],
  template: `
    <div class="container mx-auto mb-20 min-h-screen">
      <h1 class="leading-relaxed font-primary font-extrabold text-4xl text-center text-palette-primary mt-4 py-2 sm:py-4">Your Cart</h1>
      <div class="min-h-80 max-w-2xl my-2 sm:my-8 mx-auto w-full">
        <table class="mx-auto">
          <thead>
            <tr class="uppercase text-xs sm:text-sm text-palette-primary border-b border-palette-light">
              <th class="font-primary font-normal px-6 py-4">Product</th>
              <th class="font-primary font-normal px-6 py-4">Quantity</th>
              <th class="font-primary font-normal px-6 py-4 hidden sm:table-cell">Price</th>
              <th class="font-primary font-normal px-6 py-4">Remove</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-palette-lighter">
            <tr *rxFor="let item of items" class="text-sm sm:text-base text-gray-600 text-center">
              <td class="font-primary font-medium px-4 sm:px-6 py-4 flex items-center">
                <img src="assets/products/{{ item.product.imgPath }}" [alt]="item.product.name" height="64" width="64" class="hidden sm:inline-flex">
                <a class="pt-1 pl-3">{{ item.product.name }}</a>
              </td>
              <td class="font-primary font-medium px-4 sm:px-6 py-4">
                <input #num
                  type="number" 
                  inputmode="numeric" 
                  min="1" 
                  step="1" 
                  
                  class="text-gray-900 form-input border border-gray-300 w-16 rounded-sm focus:border-palette-light focus:ring-palette-light" 
                  
                  [value]="item.quantity"
                  (change)="num.value === '0' 
                    ? remove(item.product.productId) 
                    : updateQty(item, +num.value)"
                >
              </td>
              <td class="font-primary text-base font-light px-4 sm:px-6 py-4 hidden sm:table-cell">
                £<span class="text-lg">{{ (item.product.price * item.quantity).toFixed(2) }}</span>
              </td>
              <td class="font-primary font-medium px-4 sm:px-6 py-4">
                <button (click)="remove(item.product.productId)" aria-label="delete-item" class="">
                  Remove
                </button>
              </td>
            </tr>
            <tr class="text-center">
              <td></td>
              <td class="font-primary text-base text-gray-600 font-semibold uppercase px-4 sm:px-6 py-4">Subtotal</td>
              <td class="font-primary text-lg text-palette-primary font-medium px-4 sm:px-6 py-4">
                £<span class="text-xl">{{ total().toFixed(2) }}</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="max-w-sm mx-auto space-y-4 px-2">
        <a *rxIf="total() > 0"
          aria-label="checkout-products" 
          class="bg-green-700 text-white text-lg font-primary font-semibold pt-2 pb-1 leading-relaxed flex justify-center items-center focus:ring-1 focus:ring-palette-light focus:outline-none w-full rounded-sm">
          Check Out
        </a>
        <a (click)="router.navigateTo('products')" aria-label="back-to-products" class="border border-palette-primary text-palette-primary text-lg font-primary font-semibold pt-2 pb-1 leading-relaxed flex  justify-center items-center focus:ring-1 focus:ring-palette-light focus:outline-none w-full hover:bg-palette-lighter rounded-sm">
          Back To All Products
        </a>
      </div>
    </div>
  `
})
export class CartPage {
  router: AppRouter = useAppRouter();

  cart: AdaptedRignal<CartItem[], {}> = useCartItems();

  items: CartItem[] = this.cart();
  updateQty(item: CartItem, quantity: number): void {
    item.quantity = quantity;
    this.cart.set([...this.items]);
  }
  remove(productId: number): void { 
    this.items = this.items.filter(i => i.product.productId !== productId);
    this.cart.set([...this.items]);
  }

  total(): number {
    return sumBy(this.items, i => i.quantity * i.product.price);
  }
}