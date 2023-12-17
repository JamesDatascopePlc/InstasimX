import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { EnvironmentProviders } from "@angular/core";
import { Observable, of } from "rxjs";

export function provideMockHttpResults(value: { [key: string]: unknown }): EnvironmentProviders {
  const entries: [string, unknown][] = Object.entries(value);
  
  return provideHttpClient(
    withInterceptors([
      (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        const body: unknown = entries.find(([key]) => req.url.includes(key))?.[1];
        
        if (body == null) throw new Error(`No matches for: ${req.url}`);

        return of(new HttpResponse<unknown>({ body }));
      }
    ])
  )
}