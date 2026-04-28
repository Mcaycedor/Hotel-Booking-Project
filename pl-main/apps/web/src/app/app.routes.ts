import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@app/lib-ui-components').then((m) => m.AuthComponent),
  },

  {
    path: '',
    loadComponent: () => import('@app/lib-ui-components').then((m) => m.HomePage),
  },

  {
    path: 'assessment',
    loadComponent: () =>
      import('@app/lib-ui-components').then(
        (m) => m.AssessmentPageComponent
      ),
  },

  {
    path: 'programs',
    loadComponent: () => import('@app/lib-ui-components').then((m) => m.HomePage), // Placeholder
  },
  {
    path: 'resources',
    loadComponent: () => import('@app/lib-ui-components').then((m) => m.HomePage), // Placeholder
  },
  {
    path: 'support',
    loadComponent: () => import('@app/lib-ui-components').then((m) => m.HomePage), // Placeholder
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
