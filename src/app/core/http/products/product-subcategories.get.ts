import { Resource, createResource, shareResourceFn } from "src/app/shared/resource";
import { Category } from "./product-categories.get";
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { memoize } from "lodash-es";

function getSubCategories(categoryId: number): Resource<Category[]> {
  const subCategories: Observable<Category[]> = inject(HttpClient).get<Category[]>(`${environment.API_URL}/GetProductChildCategories`, {
    params: { categoryId }
  });

  return createResource(subCategories, { initialValue: [] });
}

export const useSubCategories = shareResourceFn(memoize(getSubCategories));