import { BehaviorSubject, Observable, Subject, catchError, debounceTime, filter, firstValueFrom, map, of, shareReplay, skip, switchMap, take, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export type ResourceStatus = "Idle" | "Success" | "Error" | "Loading";

export type Resource<T> = {
  status: ResourceStatus;
  status$: Observable<ResourceStatus>;
  isIdle: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  lastUpdated: Date | undefined;
  is(status: ResourceStatus): Promise<void>;
  data(): T;
  /**
   * Maps a result from the data using the provided function.
   *
   * @param {Function} selectorFn - The function used to map the result from the data.
   * @return {Resource} A new resource containing the selected result.
   */
  select<TResult>(selectorFn: (data: T) => TResult): Resource<TResult>;
  refresh(): void;
}

export type ResourceOptions<T> = {
  initialValue: T
}

export class AsyncResource<T> implements Resource<T> {
  constructor(protected observer$: Observable<T>, protected options: ResourceOptions<T>) {}

  protected _status$ = new BehaviorSubject<ResourceStatus>("Idle");

  get status(): ResourceStatus { return this._status$.getValue(); }
  status$: Observable<ResourceStatus> = this._status$.asObservable();

  get isIdle(): boolean { return this.status === "Idle" }
  get isSuccess(): boolean { return this.status === "Success" }
  get isLoading(): boolean { return this.status === "Loading" }
  get isError(): boolean { return this.status === "Error" }

  is(status: ResourceStatus): Promise<void> {
    return firstValueFrom(this.status$.pipe(
      filter(s => s === status),
      map(() => void 0)
    ));
  }

  lastUpdated: Date | undefined = undefined;
  error: unknown = {};

  protected _data: { value: T } = { value: this.options.initialValue }

  protected start$ = new Subject<void>();
  data$: Observable<T> = this.start$.pipe(
    tap(() => {
      this._status$.next("Loading");
    }),
    switchMap(() => this.observer$),
    tap(data => {
      this._data.value = data;
      this.lastUpdated = new Date();
      this.error = {};
      this._status$.next("Success");
    }),
    catchError((error, caught) => {
      this.error = error;
      this._status$.next("Error");
      
      if (error instanceof HttpErrorResponse === false)
        throw error;

      return caught;
    }),
    shareReplay()
  );
  
  data(): T {
    if (this.isIdle) {
      this.data$.pipe(take(1)).subscribe();

      this.start$.next();
    }

    return this._data.value;
  }

  select<TResult>(selectorFn: (data: T) => TResult): Resource<TResult> {
    return new SelectAsyncResource(this, this.options.initialValue, selectorFn);
  }

  refresh(): void {
    this.data$.pipe(take(1)).subscribe();

    this.start$.next();
  }
}

export class SelectAsyncResource<T, U> implements Resource<U> {
  protected initialValue: U;
  protected _data: { value: U };

  constructor(protected resource: Resource<T>, initialValue: T, protected selectorFn: (data: T) => U) {
    this.initialValue = selectorFn(initialValue);
    this._data = { value: this.initialValue };
  }

  get status(): ResourceStatus { return this.resource.status; }
  get status$(): Observable<ResourceStatus> { return this.resource.status$; }

  get isIdle(): boolean { return this.status === "Idle" }
  get isSuccess(): boolean { return this.status === "Success" }
  get isLoading(): boolean { return this.status === "Loading" }
  get isError(): boolean { return this.status === "Error" }

  lastUpdated: Date | undefined = undefined;
  get error(): unknown { return this.resource.error }

  is(status: ResourceStatus): Promise<void> {
    return firstValueFrom(this.status$.pipe(
      filter(s => s === status),
      map(() => void 0)
    ));
  }

  data(): U {
    if (this.resource.isIdle) {
      this.resource.refresh();
    }

    if (this.lastUpdated !== this.resource.lastUpdated && this.resource.isSuccess) {
      this._data.value = this.selectorFn(this.resource.data());
      this.lastUpdated = this.resource.lastUpdated;
    }

    return this._data.value;
  }

  protected selectResources: Resource<unknown>[] = [];
  select<TResult>(selectorFn: (data: U) => TResult): Resource<TResult> {
    const subResource = new SelectAsyncResource(this, this.initialValue, selectorFn);
    this.selectResources = [...this.selectResources, subResource];
  
    return subResource;
  }

  refresh(): void {
    this.resource.refresh();
  }
}

export function createResource<T, U extends T | undefined>(observer$: Observable<U>, options: ResourceOptions<U> = { initialValue: undefined as U }): Resource<U> {
  const resource: Resource<U> = new AsyncResource<U>(observer$, options);

  try {
    const cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    resource.status$.pipe(
      takeUntilDestroyed(),
      skip(1),
      debounceTime(200),
      filter(status => ["Loading", "Success", "Error"].includes(status)),
      tap(() => cdr.detectChanges())
    )
    .subscribe();
  } finally {
    return resource;
  }
}

export function resource<T>(value: T): Resource<T> {
  return createResource(of(value), { initialValue: value });
}