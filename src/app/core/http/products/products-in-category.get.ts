import { HttpClient } from "@angular/common/http"
import { inject } from "@angular/core"
import { memoize } from "lodash-es";
import { Observable, map } from "rxjs";
import { Resource, createResource, shareResourceFn } from "src/app/shared/resource";
import { environment } from "src/environments/environment";

export type Product = {
  imgPath: string,
  productId: number,
  category: {
    categoryId: number,
    description: string,
    slug: string
  },
  name: string,
  description: string,
  slug: string,
  price: number
}

function getProductsInCategory(categoryId: number): Resource<Product[]> {
  const products: Observable<Product[]> = inject(HttpClient).get<Product[]>(`${environment.API_URL}/GetProductsInCategory`, {
    params: { categoryId }
  }).pipe(
    map(products => products.map(p => ({
      ...p,
      description: p.description.replace(/\&\#13\;/, "").replace(/\&\#13\;/g, "\n")
    })))
  );

  return createResource(products, { initialValue: [] });
}

export const useProductsInCategory = shareResourceFn(memoize(getProductsInCategory));