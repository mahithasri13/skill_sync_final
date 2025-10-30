import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';  // ✅ ADD THIS

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl + '/api';  // ✅ UPDATED THIS

  constructor(private http: HttpClient) { }

  getTutors() {
    return this.http.get(`${this.apiUrl}/student/tutors`);
  }

  getTutorById(id: string) {
    return this.http.get(`${this.apiUrl}/student/tutors/${id}`);
  }

  bookTutor(bookingData: any) {
    return this.http.post(`${this.apiUrl}/student/book-tutor`, bookingData);
  }

  getMyBookings() {
    return this.http.get(`${this.apiUrl}/student/my-bookings`);
  }

  postReview(payload: { bookingId: string; rating: number; comment?: string }) {
    return this.http.post(`${this.apiUrl}/student/review`, payload);
  }

  getTutorReviews(tutorId: string) {
    return this.http.get(`${this.apiUrl}/student/tutor/${tutorId}/reviews`);
  }
}