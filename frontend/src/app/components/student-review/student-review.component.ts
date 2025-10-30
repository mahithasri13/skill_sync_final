import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-review',
  templateUrl: './student-review.component.html',
  styleUrls: ['./student-review.component.css']
})
export class StudentReviewComponent implements OnInit {
  bookings: any[] = [];
  selectedBooking: any = null;
  rating = 5;
  comment = '';
  currentUser: any;
  isLoading = true;

  constructor(private dataService: DataService, private auth: AuthService) { }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.dataService.getMyBookings().subscribe({
      next: (res: any) => {
        this.bookings = res || [];
  // Allow reviews for any booking that isn't cancelled so students can review tutors they booked
  this.bookings = this.bookings.filter((b: any) => b.status !== 'cancelled');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.isLoading = false;
      }
    });
  }

  selectBooking(b: any) {
    this.selectedBooking = b;
    this.rating = 5;
    this.comment = '';
  }

  submitReview() {
    if (!this.selectedBooking) return;
    const payload = { bookingId: this.selectedBooking._id, rating: this.rating, comment: this.comment };
    this.dataService.postReview(payload).subscribe({
      next: (res: any) => {
        alert('Review submitted');
        this.selectedBooking = null;
        this.loadBookings();
      },
      error: (err) => {
        console.error('Error submitting review', err);
        alert('Failed to submit review: ' + (err.error?.message || err.message));
      }
    });
  }
}
