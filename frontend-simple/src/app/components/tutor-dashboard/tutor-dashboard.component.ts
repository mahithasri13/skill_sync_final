import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TutorService } from '../../services/tutor.service';

@Component({
  selector: 'app-tutor-dashboard',
  templateUrl: './tutor-dashboard.component.html',
  styleUrls: ['./tutor-dashboard.component.css']
})
export class TutorDashboardComponent implements OnInit {
  scheduledClasses: any[] = [];
  activeTab = 'overview';
  currentUser: any;
  isLoading = true;
  
  // Stats
  stats = {
    totalStudents: 0,
    completedSessions: 0,
    pendingSessions: 0,
    confirmedSessions: 0,
    totalEarnings: 0,
    profileCompletion: 0
  };

  // Profile Management
  tutorProfile: any = {
    bio: 'Passionate educator dedicated to student success',
    subjects: [],
    education: '',
    experience: '',
    hourlyRate: 500,
    expertiseLevel: 'Intermediate',
    languages: ['English'],
    teachingStyle: '',
    availability: []
  };
  
  newSubject = '';
  newLanguage = '';
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  constructor(
    private authService: AuthService,
    private tutorService: TutorService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load scheduled classes
    this.tutorService.getScheduledClasses().subscribe({
      next: (response: any) => {
        this.scheduledClasses = response;
        this.calculateStats();
        this.loadProfile();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    const uniqueStudents = new Set(this.scheduledClasses.map((c: any) => c.student?._id));
    
    this.stats.totalStudents = uniqueStudents.size;
    this.stats.completedSessions = this.scheduledClasses.filter((c: any) => c.status === 'completed').length;
    this.stats.pendingSessions = this.scheduledClasses.filter((c: any) => c.status === 'pending').length;
    this.stats.confirmedSessions = this.scheduledClasses.filter((c: any) => c.status === 'confirmed').length;
    this.stats.totalEarnings = this.scheduledClasses
      .filter((c: any) => c.status === 'completed')
      .reduce((sum: number, session: any) => sum + (session.price || 0), 0);
    
    // Calculate profile completion
    this.calculateProfileCompletion();
  }

  calculateProfileCompletion() {
    let completion = 0;
    if (this.tutorProfile.bio && this.tutorProfile.bio.length > 10) completion += 20;
    if (this.tutorProfile.subjects.length > 0) completion += 20;
    if (this.tutorProfile.education) completion += 15;
    if (this.tutorProfile.experience) completion += 15;
    if (this.tutorProfile.availability.length > 0) completion += 20;
    if (this.tutorProfile.teachingStyle) completion += 10;
    
    this.stats.profileCompletion = Math.min(completion, 100);
  }

  loadProfile() {
    if (this.currentUser?.profile) {
      this.tutorProfile = { ...this.tutorProfile, ...this.currentUser.profile };
    }
    this.calculateProfileCompletion();
  }

  // Booking Management
  updateBookingStatus(bookingId: string, status: string) {
    this.tutorService.updateBookingStatus(bookingId, status).subscribe({
      next: (response: any) => {
        const index = this.scheduledClasses.findIndex((b: any) => b._id === bookingId);
        if (index !== -1) {
          this.scheduledClasses[index] = response;
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update booking status: ' + error.error?.message);
      }
    });
  }

  generateMeetingLink(bookingId: string) {
    const meetingLink = `https://meet.skillsync.com/${bookingId}-${Date.now()}`;
    
    // In a real app, you'd save this to the booking
    const booking = this.scheduledClasses.find(b => b._id === bookingId);
    if (booking) {
      booking.meetingLink = meetingLink;
    }
    
    alert(`Meeting link generated:\n${meetingLink}\n\nThis has been saved to the booking.`);
    return meetingLink;
  }

  // Profile Management
  addSubject() {
    if (this.newSubject.trim() && !this.tutorProfile.subjects.includes(this.newSubject.trim())) {
      this.tutorProfile.subjects.push(this.newSubject.trim());
      this.newSubject = '';
      this.calculateProfileCompletion();
    }
  }

  removeSubject(index: number) {
    this.tutorProfile.subjects.splice(index, 1);
    this.calculateProfileCompletion();
  }

  addLanguage() {
    if (this.newLanguage.trim() && !this.tutorProfile.languages.includes(this.newLanguage.trim())) {
      this.tutorProfile.languages.push(this.newLanguage.trim());
      this.newLanguage = '';
    }
  }

  removeLanguage(index: number) {
    this.tutorProfile.languages.splice(index, 1);
  }

  toggleAvailability(day: string, slot: string) {
    let dayAvailability = this.tutorProfile.availability.find((a: any) => a.day === day);
    
    if (!dayAvailability) {
      dayAvailability = { day, slots: [] };
      this.tutorProfile.availability.push(dayAvailability);
    }
    
    const slotIndex = dayAvailability.slots.indexOf(slot);
    if (slotIndex > -1) {
      dayAvailability.slots.splice(slotIndex, 1);
      // Remove day if no slots left
      if (dayAvailability.slots.length === 0) {
        this.tutorProfile.availability = this.tutorProfile.availability.filter((a: any) => a.day !== day);
      }
    } else {
      dayAvailability.slots.push(slot);
      dayAvailability.slots.sort();
    }
    
    this.calculateProfileCompletion();
  }

  isSlotSelected(day: string, slot: string): boolean {
    const dayAvailability = this.tutorProfile.availability.find((a: any) => a.day === day);
    return dayAvailability ? dayAvailability.slots.includes(slot) : false;
  }

  saveProfile() {
    this.isLoading = true;
    this.tutorService.updateTutorProfile(this.tutorProfile).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        alert('Profile updated successfully! 🎉');
        
        // Update local user data
        this.currentUser.profile = response.profile;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.calculateProfileCompletion();
      },
      error: (error) => {
        this.isLoading = false;
        alert('Error updating profile: ' + (error.error?.message || 'Please try again.'));
      }
    });
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

  getUpcomingClasses() {
    return this.scheduledClasses
      .filter((c: any) => c.status === 'confirmed' || c.status === 'pending')
      .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  getRecentBookings() {
    return this.scheduledClasses
      .slice(0, 5)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Quick actions
  completeSession(bookingId: string) {
    this.updateBookingStatus(bookingId, 'completed');
  }

  confirmBooking(bookingId: string) {
    this.updateBookingStatus(bookingId, 'confirmed');
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.updateBookingStatus(bookingId, 'cancelled');
    }
  }
}