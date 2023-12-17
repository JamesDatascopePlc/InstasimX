import { ReplaySubject, filter, firstValueFrom, map, startWith, switchMap } from "rxjs";
import { Resource, ResourceStatus } from "./resource";
import { Injector, inject, runInInjectionContext } from "@angular/core";

export class AsyncDeferedResource<T> implements Resource<T> {
  constructor(protected resourceFn: () => Resource<T>) {}

  injector: Injector = inject(Injector);
  resource: Resource<T> | undefined = undefined;

  init$ = new ReplaySubject<void>(1);
  status$ = this.init$.pipe(
    startWith("Idle"),
    filter(() => this.resource != null),
    switchMap(() => this.resource!.status$)
  );
  get status(): ResourceStatus { return this.resource?.status || "Idle"; }

  get isIdle(): boolean { return this.resource?.isIdle || true }
  get isSuccess(): boolean { return this.resource?.isSuccess || false }
  get isLoading(): boolean { return this.resource?.isLoading || false }
  get isError(): boolean { return this.resource?.isError || false }

  get lastUpdated(): Date | undefined { return this.resource?.lastUpdated }
  get error(): unknown { return this.resource?.error || {} }

  is(status: ResourceStatus): Promise<void> {
    return firstValueFrom(this.status$.pipe(
      filter(s => s === status),
      map(() => void 0)
    ));
  }

  data(): T {
    const res: Resource<T> = runInInjectionContext(this.injector, () => this.resourceFn());

    if (this.resource !== res) {
      this.resource = res;
      this.init$.next();
    }

    return this.resource.data();
  }

  refresh(): void {
    this.resource = runInInjectionContext(this.injector, () => this.resourceFn());
    this.init$.next();

    this.resource.refresh();
  }
  
  select<TResult>(selectorFn: (data: T) => TResult): Resource<TResult> {
    return runInInjectionContext(this.injector, () => new AsyncDeferedResource(() => this.resourceFn().select(selectorFn)));
  }
}

export function deferResource<T>(resourceFn: () => Resource<T>): Resource<T> {
  return new AsyncDeferedResource(resourceFn);
}