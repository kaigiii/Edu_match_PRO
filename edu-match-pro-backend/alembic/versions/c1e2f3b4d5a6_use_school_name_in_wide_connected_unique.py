"""use school name (本校名稱) in unique constraint for wide_connected_devices

Revision ID: c1e2f3b4d5a6
Revises: b3c7d9e8f4a2
Create Date: 2025-10-28 00:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c1e2f3b4d5a6'
down_revision = 'b3c7d9e8f4a2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Replace unique constraint that referenced 本校代碼 with one that uses 本校名稱
    # use IF EXISTS to avoid errors if constraint is absent
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_school_device;")
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_schoolname_device;")
    op.create_unique_constraint(
        'uq_wide_connected_year_county_schoolname_device',
        'wide_connected_devices',
        ['學年度', '縣市', '本校名稱', '設備類型']
    )


def downgrade() -> None:
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_schoolname_device;")
    op.create_unique_constraint(
        'uq_wide_connected_year_county_school_device',
        'wide_connected_devices',
        ['學年度', '縣市', '本校代碼', '設備類型']
    )
