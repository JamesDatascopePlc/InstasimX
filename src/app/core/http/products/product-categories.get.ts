import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { memoize } from "lodash-es";
import { Observable } from "rxjs";
import { Resource, createResource, shareResourceFn } from "src/app/shared/resource";
import { environment } from "src/environments/environment";

export type Category = {
  categoryId: number,
  description: string,
  slug: string
}

function getCategories(): Resource<Category[]> {
  const categories: Observable<Category[]> = inject(HttpClient).get<Category[]>(`${environment.API_URL}/GetProductParentCategories`);

  return createResource(categories, { initialValue: [] });
}

export const useCategories = shareResourceFn(memoize(getCategories));