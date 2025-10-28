import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  tutors: any[] = [];
  bookings: any[] = [];
  activeTab = 'discover';
  showBookingModal = false;
  selectedTutor: any = null;
  currentUser: any;
  isLoading = true;
  
  // Search and Filters
  searchFilters = {
    subject: '',
    minRate: '',
    maxRate: '',
    expertise: '',
    availability: ''
  };

  // Stats
  stats = {
    totalBookings: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    favoriteTutors: 0
  };

  // Popular subjects for quick filtering
  popularSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
    'English', 'Biology', 'Economics', 'Business Studies'
  ];

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load tutors and bookings in parallel
    Promise.all([
      this.loadTutors(),
      this.loadBookings()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  loadTutors() {
    return new Promise((resolve) => {
      this.dataService.getTutors().subscribe({
        next: (tutors: any) => {
          this.tutors = tutors;
          this.calculateStats();
          resolve(tutors);
        },
        error: (error) => {
          console.error('Error loading tutors:', error);
          resolve(null);
        }
      });
    });
  }

  loadBookings() {
    return new Promise((resolve) => {
      this.dataService.getMyBookings().subscribe({
        next: (bookings: any) => {
          this.bookings = bookings;
          this.calculateStats();
          resolve(bookings);
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          resolve(null);
        }
      });
    });
  }

  calculateStats() {
    this.stats.totalBookings = this.bookings.length;
    this.stats.upcomingSessions = this.bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length;
    this.stats.completedSessions = this.bookings.filter(b => 
      b.status === 'completed'
    ).length;
    this.stats.favoriteTutors = new Set(this.bookings.map(b => b.tutor?._id)).size;
  }

  // Search and Filtering
  searchTutors() {
    this.isLoading = true;
    this.dataService.getTutors().subscribe({
      next: (tutors: any) => {
        let filteredTutors = tutors;
        
        // Apply filters
        if (this.searchFilters.subject) {
          filteredTutors = filteredTutors.filter((tutor: any) => 
            tutor.profile?.subjects?.some((subject: string) => 
              subject.toLowerCase().includes(this.searchFilters.subject.toLowerCase())
            )
          );
        }
        
        if (this.searchFilters.minRate) {
          filteredTutors = filteredTutors.filter((tutor: any) => 
            tutor.profile?.hourlyRate >= parseInt(this.searchFilters.minRate)
          );
        }
        
        if (this.searchFilters.maxRate) {
          filteredTutors = filteredTutors.filter((tutor: any) => 
            tutor.profile?.hourlyRate <= parseInt(this.searchFilters.maxRate)
          );
        }
        
        if (this.searchFilters.expertise) {
          filteredTutors = filteredTutors.filter((tutor: any) => 
            tutor.profile?.expertiseLevel === this.searchFilters.expertise
          );
        }

        if (this.searchFilters.availability) {
          filteredTutors = filteredTutors.filter((tutor: any) => 
            tutor.profile?.availability?.some((avail: any) => 
              avail.day === this.searchFilters.availability
            )
          );
        }
        
        this.tutors = filteredTutors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching tutors:', error);
        this.isLoading = false;
      }
    });
  }

  clearFilters() {
    this.searchFilters = {
      subject: '',
      minRate: '',
      maxRate: '',
      expertise: '',
      availability: ''
    };
    this.searchTutors();
  }

  quickFilter(subject: string) {
    this.searchFilters.subject = subject;
    this.searchTutors();
  }

  // Booking Management
  openBookingModal(tutor: any) {
    this.selectedTutor = tutor;
    this.showBookingModal = true;
  }

  bookTutor(bookingData: any) {
    const bookingPayload = {
      tutorId: this.selectedTutor._id,
      course: bookingData.course,
      scheduledDate: bookingData.date,
      startTime: bookingData.time,
      duration: bookingData.duration,
      notes: bookingData.notes
    };

    this.dataService.bookTutor(bookingPayload).subscribe({
      next: (response: any) => {
        this.bookings.unshift(response);
        this.calculateStats();
        this.showBookingModal = false;
        this.selectedTutor = null;
        
        // Show success message
        this.showNotification(`Successfully booked session with ${this.selectedTutor?.name}!`, 'success');
      },
      error: (error) => {
        console.error('Error booking tutor:', error);
        this.showNotification(
          'Booking failed: ' + (error.error?.message || 'Unknown error'), 
          'error'
        );
      }
    });
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookings = this.bookings.filter(booking => booking._id !== bookingId);
      this.calculateStats();
      this.showNotification('Booking cancelled successfully', 'success');
    }
  }

  joinMeeting(booking: any) {
    if (booking.meetingLink) {
      window.open(booking.meetingLink, '_blank');
    } else {
      this.showNotification('Meeting link not available yet. Please contact your tutor.', 'warning');
    }
  }

  // Utility Methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getUpcomingBookings() {
    return this.bookings
      .filter(b => b.status === 'confirmed' || b.status === 'pending')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  getTutorRating(tutor: any): number {
    return tutor.profile?.rating || 4.5;
  }

  getTutorExperience(tutor: any): string {
    return tutor.profile?.experience || 'Experienced tutor';
  }

  // Notification System
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    // In a real app, you'd use a proper notification service
    alert(`${type.toUpperCase()}: ${message}`);
  }

  // Check if tutor is available on specific day
  isTutorAvailable(tutor: any, day: string): boolean {
    return tutor.profile?.availability?.some((avail: any) => avail.day === day) || false;
  }

  // Get tutor's next available slot
  getNextAvailableSlot(tutor: any): string {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const availability = tutor.profile?.availability || [];
    
    for (let avail of availability) {
      if (avail.slots.length > 0) {
        return `${avail.day} at ${avail.slots[0]}`;
      }
    }
    
    return 'Check availability';
  }
}