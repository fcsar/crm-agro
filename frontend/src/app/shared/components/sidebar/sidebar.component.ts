import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isDarkMode = false;
  isCollapsed = false;
  isMobileOpen = false;

  menuSections: MenuSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Dashboard', icon: 'pi pi-chart-line', route: '/dashboard' },
      ]
    },
    {
      title: 'GESTÃO',
      items: [
        { label: 'Leads', icon: 'pi pi-users', route: '/leads' },
        { label: 'Propriedades', icon: 'pi pi-map', route: '/properties' },
      ]
    }
  ];

  bottomMenu: MenuItem[] = [];

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (typeof window !== 'undefined') {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  closeMobileSidebar() {
    if (this.isMobile()) {
      this.isMobileOpen = false;
    }
  }

  isMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.documentElement.classList.add('dark-mode');
      }
    }
  }
}
