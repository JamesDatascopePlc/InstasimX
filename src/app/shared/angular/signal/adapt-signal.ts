import { Injector, Signal, WritableSignal, computed, inject, runInInjectionContext, signal } from "@angular/core";

export type AdaptedSignal<T, A extends {}> = WritableSignal<T> & A;

export function adaptSignal<T, A extends {}>(initialValue: T, adaption: (value: WritableSignal<T>) => A): AdaptedSignal<T, A> {
  const value: WritableSignal<T> = signal(initialValue);

  return Object.assign(value, adaption(value));
}

export type AdaptedReadOnlySignal<T, A extends {}> = Signal<T> & A;

export function adaptComputed<T, A extends {}>(computation: () => T, adaption: (value: Signal<T>) => A): AdaptedReadOnlySignal<T, A> {
  const injector: Injector = inject(Injector);

  return runInInjectionContext(injector, () => {
    const value: Signal<T> = computed(() => computation());
  
    return Object.assign(value, adaption(value));
  });
}