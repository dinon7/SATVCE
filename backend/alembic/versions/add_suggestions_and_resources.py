"""add suggestions and resources tables

Revision ID: add_suggestions_and_resources
Revises: add_subjects_table
Create Date: 2024-02-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_suggestions_and_resources'
down_revision = 'add_subjects_table'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create resources table
    op.create_table(
        'resources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False)
    )
    
    # Create suggestions table
    op.create_table(
        'suggestions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('suggestions', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False)
    )
    
    # Create indexes
    op.create_index(op.f('ix_resources_id'), 'resources', ['id'], unique=True)
    op.create_index(op.f('ix_suggestions_id'), 'suggestions', ['id'], unique=True)
    op.create_index(op.f('ix_suggestions_user_id'), 'suggestions', ['user_id'])

def downgrade() -> None:
    op.drop_index(op.f('ix_suggestions_user_id'), table_name='suggestions')
    op.drop_index(op.f('ix_suggestions_id'), table_name='suggestions')
    op.drop_index(op.f('ix_resources_id'), table_name='resources')
    op.drop_table('suggestions')
    op.drop_table('resources') 