"""drop narrow tables and csv views

Revision ID: 5203a1b7d3dd
Revises: a19363445438
Create Date: 2025-09-29 22:37:54.384617

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0b5c13235bd'
down_revision: Union[str, None] = 'a19363445438'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop views if exist
    op.execute("DROP VIEW IF EXISTS v_edu_B_1_4")
    op.execute("DROP VIEW IF EXISTS v_faraway3")

    # Drop narrow tables if exist
    op.execute("DROP TABLE IF EXISTS education_stat CASCADE")
    op.execute("DROP TABLE IF EXISTS faraway_school_list CASCADE")
    op.execute("DROP TABLE IF EXISTS school_population_by_county CASCADE")


def downgrade() -> None:
    # No-op recreate minimal stubs is complex; leaving as non-reversible for safety
    pass
