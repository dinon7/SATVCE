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