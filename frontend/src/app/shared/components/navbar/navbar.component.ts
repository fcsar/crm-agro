import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  template: `
    <p-menubar [model]="items">
      <ng-template pTemplate="start">
        <div class="navbar-logo">
          <i class="pi pi-leaf mr-2"></i>
          <span class="navbar-title">CRM Agro</span>
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: [`
    ::ng-deep .p-menubar {
      border-radius: 0;
      border: none;
      border-bottom: 2px solid var(--primary-color);
      background: white;
      padding: 0.75rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-right: 2rem;

      i {
        font-size: 1.5rem;
      }
    }

    .navbar-title {
      @media (max-width: 768px) {
        display: none;
      }
    }

    ::ng-deep .p-menubar-root-list {
      gap: 0.5rem;

      .p-menuitem-link {
        padding: 0.75rem 1rem;
        border-radius: 6px;
        color: var(--text-color);
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          background: var(--surface-hover);
          color: var(--primary-color);
        }

        .p-menuitem-icon {
          margin-right: 0.5rem;
          color: var(--primary-color);
        }
      }

      .p-menuitem-active .p-menuitem-link,
      .p-menuitem-link.router-link-active {
        background: var(--primary-color);
        color: white;

        .p-menuitem-icon {
          color: white;
        }
      }
    }
  `],
})
export class NavbarComponent {
  items: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
      routerLink: '/dashboard',
    },
    {
      label: 'Leads',
      icon: 'pi pi-users',
      routerLink: '/leads',
    },
    {
      label: 'Propriedades',
      icon: 'pi pi-map',
      routerLink: '/properties',
    },
  ];
}
