import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

export function param(name: string): string | null {
  const route: ActivatedRoute = inject(ActivatedRoute);

  return route.snapshot.queryParamMap.get(name);
}