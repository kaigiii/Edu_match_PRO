from typing import Dict, Any
from sqlmodel import SQLModel


class SchoolDashboardStats(SQLModel):
    """學校儀表板統計數據"""
    totalNeeds: int
    activeNeeds: int
    completedNeeds: int
    studentsBenefited: int


class CompanyDashboardStats(SQLModel):
    """企業儀表板統計數據"""
    completedProjects: int
    studentsHelped: int
    totalDonation: int
    volunteerHours: int
    avgProjectDuration: int
    successRate: float
    sdgContributions: Dict[str, int]


class PlatformStats(SQLModel):
    """平台整體統計數據"""
    schoolsWithNeeds: int
    completedMatches: int
    studentsBenefited: int
    successRate: float
