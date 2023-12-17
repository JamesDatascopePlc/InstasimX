import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RxFor } from "@rx-angular/template/for";
import { Resource } from "src/app/shared/resource/resource";
import { Category, useCategories } from "src/app/core/http/products/product-categories.get";
import { Product, useProductsInCategory } from "src/app/core/http/products/products-in-category.get";
import { deferResource } from "src/app/shared/resource";
import { CartItem, useCartItems, withAddCartItem, withHasCartItem } from "src/app/core/stores/cart/cart.store";
import { AdaptedRignal, Rignal } from "src/app/shared/angular/rignal";
import { RxIf } from "@rx-angular/template/if";
import { AppRouter, useAppRouter } from "src/routes";
import { SpinnerComponent } from "src/app/shared/components";
import { NgClass } from "@angular/common";
import { param } from "src/app/shared/angular/router/param";
import { AdaptedSignal, adaptSignal } from "src/app/shared/angular/signal";

@Component({
  selector: "products-page",
  standalone: true,
  imports: [RxFor, RxIf, RouterLink, SpinnerComponent, NgClass],
  template: `
    <h1 class="leading-relaxed font-extrabold text-4xl text-center mt-4 py-2 sm:py-4">Products</h1>

    <div class="flex justify-center" role="group">
      <button *rxFor="let cat of categories.data()" 
        (click)="categoryId.update(cat.categoryId)" 
        type="button" 
        [ngClass]="{ 'ring-green-700 text-green-700': categoryId() === cat.categoryId }"
        class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-green-700 focus:z-10  focus:text-green-700"
      >
        {{ cat.description }}
      </button>
    </div>

    <div *rxIf="products.isLoading" class="text-center py-5">
      <spinner [size]="120" />
    </div>

    <div class="py-12 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8">
      <div *rxFor="let product of products.data()" 
        class="h-120 w-80 rounded shadow-lg mx-auto border border-palette-lighter"
      >
        <div (click)="router.navigateTo('products/product-info', { categoryId: categoryId(), productId: product.productId })"
          class="h-80 border-b-2 border-palette-lighter relative"
        >
          <img src="/assets/products/{{ product.imgPath }}" width="318" height="318" />
        </div>
        <div (click)="router.navigateTo('products/product-info', { categoryId: categoryId(), productId: product.productId })"
          class="min-h-[196px] relative"
        >
          <div class="font-primary text-palette-primary text-2xl pt-4 px-4 font-semibold">{{ product.name }}</div>
          <div class="text-lg text-gray-600 p-4 font-primary font-light whitespace-pre-line">{{ product.description }}</div>
          <div class="text-palette-dark font-primary font-medium text-base absolute bottom-0 right-0 mb-4 pl-8 pr-4 pb-1 pt-2 
            bg-palette-lighter rounded-tl-sm triangle"
          >
            £<span class="text-lg">{{ product.price }}</span>
          </div>          
        </div>
        <button
          [disabled]="cart.has(product.productId)" 
          (click)="cart.add({ product, quantity: 1 })"
          
          class="pt-3 pb-2 bg-green-700 text-white w-full mt-2 rounded-sm font-primary font-semibold text-xl flex justify-center items-baseline"
          [style.opacity]="cart.has(product.productId) ? .25 : 1"      
          aria-label="cart-button"
        >
          Add To Cart
        </button>          
      </div>
  `
})
export class ProductsPage {
  router: AppRouter = useAppRouter();

  cart: AdaptedRignal<CartItem[], {
    has: (productId: number) => boolean;
    add: (item: CartItem) => void;
  }> 
  = useCartItems((items: Rignal<CartItem[]>) => ({
    has: withHasCartItem.bind(items),
    add: withAddCartItem.bind(items)
  }));

  categories: Resource<Category[]> = useCategories();

  categoryId: AdaptedSignal<number, {
    update: (value: number) => void;
  }> 
  = adaptSignal(+param("categoryId")! || 2, categoryId => ({
    update: (value: number) => {
      this.router.updateQueryParams({ categoryId: value });
      categoryId.set(value);
    }
  }))

  products: Resource<Product[]> = deferResource(() => useProductsInCategory(this.categoryId()));
}
