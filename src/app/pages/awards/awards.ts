import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AwardsService } from '../../core/services/awards/awards.service';
import { WsService } from '../../core/services/ws.service';
import { environment } from '../../../environments/environment';

type Tab = 'packs' | 'pending' | 'history';

@Component({
  selector: 'app-awards',
  imports: [FormsModule],
  templateUrl: './awards.html',
})
export class AwardsComponent implements OnInit, OnDestroy {
  private svc = inject(AwardsService);
  private ws = inject(WsService);
  private sanitizer = inject(DomSanitizer);
  private wsCleanups: (() => void)[] = [];

  activeTab = signal<Tab>('packs');
  tabs: { id: Tab; label: string }[] = [
    { id: 'packs', label: 'المكافآت' },
    { id: 'pending', label: 'الطلبات المعلقة' },
    { id: 'history', label: 'السجل' },
  ];

  packs = signal<any[]>([]);
  pending = signal<any[]>([]);
  history = signal<any[]>([]);
  isLoading = signal(false);
  error = signal('');
  successMsg = signal('');

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formTitle = signal('');
  formDescription = signal('');
  formIcon = signal('');
  formMinBookings = signal(0);
  formAwardValue = signal(0);
  isSaving = signal(false);

  approvingId = signal<string | null>(null);
  rejectingId = signal<string | null>(null);
  receiptFiles = signal<Map<string, File>>(new Map());
  rejectReasons = signal<Map<string, string>>(new Map());
  shownRejectInput = signal<string | null>(null);

  viewingReceipt = signal<string | null>(null);
  receiptError = signal(false);
  receiptSafeUrl = computed(() => {
    const url = this.viewingReceipt();
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  });

  packIcons = ['🏆', '⭐', '🎖️', '👑', '💎', '🌟', '🎯', '🏅'];

  ngOnInit(): void {
    this.refresh();
    this.wsCleanups.push(this.ws.on('financial:updated', () => this.loadPending()));
  }

  ngOnDestroy() { this.wsCleanups.forEach(fn => fn()); }

  refresh(): void {
    this.loadPacks();
    this.loadPending();
    this.loadHistory();
  }

  loadPacks(): void {
    this.isLoading.set(true);
    this.svc.getPacks().subscribe({
      next: (r: any) => { this.packs.set(r?.data ?? r ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.showError('فشل تحميل المكافآت'); },
    });
  }

  loadPending(): void {
    this.svc.getPending().subscribe({
      next: (r: any) => { this.pending.set(r?.data ?? r ?? []); },
      error: () => {},
    });
  }

  loadHistory(): void {
    this.svc.getHistory().subscribe({
      next: (r: any) => { this.history.set(r?.data ?? r ?? []); },
      error: () => {},
    });
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.error.set('');
    this.successMsg.set('');
    if (tab === 'pending') this.loadPending();
    else if (tab === 'history') this.loadHistory();
    else this.loadPacks();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formIcon.set('');
    this.formMinBookings.set(0);
    this.formAwardValue.set(0);
    this.showForm.set(true);
  }

  openEdit(p: any): void {
    this.editingId.set(p.id);
    this.formTitle.set(p.title);
    this.formDescription.set(p.description ?? '');
    this.formIcon.set(p.icon ?? '');
    this.formMinBookings.set(p.minBookings ?? 0);
    this.formAwardValue.set(Number(p.awardValue));
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingId.set(null); }

  save(): void {
    if (!this.formTitle().trim() || !this.formAwardValue()) { this.showError('يرجى تعبئة الاسم وقيمة المكافأة'); return; }
    this.isSaving.set(true);
    const data = {
      title: this.formTitle().trim(),
      description: this.formDescription().trim() || undefined,
      icon: this.formIcon() || undefined,
      minBookings: this.formMinBookings(),
      awardValue: this.formAwardValue(),
    };
    (this.editingId() ? this.svc.updatePack(this.editingId()!, data) : this.svc.createPack(data)).subscribe({
      next: () => { this.isSaving.set(false); this.closeForm(); this.showSuccess('تم حفظ المكافأة'); this.loadPacks(); },
      error: (e: any) => { this.showError(e?.error?.message ?? 'حدث خطأ'); this.isSaving.set(false); },
    });
  }

  deletePack(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذه المكافأة؟')) return;
    this.svc.removePack(id).subscribe({
      next: () => { this.showSuccess('تم الحذف'); this.loadPacks(); },
      error: (e: any) => this.showError(e?.error?.message),
    });
  }

  onReceiptSelected(event: Event, id: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.receiptFiles.update(m => new Map(m).set(id, file));
    }
  }

  getReceiptName(id: string): string { return this.receiptFiles().get(id)?.name ?? ''; }
  clearReceipt(id: string): void { this.receiptFiles.update(m => { const n = new Map(m); n.delete(id); return n; }); }

  approve(id: string): void {
    const file = this.receiptFiles().get(id);
    this.approvingId.set(id);
    this.svc.approve(id, file).subscribe({
      next: () => { this.approvingId.set(null); this.receiptFiles.update(m => { const n = new Map(m); n.delete(id); return n; }); this.showSuccess('تم قبول المكافأة'); this.loadPending(); this.loadPacks(); this.loadHistory(); },
      error: (e: any) => { this.approvingId.set(null); this.showError(e?.error?.message ?? 'فشل القبول'); },
    });
  }

  toggleRejectInput(id: string): void {
    this.shownRejectInput.set(this.shownRejectInput() === id ? null : id);
  }

  reject(id: string): void {
    const reason = this.rejectReasons().get(id);
    if (!reason?.trim()) { this.showError('يرجى كتابة سبب الرفض'); return; }
    this.rejectingId.set(id);
    this.svc.reject(id, reason).subscribe({
      next: () => { this.rejectingId.set(null); this.rejectReasons.update(m => { const n = new Map(m); n.delete(id); return n; }); this.shownRejectInput.set(null); this.showSuccess('تم رفض المكافأة'); this.loadPending(); this.loadHistory(); },
      error: (e: any) => { this.rejectingId.set(null); this.showError(e?.error?.message ?? 'فشل الرفض'); },
    });
  }

  onRejectReasonChange(id: string, value: string): void {
    this.rejectReasons.update(m => new Map(m).set(id, value));
  }

  getFileUrl(path: string): string {
    const baseUrl = environment.apiUrl.admin.replace(/\/api\/?$/, '');
    return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  viewReceipt(entry: { receiptFile?: string; receiptData?: string; receiptMime?: string }): void {
    this.receiptError.set(false);
    if (entry?.receiptData) {
      this.viewingReceipt.set(`data:${entry.receiptMime ?? 'image/jpeg'};base64,${entry.receiptData}`);
    } else if (entry?.receiptFile) {
      this.viewingReceipt.set(this.getFileUrl(entry.receiptFile));
    } else {
      this.viewingReceipt.set(null);
    }
  }

  closeReceipt(): void {
    this.viewingReceipt.set(null);
    this.receiptError.set(false);
  }

  showSuccess(msg: string): void { this.successMsg.set(msg); this.error.set(''); setTimeout(() => this.successMsg.set(''), 4000); }
  showError(msg: string): void { this.error.set(msg ?? 'حدث خطأ'); this.successMsg.set(''); setTimeout(() => this.error.set(''), 5000); }

  toArabic(n: number | string): string { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]); }
  formatAmount(n: number | string): string { return this.toArabic(Math.round(Number(n)).toLocaleString('en')); }
  fmtDate(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })); }
  fmtDateTime(d: any): string { if (!d) return '—'; return this.toArabic(new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })); }
  statusLabel(s: string): string { const m: Record<string, string> = { PENDING: 'قيد الانتظار', APPROVED: 'مقبول', REJECTED: 'مرفوض' }; return m[s] ?? s; }
}
