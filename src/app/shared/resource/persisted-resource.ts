import { BehaviorSubject, Observable, filter, merge, shareReplay, switchMap, take, tap } from "rxjs";
import { Resource, createResource } from "./resource";

export type PersistStrategy = {
  getItem: <T>(key: string) => Observable<T | null | undefined>;
  setItem: <T>(key: string, value: T) => void;
  removeItem$: Observable<string>;
  clear$: Observable<void>;
  removeItem: (key: string) => void;
  clear: () => void
}

export type PersistResourceOptions<T> = {
  key: string,
  initialValue: T,
  $: Observable<T>,
  strategy: PersistStrategy
}

export function usePersistedResource<T>({ key, initialValue, $, strategy }: PersistResourceOptions<T>): Resource<T> {
  const fromStorage$: Observable<T | null | undefined> = strategy.getItem(key).pipe(
    shareReplay(1) as any
  );
  
  const isCached$ = new BehaviorSubject(false);

  const data$: Observable<T> = merge(
    // Check storage and return if cached
    isCached$.pipe(
      take(1),
      filter((isCached) => !isCached),
      switchMap(() => fromStorage$),
      filter(val => val != null),
      tap(() => isCached$.next(true)),
    ),
    // Check storage, return stream if not cached and then store in storage
    isCached$.pipe(
      take(1),
      filter((isCached) => !isCached),
      switchMap(() => fromStorage$),
      filter(val => val == null),
      switchMap(() => $),
      tap((value: T) => {
        strategy.setItem(key, value);
        isCached$.next(true)
      })
    ),
    // Refreshs cache
    isCached$.pipe(
      take(1),
      filter((isCached) => isCached),
      switchMap(() => $),
      tap((value: T) => strategy.setItem(key, value))
    )
  ) as Observable<T>;
  
  const resource: Resource<T> = createResource(data$, { initialValue });

  strategy.clear$.pipe(
    tap(() => {
      isCached$.next(false);
    })
  )
  .subscribe();

  return resource;
}