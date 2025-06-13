"""Add study resources to quiz responses

Revision ID: 20240321000001
Revises: 20240321000000
Create Date: 2024-03-21 00:00:01.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20240321000001'
down_revision = '20240321000000'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add study_resources column to quiz_responses table
    op.add_column(
        'quiz_responses',
        sa.Column('study_resources', postgresql.JSONB(), nullable=True)
    )

def downgrade() -> None:
    # Remove study_resources column from quiz_responses table
    op.drop_column('quiz_responses', 'study_resources') 