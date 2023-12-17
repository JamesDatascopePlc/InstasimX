import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PersistStrategy } from "../../resource";
import { Rignal, rignal } from "./rignal";
import { filter, tap } from "rxjs";

export type PersistRignalOptions<T> = {
  initialValue: T,
  key: string,
  storageStrategy: PersistStrategy
}

export function persistedRignal<T>({ initialValue, key, storageStrategy }: PersistRignalOptions<T>): Rignal<T> {
  const r: Rignal<T> = rignal(initialValue);

  storageStrategy.getItem<T>(key).pipe(
    takeUntilDestroyed(),
    filter(values => r() !== values),
    tap(values => values != null && r.input(values))
  )
  .subscribe();

  // Need to worry about remove and clear
  r.change$.pipe(
    takeUntilDestroyed(),
    tap(values => storageStrategy.setItem(key, values))
  )
  .subscribe();

  return r;
}