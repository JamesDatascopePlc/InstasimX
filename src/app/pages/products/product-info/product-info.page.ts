import { Component } from "@angular/core";
import { RxIf } from "@rx-angular/template/if";
import { Product, useProductsInCategory } from "src/app/core/http/products/products-in-category.get";
import { CartItem, useCartItems, withAddCartItem, withHasCartItem } from "src/app/core/stores/cart/cart.store";
import { AdaptedRignal, Rignal } from "src/app/shared/angular/rignal";
import { param } from "src/app/shared/angular/router/param";
import { SpinnerComponent } from "src/app/shared/components";
import { Resource, deferResource, resource } from "src/app/shared/resource";
import { AppRouter, useAppRouter } from "src/routes";

@Component({
  selector: "product-info-page",
  standalone: true,
  imports: [RxIf, SpinnerComponent],
  template: `
    <div *rxIf="product.isLoading" class="text-center py-12">
      <spinner [size]="120" />
    </div>
    
    <div *rxIf="product.data() as product" class="min-h-screen py-12 sm:pt-20">
      <div class="flex flex-col justify-center items-center md:flex-row md:items-start space-y-8 md:space-y-0 md:space-x-4 lg:space-x-8 max-w-6xl w-11/12 mx-auto">
        <div class="w-full md:w-1/2 max-w-md border border-palette-lighter bg-white rounded shadow-lg animate__animated animate__fadeIn">
          <img src="assets/products/{{ product.imgPath }}" width="446" height="384" />
        </div>
        <div class="flex flex-col justify-between h-full w-full md:w-1/2 max-w-xs mx-auto space-y-4 min-h-128">
          <a
            (click)="router.navigateTo('products', { categoryId })"
            aria-label="back-to-products"
            class="border border-palette-primary text-palette-primary text-lg font-primary font-semibold pt-2 pb-1 leading-relaxed flex 
              justify-center items-center focus:ring-1 focus:ring-palette-light focus:outline-none w-full hover:bg-palette-lighter rounded-sm"
          >
            Back To All Products
          </a>
      
          <div class="font-primary">
            <h1 class="leading-relaxed font-extrabold text-3xl text-palette-primary py-2 sm:py-4">
              {{ product.name }}
            </h1>
            <p class="font-medium text-lg whitespace-pre-line">
              {{ product.description }}
            </p>
            <div class="text-xl text-palette-primary font-medium py-4">
              £<span>{{ product.price }}</span>
            </div>
          </div>
          
          <div class="flex justify-start space-x-2 w-full">
            <div class="flex flex-col items-start space-y-1 flex-grow-0">
              <label class="text-gray-500 text-base">Qty.</label>
              <input #qty type="number" 
                inputmode="numeric" 
                id="quantity" 
                name="quantity" 
                min="1" 
                step="1" 
                class="text-gray-900 form-input border border-gray-300 w-16 rounded-sm focus:border-palette-light focus:ring-palette-light" 
                value="1"
              >
            </div>
        </div>
        <div class="relative">
          <button 
            (click)="cart.has(product.productId)
              ? cart.addQty(product.productId, +qty.value) 
              : cart.add({ product, quantity: +qty.value })"
            class="pt-3 pb-2 bg-green-700 text-white w-full mt-2 rounded-sm font-primary font-semibold text-xl flex justify-center items-baseline"
            aria-label="cart-button"
          >
            Add To Cart
          </button>  
          <div *rxIf="cart.has(product.productId)" class="animate__animated animate__bounceIn absolute top-0 right-0 text-xs bg-yellow-300 text-gray-900 font-semibold rounded-full py-1 px-2 transform translate-x-3 -translate-y-3">
            {{ cart.getQty(product.productId) }}
          </div>
        </div>   
      </div>
    </div>
  `
})
export class ProductInfoPage {
  router: AppRouter = useAppRouter();

  cart: AdaptedRignal<CartItem[], {
    has: (productId: number) => boolean;
    add: (item: CartItem) => void;
    getQty: (productId: number) => number;
    addQty: (productId: number, qty: number) => void;
  }> 
  = useCartItems((items: Rignal<CartItem[]>) => ({
    has: withHasCartItem.bind(items),
    add: withAddCartItem.bind(items),

    getQty: (productId: number): number => items().find(i => i.product.productId === productId)?.quantity ?? 0,
    addQty: (productId: number, qty: number): void => {
      const existingItem: CartItem = items().find(i => i.product.productId === productId)!;
      
      items.update(items => [
        ...items.filter(i => i.product.productId !== productId),
        {
          ...existingItem,
          quantity: existingItem.quantity + qty
        }
      ])
    }
  }));

  categoryId: number | undefined = param("categoryId")?.toNumber();
  productId: number | undefined = param("productId")?.toNumber();

  product: Resource<Product | undefined> = deferResource(() => this.categoryId != null 
    ? useProductsInCategory(this.categoryId)
    : resource([])
  )
  .select((products: Product[]) => products.find(product => product.productId === this.productId));
}