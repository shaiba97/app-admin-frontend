import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'users/:id', renderMode: RenderMode.Client },
  { path: 'companies/:id', renderMode: RenderMode.Client },
  { path: 'blog/view/:id', renderMode: RenderMode.Client },
  { path: 'blog/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
