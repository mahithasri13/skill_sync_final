import { Component, OnInit } from '@angular/core';

interface Review {
  id: string;
  student: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-tutor-review',
  templateUrl: './tutor-review.component.html',
  styleUrls: ['./tutor-review.component.css']
})
export class TutorReviewComponent implements OnInit {
  reviews: Review[] = [];

  // form model
  student = '';
  rating = 5;
  comment = '';

  constructor() { }

  ngOnInit(): void {
    const raw = localStorage.getItem('tutor_reviews');
    if (raw) {
      try { this.reviews = JSON.parse(raw); } catch (e) { this.reviews = []; }
    } else {
      // seed with a couple example reviews for demo
      this.reviews = [
        { id: this.uuid(), student: 'Asha', rating: 5, comment: 'Very helpful and patient tutor!', date: new Date().toISOString() },
        { id: this.uuid(), student: 'Rahul', rating: 4, comment: 'Great explanations, helped me a lot.', date: new Date().toISOString() }
      ];
      this.saveToStorage();
    }
  }

  addReview() {
    if (!this.student || !this.comment) return;
    const r: Review = {
      id: this.uuid(),
      student: this.student,
      rating: Number(this.rating),
      comment: this.comment,
      date: new Date().toISOString()
    };
    this.reviews.unshift(r);
    this.saveToStorage();
    this.student = '';
    this.rating = 5;
    this.comment = '';
  }

  deleteReview(id: string) {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.saveToStorage();
  }

  averageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  private saveToStorage() {
    try { localStorage.setItem('tutor_reviews', JSON.stringify(this.reviews)); } catch (e) { }
  }

  private uuid() {
    return 'rv-' + Math.random().toString(36).slice(2, 9);
  }
}
