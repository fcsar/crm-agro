import { Routes } from '@angular/router';

export const LEADS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/leads-list/leads-list.component').then(
        (m) => m.LeadsListComponent
      ),
  },
];
