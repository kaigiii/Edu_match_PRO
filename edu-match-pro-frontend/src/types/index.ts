export interface SchoolNeed {
  id: string;
  school_id: string;
  schoolName?: string; // 前端計算得出，後端不返回
  title: string;
  description: string;
  category: string;
  location: string;
  student_count: number;
  image_url: string;
  urgency: 'high' | 'medium' | 'low';
  sdgs: number[];
  status?: 'active' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface CompanyDonation {
  id: string;
  need_id: string;
  company_id: string;
  donation_type: string;
  description?: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completion_date?: string;
  need?: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    student_count: number;
    image_url: string;
    urgency: string;
    sdgs: number[];
    status: string;
    school_id: string;
    created_at: string;
    updated_at?: string;
  };
  company?: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
}

export interface ImpactStory {
  id: string;
  title: string;
  schoolName: string;
  companyName: string;
  imageUrl: string;
  summary: string;
  storyDate: string;
  impact?: {
    studentsBenefited: number;
    equipmentDonated: string;
    duration: string;
  };
}

export interface CompanyDashboardStats {
  completedProjects: number;
  studentsHelped: number;
  volunteerHours: number;
  totalDonation: number;
  avgProjectDuration: number;
  successRate: number;
  sdgContributions: {
    [key: string]: number;
  };
}

export interface SchoolDashboardStats {
  totalNeeds: number;
  activeNeeds: number;
  completedNeeds: number;
  studentsBenefited: number;
  avgResponseTime: number;
  successRate: number;
}

export interface RecentProject {
  id: string;
  title: string;
  school: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  studentsBenefited: number;
  completionDate?: string;
}

// NOTE: Removed duplicate CompanyDonation definition

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface PlatformStats {
  schoolsWithNeeds: number;
  completedMatches: number;
  studentsBenefited: number;
  successRate: number;
}
