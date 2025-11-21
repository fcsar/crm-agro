import { Routes } from '@angular/router';

export const PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/properties-list/properties-list.component').then(
        (m) => m.PropertiesListComponent
      ),
  },
];
