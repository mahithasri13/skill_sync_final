import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-booking-modal',
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css']
})
export class BookingModalComponent {
  @Input() tutor: any;
  @Output() book = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  bookingData = {
    course: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  };

  timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  courses = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'English',
    'Biology',
    'Economics',
    'Business Studies'
  ];

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  calculatePrice(): number {
    const hourlyRate = this.tutor?.profile?.hourlyRate || 300;
    return (hourlyRate * this.bookingData.duration) / 60;
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.book.emit({
        ...this.bookingData,
        price: this.calculatePrice()
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.bookingData.course &&
      this.bookingData.date &&
      this.bookingData.time
    );
  }

  onClose() {
    this.close.emit();
  }
}