export interface Tutor {
  _id: string;
  name: string;
  email: string;
  profile: {
    bio: string;
    subjects: string[];
    education: string;
    experience: string;
    hourlyRate: number;
    availability: Availability[];
    expertiseLevel: 'Beginner' | 'Intermediate' | 'Expert';
    languages: string[];
    teachingStyle: string;
    rating: number;
    totalReviews: number;
  };
  avatar?: string;
}

export interface Availability {
  day: string;
  slots: string[];
}