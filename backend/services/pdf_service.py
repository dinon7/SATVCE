from typing import List
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
import os
from ..schemas.report import SubjectRecommendation

class PDFService:
    def __init__(self):
        self.template_dir = os.path.join(os.path.dirname(__file__), '../templates')
        self.env = Environment(loader=FileSystemLoader(self.template_dir))

    async def generate_career_report_pdf(
        self,
        student_id: str,
        recommendations: List[SubjectRecommendation]
    ) -> bytes:
        """Generate a PDF career report."""
        # Load the HTML template
        template = self.env.get_template('career_report.html')
        
        # Render the template with data
        html_content = template.render(
            student_id=student_id,
            recommendations=recommendations,
            generated_date=datetime.now().strftime("%Y-%m-%d")
        )

        # Convert HTML to PDF
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
                    }
                    h1 {
                        color: #2c3e50;
                        text-align: center;
                        margin-bottom: 2cm;
                    }
                    .subject-card {
                        margin-bottom: 2cm;
                        padding: 1cm;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    .subject-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1cm;
                    }
                    .subject-name {
                        font-size: 1.5em;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .subject-description {
                        margin: 1cm 0;
                    }
                    .tag-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5cm;
                        margin: 1cm 0;
                    }
                    .tag {
                        background-color: #f0f0f0;
                        padding: 0.2cm 0.5cm;
                        border-radius: 3px;
                        font-size: 0.9em;
                    }
                    .stats {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1cm;
                        margin: 1cm 0;
                    }
                    .stat-item {
                        padding: 0.5cm;
                        background-color: #f8f9fa;
                        border-radius: 3px;
                    }
                ''')
            ]
        )

        return pdf 