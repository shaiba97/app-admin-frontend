import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core'; import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; import { NgClass } from '@angular/common'; import { AuthService } from '../../core/services/auth/auth.service';
import { LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideLogOut, LucidePhone, LucideNewspaper, LucideBell } from '@lucide/angular';
import { NotificationsService } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-shell', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, LucideLayoutDashboard, LucideUsers, LucideWallet, LucideUser, LucideLogOut, LucidePhone, LucideNewspaper, LucideBell],
  templateUrl: './shell.html',
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService); sidebarOpen = signal(true);
  notifSvc = inject(NotificationsService);

  ngOnInit(): void { this.notifSvc.connect(); }
  ngOnDestroy(): void { this.notifSvc.disconnect(); }

  navItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: 'layout-dashboard' },
    { path: '/users', label: 'المستخدمون', icon: 'users' },
    { path: '/financial', label: 'المالية', icon: 'wallet' },
    { path: '/support-contacts', label: 'جهات الاتصال', icon: 'phone' },
    { path: '/blog', label: 'المدونة', icon: 'newspaper' },
    { path: '/notifications', label: 'الإشعارات', icon: 'bell' },
    { path: '/profile', label: 'الملف الشخصي', icon: 'user' },
  ];

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  logout() { this.auth.logout(); }

  toArabicNum(n: number): string {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
