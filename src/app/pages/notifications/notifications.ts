import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBellOff, LucideCheckCheck, LucideRefreshCw, LucideArrowLeft, LucideCheckCircle, LucideXCircle, LucideAlertCircle, LucideLoaderCircle } from '@lucide/angular';
import { NotificationsService } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, LucideBellOff, LucideCheckCheck, LucideRefreshCw, LucideArrowLeft, LucideCheckCircle, LucideXCircle, LucideAlertCircle, LucideLoaderCircle],
  templateUrl: './notifications.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notifSvc = inject(NotificationsService);

  notifications = this.notifSvc.notifications;
  unreadCount = this.notifSvc.unreadCount;
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.notifSvc.loadNotifications();
    setTimeout(() => this.isLoading.set(false), 500);
  }

  ngOnDestroy() {}

  markRead(id: string) {
    this.notifSvc.markRead(id);
  }

  markAllRead() {
    this.notifSvc.markAllRead();
  }

  refresh() {
    this.isLoading.set(true);
    this.error.set('');
    this.notifSvc.loadNotifications();
    setTimeout(() => this.isLoading.set(false), 500);
  }

  notifIcon(type: string): string {
    if (type === 'BOOKING_CONFIRMED') return 'check-circle';
    if (type === 'PAYMENT_REJECTED' || type === 'BOOKING_CANCELLED') return 'x-circle';
    if (type === 'BOOKING_CREATED' || type === 'PAYMENT_PENDING') return 'alert-circle';
    return 'info';
  }

  notifColor(type: string): string[] {
    if (type === 'BOOKING_CONFIRMED' || type === 'PAYMENT_CONFIRMED')
      return ['text-[var(--success)]', 'bg-[var(--success-light)]'];
    if (type === 'PAYMENT_REJECTED' || type === 'BOOKING_CANCELLED')
      return ['text-[var(--danger)]', 'bg-[var(--danger-light)]'];
    return ['text-[var(--warning)]', 'bg-[var(--warning-light)]'];
  }

  toArabicNum(n: number): string {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  timeSince(d: any): string {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'الآن';
    if (diff < 60) return `${this.toArabicNum(diff)} دقيقة`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${this.toArabicNum(h)} ساعة`;
    return `${this.toArabicNum(Math.floor(h / 24))} يوم`;
  }
}
