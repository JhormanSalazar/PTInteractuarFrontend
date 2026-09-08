import { Routes } from '@angular/router';
import { SolicitudesListPage } from './features/solicitudes/pages/solicitudes-list.page';

export const routes: Routes = [
  { path: '', component: SolicitudesListPage },
  { path: '**', redirectTo: '' },
];
