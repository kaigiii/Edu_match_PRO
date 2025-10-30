"""create wide_connected_devices table

Revision ID: ffc0c7b1c2a3
Revises: e84e6a362d75
Create Date: 2025-10-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ffc0c7b1c2a3'
down_revision: Union[str, None] = 'e84e6a362d75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'wide_connected_devices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('學年度', sa.Text(), nullable=False),
        sa.Column('縣市', sa.Text(), nullable=True),
        sa.Column('縣市代碼', sa.Text(), nullable=True),
        sa.Column('學校類別', sa.Text(), nullable=True),
        sa.Column('設備類型', sa.Text(), nullable=True),
        sa.Column('數量', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('學年度', '縣市', '設備類型', name='uq_wide_connected_year_county_device')
    )
    op.create_index(op.f('ix_wide_connected_devices_year'), 'wide_connected_devices', ['學年度'], unique=False)
    op.create_index(op.f('ix_wide_connected_devices_county'), 'wide_connected_devices', ['縣市'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_wide_connected_devices_county'), table_name='wide_connected_devices')
    op.drop_index(op.f('ix_wide_connected_devices_year'), table_name='wide_connected_devices')
    op.drop_table('wide_connected_devices')
