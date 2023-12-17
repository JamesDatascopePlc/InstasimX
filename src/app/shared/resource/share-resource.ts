import { ChangeDetectorRef, Injectable, inject } from "@angular/core";
import { Resource } from "./resource";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, skip, tap } from "rxjs";

export function shareResourceFn<T extends (...args: any[]) => Resource<any>>(fn: T): T {
  return ((...args: unknown[]) => {
    const cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
    const resource: Resource<unknown> = fn(...args);
    
    resource.status$.pipe(
      takeUntilDestroyed(),
      skip(1),
      debounceTime(200),
      tap(() => cdr.detectChanges())
    )
    .subscribe();

    return resource;
  }) as T;
}