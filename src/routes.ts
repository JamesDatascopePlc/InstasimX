import { Injectable, inject } from "@angular/core";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";

export type AppPath = "products" 
  | "products/product-info" 
  | "cart";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "products",
    pathMatch: "full"
  },
  {
    path: "products" as AppPath,
    loadComponent: () => import("./app/pages/products/products.page").then(m => m.ProductsPage),
  },
  {
    path: "products/product-info" as AppPath,
    loadComponent: () => import("./app/pages/products/product-info/product-info.page").then(m => m.ProductInfoPage)
  },
  {
    path: "cart" as AppPath,
    loadComponent: () => import("./app/pages/cart/cart.page").then(m => m.CartPage)
  }
];

export class AppRouter {
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  navigateTo(path: AppPath, queryParams?: Params | null | undefined): void {
    this.router.navigate(["/" + path], { queryParams });
  }

  updateQueryParams(queryParams: Params): void {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: "merge" });
  }
}

export function useAppRouter(): AppRouter {
  return new AppRouter();
}