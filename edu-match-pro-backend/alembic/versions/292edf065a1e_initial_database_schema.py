"""Initial database schema

Revision ID: 292edf065a1e
Revises: 
Create Date: 2025-09-28 22:26:31.492754

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '292edf065a1e'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 建立 user 表
    op.create_table('user',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('school', 'company', name='userrole'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    
    # 建立 profile 表
    op.create_table('profile',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('organization_name', sa.String(), nullable=False),
        sa.Column('contact_person', sa.String(), nullable=False),
        sa.Column('position', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('tax_id', sa.String(), nullable=True),
        sa.Column('bio', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 建立 need 表
    op.create_table('need',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('school_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('student_count', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('urgency', sa.Enum('high', 'medium', 'low', name='urgencylevel'), nullable=False),
        sa.Column('sdgs', sa.ARRAY(sa.Integer()), nullable=False),
        sa.Column('status', sa.Enum('active', 'in_progress', 'completed', name='needstatus'), nullable=False),
        sa.ForeignKeyConstraint(['school_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 建立 donation 表
    op.create_table('donation',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('company_id', sa.UUID(), nullable=False),
        sa.Column('need_id', sa.UUID(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'approved', 'in_progress', 'completed', 'cancelled', name='donationstatus'), nullable=False),
        sa.Column('completion_date', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['need_id'], ['need.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 建立 impact_story 表
    op.create_table('impact_story',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('donation_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(), nullable=True),
        sa.Column('impact_metrics', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['donation_id'], ['donation.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 建立 activity_log 表
    op.create_table('activity_log',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('activity_type', sa.Enum('user_register', 'user_login', 'need_created', 'need_updated', 'donation_created', 'donation_approved', 'donation_completed', 'impact_story_created', name='activitytype'), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('extra_data', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # 刪除所有表
    op.drop_table('activity_log')
    op.drop_table('impact_story')
    op.drop_table('donation')
    op.drop_table('need')
    op.drop_table('profile')
    op.drop_table('user')
    
    # 刪除所有枚舉類型
    op.execute('DROP TYPE IF EXISTS activitytype')
    op.execute('DROP TYPE IF EXISTS donationstatus')
    op.execute('DROP TYPE IF EXISTS needstatus')
    op.execute('DROP TYPE IF EXISTS urgencylevel')
    op.execute('DROP TYPE IF EXISTS userrole')
