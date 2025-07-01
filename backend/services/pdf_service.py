from typing import List, Dict, Any
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime
from ..schemas.report import SubjectRecommendation, CareerReportResponse

class PDFService:
    def __init__(self):
        self.template_dir = os.path.join(os.path.dirname(__file__), '../templates')
        self.env = Environment(loader=FileSystemLoader(self.template_dir))

    async def generate_career_report_pdf(
        self,
        student_id: str,
        report_data: Dict[str, Any]
    ) -> bytes:
        """Generate a comprehensive PDF career report with detailed career information."""
        # Load the HTML template
        template = self.env.get_template('career_report.html')
        
        # Extract data from the report
        selected_careers = report_data.get('selected_careers', [])
        subject_recommendations = report_data.get('subject_recommendations', [])
        study_resources = report_data.get('study_resources', [])
        quiz_results = report_data.get('quiz_results', {})
        recommendations = quiz_results.get('recommendations', {})
        
        # Render the template with comprehensive data
        html_content = template.render(
            student_id=student_id,
            selected_careers=selected_careers,
            subject_recommendations=subject_recommendations,
            study_resources=study_resources,
            quiz_recommendations=recommendations,
            generated_date=datetime.now().strftime("%B %d, %Y"),
            total_careers_selected=len(selected_careers),
            confidence_score=recommendations.get('confidence_score', 0),
            reasoning=recommendations.get('reasoning', ''),
            recommended_subjects=recommendations.get('recommended_subjects', [])
        )

        # Convert HTML to PDF with enhanced styling
        pdf = HTML(string=html_content).write_pdf(
            stylesheets=[
                CSS(string='''
                    @page {
                        margin: 2.5cm;
                        @top-right {
                            content: "Page " counter(page) " of " counter(pages);
                        }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    h1, h2, h3 {
                        color: #2c3e50;
                        margin-top: 0;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 2cm;
                        font-size: 2.5em;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 0.5cm;
                    }
                    h2 {
                        font-size: 1.8em;
                        margin-top: 1.5cm;
                        margin-bottom: 1cm;
                        border-left: 4px solid #3498db;
                        padding-left: 0.5cm;
                    }
                    h3 {
                        font-size: 1.3em;
                        margin-top: 1cm;
                        margin-bottom: 0.5cm;
                        color: #34495e;
                    }
                    .section {
                        margin-bottom: 2cm;
                    }
                    .summary-stats {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1cm;
                        margin-bottom: 2cm;
                        padding: 1cm;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                    }
                    .stat-card {
                        text-align: center;
                        padding: 1cm;
                        background-color: white;
                        border-radius: 5px;
                        border: 1px solid #e9ecef;
                    }
                    .stat-number {
                        font-size: 2em;
                        font-weight: bold;
                        color: #3498db;
                    }
                    .stat-label {
                        font-size: 0.9em;
                        color: #6c757d;
                        margin-top: 0.3cm;
                    }
                    .career-card {
                        margin-bottom: 1.5cm;
                        padding: 1cm;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        background-color: #fafbfc;
                        page-break-inside: avoid;
                    }
                    .career-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1cm;
                        padding-bottom: 0.5cm;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .career-title {
                        font-size: 1.4em;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .confidence-score {
                        display: inline-block;
                        background-color: #d4edda;
                        color: #155724;
                        padding: 0.2cm 0.5cm;
                        border-radius: 15px;
                        font-weight: bold;
                    }
                    .career-description {
                        margin: 1cm 0;
                        line-height: 1.7;
                        color: #495057;
                    }
                    .career-stats {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1cm;
                        margin: 1cm 0;
                    }
                    .career-stat {
                        padding: 0.5cm;
                        background-color: white;
                        border-radius: 5px;
                        border: 1px solid #dee2e6;
                    }
                    .career-stat-label {
                        font-weight: bold;
                        color: #495057;
                        margin-bottom: 0.2cm;
                        font-size: 0.9em;
                    }
                    .career-stat-value {
                        font-size: 1em;
                        color: #2c3e50;
                    }
                    .skills-section, .subjects-section, .industry-section {
                        margin: 1cm 0;
                    }
                    .tag-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.3cm;
                        margin: 0.5cm 0;
                    }
                    .tag {
                        background-color: #e3f2fd;
                        color: #1976d2;
                        padding: 0.2cm 0.5cm;
                        border-radius: 15px;
                        font-size: 0.9em;
                        font-weight: 500;
                    }
                    .skill-tag {
                        background-color: #e8f5e8;
                        color: #2e7d32;
                    }
                    .subject-tag {
                        background-color: #f3e5f5;
                        color: #7b1fa2;
                    }
                    .subject-card {
                        margin-bottom: 1.5cm;
                        padding: 1cm;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        background-color: #fafbfc;
                        page-break-inside: avoid;
                    }
                    .subject-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1cm;
                        padding-bottom: 0.5cm;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .subject-name {
                        font-size: 1.4em;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .subject-code {
                        font-size: 1em;
                        color: #6c757d;
                        font-family: monospace;
                    }
                    .subject-description {
                        margin: 1cm 0;
                        line-height: 1.7;
                    }
                    .stats {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1cm;
                        margin: 1cm 0;
                    }
                    .stat-item {
                        padding: 0.5cm;
                        background-color: white;
                        border-radius: 5px;
                        border: 1px solid #dee2e6;
                    }
                    .stat-label {
                        font-weight: bold;
                        color: #495057;
                        margin-bottom: 0.2cm;
                    }
                    .stat-value {
                        font-size: 1.1em;
                        color: #2c3e50;
                    }
                    .study-resources {
                        margin-top: 2cm;
                        padding: 1cm;
                        background-color: #fff3cd;
                        border-radius: 8px;
                        border-left: 4px solid #ffc107;
                    }
                    .resource-list {
                        list-style-type: none;
                        padding: 0;
                        margin: 0;
                    }
                    .resource-item {
                        margin-bottom: 0.5cm;
                        padding: 0.5cm;
                        background-color: white;
                        border-radius: 5px;
                        border-left: 3px solid #ffc107;
                    }
                    .university-list, .career-list {
                        list-style-type: none;
                        padding: 0;
                        margin: 0.5cm 0;
                    }
                    .university-list li, .career-list li {
                        padding: 0.2cm 0;
                        border-bottom: 1px solid #f1f3f4;
                    }
                    .university-list li:last-child, .career-list li:last-child {
                        border-bottom: none;
                    }
                    .tips-list {
                        list-style-type: none;
                        padding: 0;
                        margin: 0.5cm 0;
                    }
                    .tips-list li {
                        padding: 0.3cm 0;
                        border-left: 3px solid #28a745;
                        padding-left: 0.5cm;
                        margin-bottom: 0.3cm;
                    }
                    .prerequisites-list {
                        list-style-type: disc;
                        padding-left: 1cm;
                        margin: 0.5cm 0;
                    }
                    .report-meta {
                        text-align: center;
                        margin-top: 2cm;
                        padding-top: 1cm;
                        border-top: 1px solid #dee2e6;
                        color: #6c757d;
                        font-size: 0.9em;
                    }
                    .reasoning-section {
                        margin: 2cm 0;
                        padding: 1cm;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        border-left: 4px solid #17a2b8;
                    }
                    .reasoning-text {
                        font-style: italic;
                        line-height: 1.7;
                        color: #495057;
                    }
                ''')
            ]
        )

        return pdf 