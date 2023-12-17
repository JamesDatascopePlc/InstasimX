import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { ProductInfoPage } from "./product-info.page";
import { CartItem } from "src/app/core/stores/cart/cart.store";

@Component({
  selector: "product-info-page-story",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductInfoPage],
  template: `<product-info-page />`
})
export class ProductInfoPageStory {
  @ViewChild(ProductInfoPage) page!: ProductInfoPage;
  set cart(items: CartItem[]) {
    this.page.cart.set(items);
  }

  set categoryId(id: number) {
    this.page.categoryId = id;
  }

  set productId(id: number) {
    this.page.productId = id;
  }
}