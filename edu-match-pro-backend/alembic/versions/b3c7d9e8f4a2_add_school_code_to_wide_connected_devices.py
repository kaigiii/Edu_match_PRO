"""add school code/name to wide_connected_devices and adjust unique constraint

Revision ID: b3c7d9e8f4a2
Revises: ffc0c7b1c2a3
Create Date: 2025-10-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b3c7d9e8f4a2'
down_revision = 'ffc0c7b1c2a3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # add columns for school code and school name
    op.add_column('wide_connected_devices', sa.Column('本校代碼', sa.Text(), nullable=True))
    op.add_column('wide_connected_devices', sa.Column('本校名稱', sa.Text(), nullable=True))

    # drop old unique constraint (if exists) and create new one including 本校代碼
    with op.batch_alter_table('wide_connected_devices') as batch_op:
        try:
            batch_op.drop_constraint('uq_wide_connected_year_county_device', type_='unique')
        except Exception:
            # if constraint doesn't exist, ignore - this keeps upgrade idempotent-ish
            pass
        batch_op.create_unique_constraint(
            'uq_wide_connected_year_county_school_device',
            ['學年度', '縣市', '本校代碼', '設備類型']
        )


def downgrade() -> None:
    # revert unique constraint and drop the new columns
    with op.batch_alter_table('wide_connected_devices') as batch_op:
        try:
            batch_op.drop_constraint('uq_wide_connected_year_county_school_device', type_='unique')
        except Exception:
            pass
        batch_op.create_unique_constraint(
            'uq_wide_connected_year_county_device',
            ['學年度', '縣市', '設備類型']
        )

    op.drop_column('wide_connected_devices', '本校名稱')
    op.drop_column('wide_connected_devices', '本校代碼')
