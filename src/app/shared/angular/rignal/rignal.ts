import { Injector, Signal, WritableSignal, computed, inject, runInInjectionContext, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, Subject, debounceTime } from "rxjs"

export type Rignal<T> = {
  (): T,
  change$: Observable<T>,
  input(value: T): void;
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
  select<R>(selectorFn: (value: T) => R): Signal<R>;
}

class RxSignal<T> {
  constructor(private initialValue: T) {}

  injector: Injector = inject(Injector);

  value: WritableSignal<T> = signal(this.initialValue);
  change$ = new Subject<T>();

  input(value: T): void {
    this.value.set(value);
  }

  set(value: T): void {
    this.value.set(value);
    this.change$.next(value);
  }

  update(updateFn: (value: T) => T): void {
    this.value.update(val => updateFn(val));
    this.change$.next(this.value());
  }

  select<R>(selectorFn: (value: T) => R): Signal<R> {
    return runInInjectionContext(this.injector, () => computed(() => selectorFn(this.value())));
  }
}

export function rignal<T>(initialValue: T): Rignal<T> {
  const rxSignal = new RxSignal<T>(initialValue);

  rxSignal.change$.pipe(
    takeUntilDestroyed(),
    debounceTime(200),
  )
  .subscribe();

  return Object.assign(() => rxSignal.value(), {
    change$: rxSignal.change$,
    input: rxSignal.input.bind(rxSignal),
    set: rxSignal.set.bind(rxSignal),
    update: rxSignal.update.bind(rxSignal),
    select: rxSignal.select.bind(rxSignal)
  });
}