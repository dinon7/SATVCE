"""initial

Revision ID: 20240321000000
Revises: 
Create Date: 2024-03-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20240321000000'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('year_level', sa.Integer(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_admin', sa.Boolean(), nullable=False, default=False),
        sa.Column('quiz_results', postgresql.JSONB(), nullable=True),
        sa.Column('ai_results', postgresql.JSONB(), nullable=True),
        sa.Column('saved_preferences', postgresql.JSONB(), nullable=True),
        sa.Column('report_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create subjects table
    op.create_table(
        'subjects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('atar_scaling', sa.Float(), nullable=False),
        sa.Column('difficulty_rating', sa.Integer(), nullable=False),
        sa.Column('related_careers', postgresql.JSONB(), nullable=True),
        sa.Column('popularity_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('prerequisites', postgresql.JSONB(), nullable=True),
        sa.Column('recommended_subjects', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create careers table
    op.create_table(
        'careers',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('related_subjects', postgresql.JSONB(), nullable=True),
        sa.Column('job_market_data', postgresql.JSONB(), nullable=True),
        sa.Column('popularity_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('required_skills', postgresql.JSONB(), nullable=True),
        sa.Column('career_path', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create quiz_responses table
    op.create_table(
        'quiz_responses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('initial_results', postgresql.JSONB(), nullable=False),
        sa.Column('followup_results', postgresql.JSONB(), nullable=True),
        sa.Column('recommended_subjects', postgresql.JSONB(), nullable=True),
        sa.Column('recommended_careers', postgresql.JSONB(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create resources table
    op.create_table(
        'resources',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('link', sa.String(), nullable=False),
        sa.Column('tags', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('resources')
    op.drop_table('quiz_responses')
    op.drop_table('careers')
    op.drop_table('subjects')
    op.drop_table('users') 