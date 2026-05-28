import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LucidePlus, LucidePen, LucideTrash2, LucideEye, LucideEyeOff, LucideLoaderCircle, LucideFileText, LucideBookOpen } from '@lucide/angular';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, DatePipe, LucidePlus, LucidePen, LucideTrash2, LucideEye, LucideEyeOff, LucideLoaderCircle, LucideFileText, LucideBookOpen],
  template: `
    <div dir="rtl" class="p-4 md:p-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
              <svg lucideFileText class="w-5 h-5 text-[var(--primary)]"></svg>
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-[var(--text-primary)]">المقالات</h1>
              <p class="text-xs text-[var(--text-secondary)]">إدارة محتوى المدونة</p>
            </div>
          </div>
          <a routerLink="/blog/new"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] active:scale-95 transition-all no-underline shadow-sm">
            <svg lucidePlus class="w-4 h-4"></svg>
            <span>مقال جديد</span>
          </a>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <svg lucideLoaderCircle class="w-10 h-10 animate-spin text-[var(--primary)]"></svg>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p class="text-sm text-[var(--danger)]">{{ error() }}</p>
            <button (click)="load()" class="text-sm font-bold text-[var(--primary)] hover:underline">إعادة المحاولة</button>
          </div>
        } @else if (!posts().length) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div class="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
              <svg lucideFileText class="w-8 h-8 text-[var(--text-muted)] opacity-40"></svg>
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-base font-bold text-[var(--text-primary)]">لا توجد مقالات</p>
              <p class="text-sm text-[var(--text-muted)]">أنشئ أول مقال الآن</p>
            </div>
            <a routerLink="/blog/new" class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--primary)] text-white font-bold text-sm hover:bg-[var(--primary-hover)] transition-all no-underline shadow-lg">
              <svg lucidePlus class="w-4 h-4"></svg>
              <span>مقال جديد</span>
            </a>
          </div>
        } @else {
          <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-[var(--border)] bg-[var(--bg-base)]">
                    <th class="text-right px-4 py-3 text-xs font-bold text-[var(--text-muted)]">العنوان</th>
                    <th class="text-right px-4 py-3 text-xs font-bold text-[var(--text-muted)]">الكاتب</th>
                    <th class="text-center px-4 py-3 text-xs font-bold text-[var(--text-muted)]">الحالة</th>
                    <th class="text-center px-4 py-3 text-xs font-bold text-[var(--text-muted)]">التاريخ</th>
                    <th class="text-left px-4 py-3 text-xs font-bold text-[var(--text-muted)]">إجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border)]">
                  @for (p of posts(); track p.id) {
                    <tr class="hover:bg-[var(--bg-base)] transition-colors">
                      <td class="px-4 py-3">
                        <p class="text-sm font-bold text-[var(--text-primary)] truncate max-w-[250px]">{{ p.title }}</p>
                        <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ p.slug }}</p>
                      </td>
                      <td class="px-4 py-3 text-sm text-[var(--text-secondary)]">{{ p.author?.name }}</td>
                      <td class="px-4 py-3 text-center">
                        @if (p.published) {
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            <svg lucideEye class="w-3 h-3"></svg>
                            منشور
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                            <svg lucideEyeOff class="w-3 h-3"></svg>
                            مسودة
                          </span>
                        }
                      </td>
                      <td class="px-4 py-3 text-center text-xs text-[var(--text-secondary)]" dir="ltr">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-center justify-end gap-1">
                          <a [routerLink]="['/blog/view', p.id]"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                            title="عرض">
                            <svg lucideBookOpen class="w-3.5 h-3.5"></svg>
                          </a>
                          <a [routerLink]="['/blog', p.id]"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                            title="تعديل">
                            <svg lucidePen class="w-3.5 h-3.5"></svg>
                          </a>
                          <button (click)="remove(p.id)"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-all"
                            title="حذف">
                            <svg lucideTrash2 class="w-3.5 h-3.5"></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class BlogComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl.admin;

  posts = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<any[]>(`${this.api}/admin/blog`).subscribe({
      next: res => { this.posts.set(res); this.loading.set(false); },
      error: () => { this.error.set('فشل تحميل المقالات'); this.loading.set(false); },
    });
  }

  remove(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    this.http.delete(`${this.api}/admin/blog/${id}`).subscribe({
      next: () => this.posts.update(list => list.filter(p => p.id !== id)),
    });
  }
}
