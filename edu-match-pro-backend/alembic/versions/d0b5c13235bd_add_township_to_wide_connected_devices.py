"""add township (鄉鎮市區) to wide_connected_devices

Revision ID: d0b5c13235bd
Revises: c1e2f3b4d5a6
Create Date: 2025-10-28 09:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd0b5c13235bd'
down_revision = 'c1e2f3b4d5a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('wide_connected_devices', sa.Column('鄉鎮市區', sa.Text(), nullable=True))
    # optional: create index to speed up queries by county/township
    op.create_index('ix_wide_connected_county_town', 'wide_connected_devices', ['縣市', '鄉鎮市區'])


def downgrade() -> None:
    op.drop_index('ix_wide_connected_county_town', table_name='wide_connected_devices')
    op.drop_column('wide_connected_devices', '鄉鎮市區')
