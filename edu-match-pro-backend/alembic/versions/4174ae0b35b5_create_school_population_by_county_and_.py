"""create school_population_by_county and faraway_school_list tables

Revision ID: 4174ae0b35b5
Revises: 2c44e4938762
Create Date: 2025-09-29 22:06:57.832917

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4174ae0b35b5'
down_revision: Union[str, None] = '2c44e4938762'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create school_population_by_county table
    op.create_table(
        'school_population_by_county',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('year', sa.Text(), nullable=False),
        sa.Column('county', sa.Text(), nullable=False),
        sa.Column('school_level', sa.Text(), nullable=False),
        sa.Column('male_count', sa.Integer(), nullable=True),
        sa.Column('female_count', sa.Integer(), nullable=True),
        sa.Column('total_count', sa.Integer(), nullable=True),
        sa.Column('payload', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year', 'county', 'school_level', name='uq_school_pop_year_county_level')
    )
    op.create_index(
        op.f('ix_school_population_by_county_year'),
        'school_population_by_county',
        ['year'],
        unique=False
    )
    op.create_index(
        op.f('ix_school_population_by_county_county'),
        'school_population_by_county',
        ['county'],
        unique=False
    )
    op.create_index(
        op.f('ix_school_population_by_county_school_level'),
        'school_population_by_county',
        ['school_level'],
        unique=False
    )

    # Create faraway_school_list table
    op.create_table(
        'faraway_school_list',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('year', sa.Text(), nullable=False),
        sa.Column('county', sa.Text(), nullable=False),
        sa.Column('township', sa.Text(), nullable=True),
        sa.Column('school_level', sa.Text(), nullable=True),
        sa.Column('school_code', sa.Text(), nullable=False),
        sa.Column('school_name', sa.Text(), nullable=False),
        sa.Column('branch_name', sa.Text(), nullable=False, server_default=''),
        sa.Column('public_private', sa.Text(), nullable=True),
        sa.Column('region_attr', sa.Text(), nullable=True),
        sa.Column('class_count', sa.Integer(), nullable=True),
        sa.Column('male_count', sa.Integer(), nullable=True),
        sa.Column('female_count', sa.Integer(), nullable=True),
        sa.Column('indigenous_ratio', sa.Numeric(10, 4), nullable=True),
        sa.Column('grad_male', sa.Integer(), nullable=True),
        sa.Column('grad_female', sa.Integer(), nullable=True),
        sa.Column('payload', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year', 'school_code', 'branch_name', name='uq_faraway_year_code_branch')
    )
    op.create_index(
        op.f('ix_faraway_school_list_year'),
        'faraway_school_list',
        ['year'],
        unique=False
    )
    op.create_index(
        op.f('ix_faraway_school_list_county'),
        'faraway_school_list',
        ['county'],
        unique=False
    )
    op.create_index(
        op.f('ix_faraway_school_list_school_code'),
        'faraway_school_list',
        ['school_code'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_faraway_school_list_school_code'), table_name='faraway_school_list')
    op.drop_index(op.f('ix_faraway_school_list_county'), table_name='faraway_school_list')
    op.drop_index(op.f('ix_faraway_school_list_year'), table_name='faraway_school_list')
    op.drop_table('faraway_school_list')

    op.drop_index(op.f('ix_school_population_by_county_school_level'), table_name='school_population_by_county')
    op.drop_index(op.f('ix_school_population_by_county_county'), table_name='school_population_by_county')
    op.drop_index(op.f('ix_school_population_by_county_year'), table_name='school_population_by_county')
    op.drop_table('school_population_by_county')
