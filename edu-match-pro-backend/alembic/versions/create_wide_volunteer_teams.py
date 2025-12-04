"""create wide_volunteer_teams table

Revision ID: create_wide_volunteer_teams
Revises: merge_heads_fix
Create Date: 2025-11-27 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'create_wide_volunteer_teams'
down_revision: Union[str, None] = 'merge_heads_fix'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'wide_volunteer_teams',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('年度', sa.Text(), nullable=True),
        sa.Column('縣市', sa.Text(), nullable=True),
        sa.Column('受服務單位', sa.Text(), nullable=True),
        sa.Column('志工團隊學校', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('年度', '縣市', '受服務單位', '志工團隊學校', name='uq_wide_volunteer_year_county_unit_school')
    )
    op.create_index(op.f('ix_wide_volunteer_teams_year'), 'wide_volunteer_teams', ['年度'], unique=False)
    op.create_index(op.f('ix_wide_volunteer_teams_county'), 'wide_volunteer_teams', ['縣市'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_wide_volunteer_teams_county'), table_name='wide_volunteer_teams')
    op.drop_index(op.f('ix_wide_volunteer_teams_year'), table_name='wide_volunteer_teams')
    op.drop_table('wide_volunteer_teams')
