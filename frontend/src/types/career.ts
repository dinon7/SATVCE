export interface Career {
    id: string;
    title: string;
    description: string;
    related_subjects: string[];
    job_market_data: {
        salary_range: { min: number; max: number };
        demand_level: string;
        growth_rate: number;
        required_education: string[];
    };
    popularity_score: number;
    required_skills: string[];
    career_path: string[];
}

export interface CareerRecommendation {
    title: string;
    description: string;
    requiredSkills: string[];
    jobOutlook: string;
    salaryRange: string;
    educationRequirements: string[];
    confidence: number;  // 0-1 scale
    isInterested?: boolean;
    recommendations?: string[];  // Optional recommendations array
}

export interface JobMarketData {
    salaryMedian: number;
    demandTrend: string;
    industryTags: string[];
}

export interface SubjectRecommendation {
    subjectCode: string;
    subjectName: string;
    subjectDescription: string;
    imageUrl: string;
    relatedCareers: string[];
    relatedUniversities: string[];
    scalingScore: number;
    popularityIndex: number;
    difficultyRating: number;
    studyTips: string[];
    prerequisites: string[];
    jobMarketData: JobMarketData;
}

export interface CareerReport {
    selected_careers: string[];
    subject_recommendations: SubjectRecommendation[];
    study_resources: string[];
    generated_at: string;
    recommendations?: CareerRecommendation[];  // Optional recommendations array
}

export interface CareerPreference {
    user_id: string;
    career_title: string;
    is_interested: boolean;
    updated_at: string;
} 