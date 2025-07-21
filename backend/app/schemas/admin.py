from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PopularSubject(BaseModel):
    strSubjectCode: str = Field(..., description="Subject code")
    strSubjectTitle: str = Field(..., description="Subject title")
    intViewCount: int = Field(..., description="Number of views or selections")

class PopularCareer(BaseModel):
    strCareerTitle: str = Field(..., description="Career title")
    intRecommendationCount: int = Field(..., description="Number of times recommended")

class ReportGenerationTrend(BaseModel):
    dtDate: datetime = Field(..., description="Date of report generation")
    intCount: int = Field(..., description="Number of reports generated on this date")

class CommonPathway(BaseModel):
    arrSubjects: List[str] = Field(..., description="List of subject codes in the pathway")
    strCareerTitle: str = Field(..., description="Career title")
    intCount: int = Field(..., description="Number of times this pathway was chosen")

class AvgConfidenceByYear(BaseModel):
    intYearLevel: int = Field(..., description="Year level")
    floatAvgConfidence: float = Field(..., description="Average confidence score")

class RecentDownload(BaseModel):
    dtDownloadedAt: datetime = Field(..., description="Download timestamp")
    strUserId: str = Field(..., description="User ID")
    strReportId: Optional[str] = Field(None, description="Report ID")

class QuizSubmissionTrend(BaseModel):
    dtDate: datetime = Field(..., description="Date of quiz submission")
    intCount: int = Field(..., description="Number of quizzes submitted on this date")

class ActiveUsersByDay(BaseModel):
    dtDate: datetime = Field(..., description="Date")
    intActiveUsers: int = Field(..., description="Number of active users on this date")

class AdminStatsResponse(BaseModel):
    """Admin dashboard statistics response"""
    total_users: int = Field(..., description="Total number of users")
    total_quizzes: int = Field(..., description="Total number of quiz results")
    total_reports: int = Field(..., description="Total number of career reports")
    active_users: int = Field(..., description="Number of active users in last 24 hours")
    total_courses: int = Field(..., description="Total number of courses")
    total_resources: int = Field(..., description="Total number of resources")
    intPendingResources: int = Field(..., description="Number of resources pending moderation")
    arrPopularSubjects: List[PopularSubject] = Field(default_factory=list, description="Most viewed/selected subjects")
    arrPopularCareers: List[PopularCareer] = Field(default_factory=list, description="Most recommended careers")
    arrReportGenerationTrends: List[ReportGenerationTrend] = Field(default_factory=list, description="Report generation counts by date")
    arrCommonPathways: List[CommonPathway] = Field(default_factory=list, description="Most common subject-career mappings")
    arrAvgConfidenceByYear: List[AvgConfidenceByYear] = Field(default_factory=list, description="Average quiz confidence scores by year level")
    arrRecentDownloads: List[RecentDownload] = Field(default_factory=list, description="Recent report download events")
    arrQuizSubmissionTrends: List[QuizSubmissionTrend] = Field(default_factory=list, description="Quiz submissions by date")
    arrActiveUsersByDay: List[ActiveUsersByDay] = Field(default_factory=list, description="Active user counts by day for the last N days")

class SiteSettingsResponse(BaseModel):
    """Site settings response"""
    site_name: str = Field(..., description="Site name")
    site_description: str = Field(..., description="Site description")
    maintenance_mode: bool = Field(..., description="Maintenance mode status")
    allow_new_registrations: bool = Field(..., description="Allow new user registrations")
    default_user_role: str = Field(..., description="Default user role")
    max_upload_size: int = Field(..., description="Maximum upload size in MB")
    allowed_file_types: List[str] = Field(..., description="Allowed file types")
    ai_enabled: bool = Field(..., description="AI functionality enabled")
    max_quiz_attempts: int = Field(..., description="Maximum quiz attempts per user")
    report_retention_days: int = Field(..., description="Report retention period in days")

class SiteSettingsUpdate(BaseModel):
    """Site settings update request"""
    site_name: Optional[str] = Field(None, description="Site name")
    site_description: Optional[str] = Field(None, description="Site description")
    maintenance_mode: Optional[bool] = Field(None, description="Maintenance mode status")
    allow_new_registrations: Optional[bool] = Field(None, description="Allow new user registrations")
    default_user_role: Optional[str] = Field(None, description="Default user role")
    max_upload_size: Optional[int] = Field(None, description="Maximum upload size in MB")
    allowed_file_types: Optional[List[str]] = Field(None, description="Allowed file types")
    ai_enabled: Optional[bool] = Field(None, description="AI functionality enabled")
    max_quiz_attempts: Optional[int] = Field(None, description="Maximum quiz attempts per user")
    report_retention_days: Optional[int] = Field(None, description="Report retention period in days")

class AdminActivityResponse(BaseModel):
    """Admin activity response"""
    id: str = Field(..., description="Activity ID")
    admin_user_id: str = Field(..., description="Admin user ID")
    action: str = Field(..., description="Action performed")
    details: Optional[Dict[str, Any]] = Field(None, description="Action details")
    created_at: datetime = Field(..., description="Activity timestamp")

class UserManagementResponse(BaseModel):
    """User management response"""
    id: str = Field(..., description="User ID")
    clerk_user_id: str = Field(..., description="Clerk user ID")
    email: str = Field(..., description="User email")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    is_admin: bool = Field(..., description="Admin status")
    last_active: Optional[datetime] = Field(None, description="Last active timestamp")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class ResourceManagementResponse(BaseModel):
    """Resource management response"""
    id: str = Field(..., description="Resource ID")
    title: str = Field(..., description="Resource title")
    description: Optional[str] = Field(None, description="Resource description")
    type: str = Field(..., description="Resource type")
    url: Optional[str] = Field(None, description="Resource URL")
    status: str = Field(..., description="Resource status")
    submitted_by: Optional[str] = Field(None, description="Submitted by user ID")
    submitted_at: Optional[datetime] = Field(None, description="Submission timestamp")
    approved_by: Optional[str] = Field(None, description="Approved by user ID")
    approved_at: Optional[datetime] = Field(None, description="Approval timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

class AdminDashboardResponse(BaseModel):
    """Admin dashboard response"""
    stats: AdminStatsResponse = Field(..., description="Dashboard statistics")
    recent_activity: List[AdminActivityResponse] = Field(..., description="Recent admin activity")
    pending_resources: List[ResourceManagementResponse] = Field(..., description="Pending resources")

class AdminUserUpdateRequest(BaseModel):
    """Admin user update request"""
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    is_admin: Optional[bool] = Field(None, description="Admin status")
    email: Optional[str] = Field(None, description="Email address")

class AdminResourceUpdateRequest(BaseModel):
    """Admin resource update request"""
    title: Optional[str] = Field(None, description="Resource title")
    description: Optional[str] = Field(None, description="Resource description")
    type: Optional[str] = Field(None, description="Resource type")
    url: Optional[str] = Field(None, description="Resource URL")
    status: Optional[str] = Field(None, description="Resource status")

class AdminActivityLogRequest(BaseModel):
    """Admin activity log request"""
    action: str = Field(..., description="Action performed")
    details: Optional[Dict[str, Any]] = Field(None, description="Action details")

class FeedbackReport(BaseModel):
    id: str
    strUserId: Optional[str] = Field(None, description="User ID (if authenticated)")
    strType: str = Field(..., description="Type of feedback: bug, suggestion, question, etc.")
    strMessage: str = Field(..., description="Feedback or bug report message")
    strStatus: str = Field(..., description="Status: open, in_progress, resolved, closed")
    strAdminResponse: Optional[str] = Field(None, description="Admin response or resolution")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    strType: str = Field(..., description="Type of feedback: bug, suggestion, question, etc.")
    strMessage: str = Field(..., description="Feedback or bug report message")

class FeedbackUpdate(BaseModel):
    strStatus: Optional[str] = Field(None, description="Status: open, in_progress, resolved, closed")
    strAdminResponse: Optional[str] = Field(None, description="Admin response or resolution") 