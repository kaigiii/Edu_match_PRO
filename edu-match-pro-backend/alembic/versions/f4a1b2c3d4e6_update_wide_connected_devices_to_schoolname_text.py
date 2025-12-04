"""update wide_connected_devices schema to use 學校名稱 and 教學電腦數 (text)

Revision ID: f4a1b2c3d4e6
Revises: e5f6c7d8b9a0
Create Date: 2025-10-28 09:45:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f4a1b2c3d4e6'
down_revision = 'e5f6c7d8b9a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop legacy constraints if present
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_device;")
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_school_device;")
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_year_county_schoolname_device;")
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_county_code_town_school;")

    # Drop legacy columns if they exist
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 學年度;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 學校類別;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 本校代碼;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 本校名稱;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 設備類型;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 數量;")

    # Add new columns (if not exists)
    op.execute("ALTER TABLE wide_connected_devices ADD COLUMN IF NOT EXISTS 縣市 TEXT;")
    op.execute("ALTER TABLE wide_connected_devices ADD COLUMN IF NOT EXISTS 縣市代碼 TEXT;")
    op.execute("ALTER TABLE wide_connected_devices ADD COLUMN IF NOT EXISTS 鄉鎮市區 TEXT;")
    op.execute("ALTER TABLE wide_connected_devices ADD COLUMN IF NOT EXISTS 學校名稱 TEXT;")
    op.execute("ALTER TABLE wide_connected_devices ADD COLUMN IF NOT EXISTS 教學電腦數 TEXT;")

    # Create new unique constraint for on-conflict upsert
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_county_code_town_school;")
    op.execute("ALTER TABLE wide_connected_devices ADD CONSTRAINT uq_wide_connected_county_code_town_school UNIQUE (縣市, 縣市代碼, 鄉鎮市區, 學校名稱);")


def downgrade() -> None:
    # revert: drop the new constraint and columns
    op.execute("ALTER TABLE wide_connected_devices DROP CONSTRAINT IF EXISTS uq_wide_connected_county_code_town_school;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 教學電腦數;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 學校名稱;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 鄉鎮市區;")
    op.execute("ALTER TABLE wide_connected_devices DROP COLUMN IF EXISTS 縣市代碼;")
    # Note: do not re-add legacy columns automatically in downgrade - manual migration required if needed
