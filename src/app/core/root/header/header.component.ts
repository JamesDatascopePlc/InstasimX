import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AppRouter, useAppRouter } from "src/routes";
import { CartItem, useCartItems } from "../../stores/cart/cart.store";
import { AdaptedRignal, Rignal } from "src/app/shared/angular/rignal";
import { RxIf } from "@rx-angular/template/if";
import { sumBy } from "lodash-es";

@Component({
  selector: "root-header",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RxIf],
  styles: `
    .animate-character {
      text-transform: uppercase;
      background-image: linear-gradient(-225deg, #b1c92d 0%, #15803d 50%, #e90014 100%);
      background-size: auto auto;
      background-clip: border-box;
      background-size: 200% auto;
      color: #fff;
      background-clip: text;
      text-fill-color: transparent;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textclip 8s linear infinite;
      display: inline-block;
    }

    @keyframes textclip {
      to {
        background-position: 200% center;
      }
    }
  `,
  template: `
    <header class="border-b border-palette-lighter sticky top-0 z-20 bg-white">
      <div class="flex items-center justify-between mx-auto max-w-6xl px-6 pb-2 pt-4 md:pt-6">
        <a class=" cursor-pointer" (click)="router.navigateTo('products')">
          <h1 class="flex no-underline animate__animated animate__flipInX">
            <img height="32" width="32" alt="logo" class="h-8 w-8 mr-1 object-contain" src="/assets/instasim.jpg">
            <span class="text-xl font-primary font-bold tracking-tight pt-1 animate-character">InstasimX</span>
          </h1>
        </a>
        <div>
          <a (click)="router.navigateTo('cart')" 
            class="relative" 
            aria-label="cart"
          >
            <img src="/assets/cart.png" class="animate__animated animate__lightSpeedInLeft" width="32" height="32" />
            <div *rxIf="cart.quantity() > 0" class="absolute top-0 right-0 text-xs bg-yellow-300 text-gray-900 font-semibold rounded-full py-1 px-2 transform translate-x-10 -translate-y-3">
              {{ cart.quantity() }}
            </div>
          </a>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  router: AppRouter = useAppRouter();
  
  cart: AdaptedRignal<CartItem[], {
    quantity: () => number;
  }> 
  = useCartItems((items: Rignal<CartItem[]>) => ({
    quantity: () => sumBy(items(), item => item.quantity),
  }));
}