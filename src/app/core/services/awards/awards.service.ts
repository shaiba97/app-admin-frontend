import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AwardsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  getPacks(): Observable<any> { return this.http.get(`${this.api}/admin/awards/packs`); }
  createPack(data: any): Observable<any> { return this.http.post(`${this.api}/admin/awards/packs`, data); }
  updatePack(id: string, data: any): Observable<any> { return this.http.patch(`${this.api}/admin/awards/packs/${id}`, data); }
  removePack(id: string): Observable<any> { return this.http.delete(`${this.api}/admin/awards/packs/${id}`); }
  getPending(): Observable<any> { return this.http.get(`${this.api}/admin/awards/pending`); }
  getUserAwards(userId: string): Observable<any> { return this.http.get(`${this.api}/admin/awards/user/${userId}`); }
  getHistory(): Observable<any> { return this.http.get(`${this.api}/admin/awards/history`); }
  approve(id: string, receiptFile?: File): Observable<any> {
    if (receiptFile) {
      const fd = new FormData();
      fd.append('receiptFile', receiptFile);
      return this.http.post(`${this.api}/admin/awards/approve/${id}`, fd);
    }
    return this.http.post(`${this.api}/admin/awards/approve/${id}`, {});
  }
  reject(id: string, reason?: string): Observable<any> { return this.http.post(`${this.api}/admin/awards/reject/${id}`, { reason }); }
}
