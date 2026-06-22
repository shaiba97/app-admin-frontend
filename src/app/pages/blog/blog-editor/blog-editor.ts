import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { LucideArrowRight, LucideSave, LucideLoaderCircle } from '@lucide/angular';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor';

@Component({
  selector: 'app-blog-editor',
  imports: [RouterLink, FormsModule, LucideArrowRight, LucideSave, LucideLoaderCircle, RichTextEditorComponent],
  template: `
    <div dir="rtl" class="p-4 md:p-6">
      <div class="max-w-4xl mx-auto">
        <!-- HEADER -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <a routerLink="/blog" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--primary-light)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all no-underline">
              <svg lucideArrowRight class="w-5 h-5"></svg>
            </a>
            <div>
              <h1 class="text-xl font-extrabold text-[var(--text-primary)]">{{ isNew() ? 'مقال جديد' : 'تعديل المقال' }}</h1>
              <p class="text-xs text-[var(--text-secondary)]">أنشئ محتوى غني ومخصص</p>
            </div>
          </div>
          <button (click)="save()"
            [disabled]="saving()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] active:scale-95 transition-all disabled:opacity-50 shadow-sm">
            @if (saving()) {
              <svg lucideLoaderCircle class="w-4 h-4 animate-spin"></svg>
            } @else {
              <svg lucideSave class="w-4 h-4"></svg>
            }
            <span>{{ saving() ? 'جاري الحفظ...' : 'نشر' }}</span>
          </button>
        </div>

        <!-- FORM -->
        <div class="flex flex-col gap-4">
          <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">عنوان المقال</label>
                <input [ngModel]="title()" (ngModelChange)="title.set($event)" type="text" placeholder="أدخل عنوان المقال..."
                  class="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all">
              </div>
              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">الرابط (Slug)</label>
                <input [ngModel]="slug()" (ngModelChange)="slug.set($event)" type="text" placeholder="my-blog-post"
                  class="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-mono dir-ltr text-left">
              </div>
              <div>
                <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">ملخص (اختياري)</label>
                <textarea [ngModel]="excerpt()" (ngModelChange)="excerpt.set($event)" rows="2" placeholder="ملخص قصير يظهر في بطاقة المقال..."
                  class="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [ngModel]="published()" (ngModelChange)="published.set($event)" class="sr-only peer">
                  <div class="w-10 h-5.5 rounded-full bg-[var(--border)] peer-checked:bg-[var(--primary)] transition-all after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-[-18px]"></div>
                </label>
                <span class="text-xs font-semibold text-[var(--text-primary)]">منشور</span>
              </div>
            </div>
          </div>

          <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div class="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-base)]">
              <span class="text-xs font-bold text-[var(--text-secondary)]">محتوى المقال</span>
            </div>
            <div class="p-0">
              <app-rich-text-editor [(value)]="content" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BlogEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = environment.apiUrl.admin;

  isNew = signal(true);
  title = signal('');
  slug = signal('');
  excerpt = signal('');
  content = signal('');
  published = signal(false);
  saving = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isNew.set(false);
      this.http.get<any>(`${this.api}/admin/blog/${id}`).subscribe({
        next: p => {
          this.title.set(p.title);
          this.slug.set(p.slug);
          this.excerpt.set(p.excerpt ?? '');
          this.content.set(p.content);
          this.published.set(p.published);
        },
        error: () => this.router.navigate(['/blog']),
      });
    }
  }

  save(): void {
    if (!this.title().trim() || !this.slug().trim() || !this.content().trim()) return;
    this.saving.set(true);
    const body = { title: this.title(), slug: this.slug(), excerpt: this.excerpt(), content: this.content(), published: this.published() };
    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.http.put(`${this.api}/admin/blog/${id}`, body)
      : this.http.post(`${this.api}/admin/blog`, body);
    req.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/blog']); },
      error: () => { this.saving.set(false); alert('فشل الحفظ'); },
    });
  }
}
