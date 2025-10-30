import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { TutorDashboardComponent } from './components/tutor-dashboard/tutor-dashboard.component';
import { TutorReviewComponent } from './components/tutor-review/tutor-review.component';
import { StudentReviewComponent } from './components/student-review/student-review.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'student', component: StudentDashboardComponent },
  { path: 'tutor', component: TutorDashboardComponent },
  { path: 'tutor/reviews', component: TutorReviewComponent },
  { path: 'student/reviews', component: StudentReviewComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }