import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoginMode = true;
  isLoading = false;
  error: string = '';
  
  loginData = { 
    email: 'aarav.kumar@skillsync.com', 
    password: 'password123', 
    role: 'student' as 'student' | 'tutor' 
  };
  
  registerData = { 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'student' as 'student' | 'tutor' 
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // FIXED: Add the missing methods
  switchToLogin() {
    this.isLoginMode = true;
    this.error = '';
  }

  switchToRegister() {
    this.isLoginMode = false;
    this.error = '';
  }

  switchMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }

  onLogin(): void {
    this.isLoading = true;
    this.error = '';
    
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.token && response.data.user) {
          this.authService.setUser(response.token, response.data.user);
          this.navigateToDashboard();
        } else {
          this.error = 'Invalid response from server';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }

  onRegister(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Passwords do not match!';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.register(this.registerData).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.token && response.data.user) {
          this.authService.setUser(response.token, response.data.user);
          this.navigateToDashboard();
        } else {
          this.error = 'Invalid response from server';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loginAsStudent(): void {
    this.loginData = { 
      email: 'aarav.kumar@skillsync.com', 
      password: 'password123', 
      role: 'student' 
    };
    this.onLogin();
  }

  loginAsTutor(): void {
    this.loginData = { 
      email: 'rajesh.sharma@skillsync.com', 
      password: 'password123', 
      role: 'tutor' 
    };
    this.onLogin();
  }

  private navigateToDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'student') {
      this.router.navigate(['/student']);
    } else {
      this.router.navigate(['/tutor']);
    }
  }
}