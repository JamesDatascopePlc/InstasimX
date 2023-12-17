import { bootstrapApplication } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './routes';
import "./extensions";
import 'animate.css';
import { HeaderComponent } from './app/core/root/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <root-header />
    <router-outlet />
  `
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient()
  ]
})
.catch((err) => console.error(err));
