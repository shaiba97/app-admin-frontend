import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { LucideArrowRight, LucideEye, LucideEyeOff, LucideLoaderCircle, LucidePen } from '@lucide/angular';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, DatePipe, LucideArrowRight, LucideEye, LucideEyeOff, LucideLoaderCircle, LucidePen],
  template: `
    <div dir="rtl" class="p-4 md:p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <a routerLink="/blog" class="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
            <svg lucideArrowRight class="w-4 h-4"></svg>
            العودة إلى المقالات
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
        } @else {
          <div class="flex flex-col gap-4">
            <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                @if (post().published) {
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    <svg lucideEye class="w-3 h-3"></svg>
                    منشور
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                    <svg lucideEyeOff class="w-3 h-3"></svg>
                    مسودة
                  </span>
                }
              </div>

              <h1 class="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-3">{{ post().title }}</h1>

              <div class="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-6">
                <span>{{ post().author?.name }}</span>
                <span>•</span>
                <span>{{ post().createdAt | date:'dd/MM/yyyy' }}</span>
              </div>

              @if (post().excerpt) {
                <p class="text-sm text-[var(--text-secondary)] mb-6 italic border-r-2 border-[var(--border)] pr-4">{{ post().excerpt }}</p>
              }

              <div class="prose prose-sm max-w-none text-[var(--text-primary)] leading-relaxed [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:pr-5 [&_ol]:pr-5 [&_li]:my-1 [&_a]:text-[var(--primary)] [&_a]:underline [&_img]:rounded-xl [&_img]:my-4" [innerHTML]="post().content"></div>
            </div>

            <div class="flex items-center justify-end gap-2">
              <a [routerLink]="['/blog', post().id]"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] active:scale-95 transition-all no-underline shadow-sm">
                <svg lucidePen class="w-4 h-4"></svg>
                تعديل المقال
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class BlogDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = environment.apiUrl.admin;

  post = signal<any>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/blog']);
      return;
    }
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.error.set('');
    this.http.get<any>(`${this.api}/admin/blog/${id}`).subscribe({
      next: p => { this.post.set(p); this.loading.set(false); },
      error: () => { this.error.set('فشل تحميل المقال'); this.loading.set(false); },
    });
  }
}
