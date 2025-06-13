"""add subjects table

Revision ID: add_subjects_table
Revises: initial_migration
Create Date: 2024-02-14 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_subjects_table'
down_revision = 'initial_migration'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create subjects table
    op.create_table(
        'subjects',
        sa.Column('subjectCode', sa.String(), nullable=False),
        sa.Column('subjectName', sa.String(), nullable=False),
        sa.Column('subjectDescription', sa.String(), nullable=False),
        sa.Column('scalingScore', sa.Float(), nullable=False),
        sa.Column('popularityIndex', sa.Integer(), nullable=False),
        sa.Column('difficultyRating', sa.Integer(), nullable=False),
        sa.Column('relatedCareers', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('universityCourses', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('studyTips', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('prerequisites', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('imageUrl', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('subjectCode')
    )
    op.create_index(op.f('ix_subjects_subjectCode'), 'subjects', ['subjectCode'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_subjects_subjectCode'), table_name='subjects')
    op.drop_table('subjects') 