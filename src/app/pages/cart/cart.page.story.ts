import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { CartPage } from "./cart.page";
import { CartItem } from "src/app/core/stores/cart/cart.store";

@Component({
  selector: "cart-page-story",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<cart-page />`,
  imports: [CartPage]
})
export class CartPageStory {
  @ViewChild(CartPage) page!: CartPage;
  
  set items(items: CartItem[]) {
    this.page.cart.set(items);
  }
}