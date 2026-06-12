import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PayoutService {
  private http = inject(HttpClient);
  private api = environment.apiUrl.admin;

  getCompanies() {
    return this.http.get<any>(`${this.api}/admin/payout/companies`);
  }

  getCompanyTrips(companyId: string) {
    return this.http.get<any>(`${this.api}/admin/payout/company/${companyId}/trips`);
  }

  payTrip(tripId: string, receiptFile?: File) {
    if (receiptFile) {
      const fd = new FormData();
      fd.append('receiptFile', receiptFile);
      return this.http.post<any>(`${this.api}/admin/payout/pay-trip/${tripId}`, fd);
    }
    return this.http.post<any>(`${this.api}/admin/payout/pay-trip/${tripId}`, {});
  }

  payAll(companyId: string, receiptFile?: File) {
    if (receiptFile) {
      const fd = new FormData();
      fd.append('receiptFile', receiptFile);
      return this.http.post<any>(`${this.api}/admin/payout/pay-all/${companyId}`, fd);
    }
    return this.http.post<any>(`${this.api}/admin/payout/pay-all/${companyId}`, {});
  }

  getRequests() {
    return this.http.get<any>(`${this.api}/admin/payout/requests`);
  }

  approveRequest(id: string, receiptFile?: File) {
    if (receiptFile) {
      const fd = new FormData();
      fd.append('receiptFile', receiptFile);
      return this.http.post<any>(`${this.api}/admin/payout/requests/${id}/approve`, fd);
    }
    return this.http.post<any>(`${this.api}/admin/payout/requests/${id}/approve`, {});
  }

  rejectRequest(id: string) {
    return this.http.post<any>(`${this.api}/admin/payout/requests/${id}/reject`, {});
  }

  getHistory() {
    return this.http.get<any>(`${this.api}/admin/payout/history`);
  }

  getStats() {
    return this.http.get<any>(`${this.api}/admin/payout/stats`);
  }
}
