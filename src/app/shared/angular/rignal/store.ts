import { BehaviorSubject, filter, skip, tap } from "rxjs";
import { AdaptedRignal, Rignal, adaptRignal } from ".";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export type StoreFn<T> = <A extends {}>(adaption?: (value: Rignal<T>) => A) => AdaptedRignal<T, A>;

export function createStore<T>(initialValue: T): StoreFn<T> {
  const $ = new BehaviorSubject<T>(initialValue);

  return <A extends {}>(adaption: (value: Rignal<T>) => A = () => ({} as A)) => {
    const value: AdaptedRignal<T, A> = adaptRignal($.getValue(), adaption);
    
    $.pipe(
      takeUntilDestroyed(),
      skip(1),
      filter((val: T) => val !== value()),
      tap((val: T) => value.set(val)) 
    )
    .subscribe();

    value.change$.pipe(
      takeUntilDestroyed(),
      tap((val: T) => $.next(val))
    )
    .subscribe();

    return value;
  }  
}