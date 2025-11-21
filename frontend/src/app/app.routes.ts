import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('./features/leads/leads.routes').then((m) => m.LEADS_ROUTES),
  },
  {
    path: 'properties',
    loadChildren: () =>
      import('./features/properties/properties.routes').then(
        (m) => m.PROPERTIES_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
