"""merge heads fix

Revision ID: merge_heads_fix
Revises: d0b5c13235bd, merge_demo_users
Create Date: 2025-11-27 15:55:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'merge_heads_fix'
down_revision = ('d0b5c13235bd', 'merge_demo_users')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
