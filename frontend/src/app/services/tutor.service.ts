import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';  // ✅ ADD THIS

@Injectable({
  providedIn: 'root'
})
export class TutorService {
  private apiUrl = environment.apiUrl + '/api';  // ✅ UPDATED THIS

  constructor(private http: HttpClient) { }

  getScheduledClasses() {
    return this.http.get(`${this.apiUrl}/tutor/scheduled-classes`);
  }

  updateBookingStatus(bookingId: string, status: string) {
    return this.http.patch(`${this.apiUrl}/tutor/booking/${bookingId}/status`, { status });
  }

  updateTutorProfile(profileData: any) {
    return this.http.put(`${this.apiUrl}/tutor/profile`, profileData);
  }

  searchTutors(filters: any) {
    let params = new HttpParams();
    if (filters.subject) params = params.set('subject', filters.subject);
    if (filters.minRate) params = params.set('minRate', filters.minRate);
    if (filters.maxRate) params = params.set('maxRate', filters.maxRate);
    if (filters.expertise) params = params.set('expertise', filters.expertise);
    
    return this.http.get(`${this.apiUrl}/tutor/search`, { params });
  }
}