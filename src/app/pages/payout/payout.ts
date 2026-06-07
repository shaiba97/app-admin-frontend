import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LucideBuilding2, LucideBus, LucideArrowLeft, LucideCheck, LucideX, LucideClock, LucideLoaderCircle, LucideWallet, LucideCircleDollarSign, LucideChevronLeft, LucideChevronRight, LucideActivity, LucideReceiptText, LucideRefreshCw, LucideAlertCircle } from '@lucide/angular';
import { PayoutService } from '../../core/services/payout/payout.service';

type Tab = 'companies' | 'requests' | 'history' | 'stats';

@Component({
  selector: 'app-payout',
  imports: [LucideBuilding2, LucideBus, LucideArrowLeft, LucideCheck, LucideX, LucideClock, LucideLoaderCircle, LucideWallet, LucideCircleDollarSign, LucideChevronLeft, LucideChevronRight, LucideActivity, LucideReceiptText, LucideRefreshCw, LucideAlertCircle],
  templateUrl: './payout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutComponent implements OnInit {
  private svc = inject(PayoutService);

  activeTab = signal<Tab>('companies');
  selectedCompany = signal<any | null>(null);

  companies = signal<any[]>([]);
  companyTrips = signal<any[]>([]);
  requests = signal<any[]>([]);
  history = signal<any[]>([]);
  stats = signal<any | null>(null);

  isLoading = signal(false);
  error = signal('');
  successMsg = signal('');
  payingTripId = signal<string | null>(null);
  payingAll = signal(false);
  approvingId = signal<string | null>(null);
  rejectingId = signal<string | null>(null);

  tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'companies', label: 'الشركات', icon: 'building2' },
    { id: 'requests', label: 'طلبات الصرف', icon: 'clock' },
    { id: 'history', label: 'سجل المدفوعات', icon: 'receipt-text' },
    { id: 'stats', label: 'إحصائيات', icon: 'activity' },
  ];

  ngOnInit(): void {
    this.loadTab('companies');
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.selectedCompany.set(null);
    this.error.set('');
    this.successMsg.set('');
    this.loadTab(tab);
  }

  loadTab(tab: Tab): void {
    switch (tab) {
      case 'companies': this.loadCompanies(); break;
      case 'requests': this.loadRequests(); break;
      case 'history': this.loadHistory(); break;
      case 'stats': this.loadStats(); break;
    }
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.svc.getCompanies().subscribe({
      next: (r: any) => { this.companies.set(r?.data ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل الشركات'); },
    });
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.svc.getRequests().subscribe({
      next: (r: any) => { this.requests.set(r?.data ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل الطلبات'); },
    });
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.svc.getHistory().subscribe({
      next: (r: any) => { this.history.set(r?.data ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل سجل المدفوعات'); },
    });
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.svc.getStats().subscribe({
      next: (r: any) => { this.stats.set(r?.data ?? null); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل الإحصائيات'); },
    });
  }

  selectCompany(company: any): void {
    this.selectedCompany.set(company);
    this.isLoading.set(true);
    this.svc.getCompanyTrips(company.id).subscribe({
      next: (r: any) => { this.companyTrips.set(r?.data ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل رحلات الشركة'); },
    });
  }

  backToCompanies(): void {
    this.selectedCompany.set(null);
    this.companyTrips.set([]);
  }

  payTrip(tripId: string): void {
    this.payingTripId.set(tripId);
    this.svc.payTrip(tripId).subscribe({
      next: () => { this.payingTripId.set(null); this.showSuccess('تم صرف الرحلة بنجاح ✓'); this.refreshCompanyDetail(); this.loadCompanies(); },
      error: (e: any) => { this.payingTripId.set(null); this.showError(e?.error?.message ?? 'فشل صرف الرحلة'); },
    });
  }

  payAll(): void {
    const company = this.selectedCompany();
    if (!company) return;
    this.payingAll.set(true);
    this.svc.payAll(company.id).subscribe({
      next: () => { this.payingAll.set(false); this.showSuccess('تم صرف جميع المستحقات بنجاح ✓'); this.refreshCompanyDetail(); this.loadCompanies(); },
      error: (e: any) => { this.payingAll.set(false); this.showError(e?.error?.message ?? 'فشل صرف المستحقات'); },
    });
  }

  private refreshCompanyDetail(): void {
    const company = this.selectedCompany();
    if (company) {
      this.svc.getCompanyTrips(company.id).subscribe({
        next: (r: any) => { this.companyTrips.set(r?.data ?? []); },
        error: () => {},
      });
    }
  }

  approveRequest(id: string): void {
    this.approvingId.set(id);
    this.svc.approveRequest(id).subscribe({
      next: () => { this.approvingId.set(null); this.showSuccess('تم قبول الطلب بنجاح'); this.loadRequests(); },
      error: (e: any) => { this.approvingId.set(null); this.showError(e?.error?.message ?? 'فشل قبول الطلب'); },
    });
  }

  rejectRequest(id: string): void {
    this.rejectingId.set(id);
    this.svc.rejectRequest(id).subscribe({
      next: () => { this.rejectingId.set(null); this.showSuccess('تم رفض الطلب'); this.loadRequests(); },
      error: (e: any) => { this.rejectingId.set(null); this.showError(e?.error?.message ?? 'فشل رفض الطلب'); },
    });
  }

  refresh(): void {
    this.loadTab(this.activeTab());
  }

  showSuccess(msg: string): void { this.successMsg.set(msg); this.error.set(''); setTimeout(() => this.successMsg.set(''), 4000); }
  showError(msg: string): void { this.error.set(msg ?? 'حدث خطأ'); this.successMsg.set(''); setTimeout(() => this.error.set(''), 5000); }

  totalUnpaidTrips(): number {
    return this.companyTrips().reduce((sum: number, t: any) => sum + (Number(t.unpaidAmount) || 0), 0);
  }

  totalCompanyUnpaid(): number {
    return this.companies().reduce((sum: number, c: any) => sum + (Number(c.unpaidAmount) || 0), 0);
  }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number): string { return this.toArabic(Math.round(n).toLocaleString('en')); }
  fmtDate(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })); }
  fmtDateTime(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })); }
  statusLabel(s: string): string { const m: Record<string, string> = { PENDING: 'قيد الانتظار', APPROVED: 'مقبول', REJECTED: 'مرفوض' }; return m[s] ?? s; }
  statusClasses(s: string): string[] {
    if (s === 'APPROVED') return ['bg-[var(--success-light)]', 'text-[var(--success)]'];
    if (s === 'REJECTED') return ['bg-[var(--danger-light)]', 'text-[var(--danger)]'];
    if (s === 'PENDING') return ['bg-[var(--warning-light)]', 'text-[var(--warning)]'];
    return ['bg-[var(--primary-light)]', 'text-[var(--text-primary)]'];
  }
}
