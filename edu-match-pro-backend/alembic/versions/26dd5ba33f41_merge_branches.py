"""merge branches

Revision ID: 26dd5ba33f41
Revises: 5203a1b7d3dd, merge_demo_users
Create Date: 2026-06-04 13:57:14.692037

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26dd5ba33f41'
down_revision: Union[str, None] = ('5203a1b7d3dd', 'merge_demo_users')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
