"""extend v_edu_B_1_4 columns to match CSV

Revision ID: 360780926b0d
Revises: dfb9272be04a
Create Date: 2025-09-29 22:20:59.990845

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '360780926b0d'
down_revision: Union[str, None] = 'dfb9272be04a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop and recreate to avoid column rename conflicts in PostgreSQL
    op.execute("DROP VIEW IF EXISTS v_edu_B_1_4")
    op.execute(
        """
        CREATE OR REPLACE VIEW v_edu_B_1_4 AS
        SELECT
            id,
            created_at,
            updated_at,
            (payload->>'學年度') AS "學年度",
            COALESCE(payload->>'縣市名稱', payload->>'縣市別', payload->>'直轄市(縣市)別') AS "縣市名稱",
            NULLIF(REPLACE(payload->>'幼兒園[人]', ',', ''), '')::int AS "幼兒園[人]",
            NULLIF(REPLACE(payload->>'國小[人]', ',', ''), '')::int AS "國小[人]",
            NULLIF(REPLACE(payload->>'國中[人]', ',', ''), '')::int AS "國中[人]",
            NULLIF(REPLACE(payload->>'高級中等學校-普通科[人]', ',', ''), '')::int AS "高級中等學校-普通科[人]",
            NULLIF(REPLACE(payload->>'高級中等學校-專業群科[人]', ',', ''), '')::int AS "高級中等學校-專業群科[人]",
            NULLIF(REPLACE(payload->>'高級中等學校-綜合高中[人]', ',', ''), '')::int AS "高級中等學校-綜合高中[人]",
            NULLIF(REPLACE(payload->>'高級中等學校-實用技能學程[人]', ',', ''), '')::int AS "高級中等學校-實用技能學程[人]",
            NULLIF(REPLACE(payload->>'高級中等學校-進修部[人]', ',', ''), '')::int AS "高級中等學校-進修部[人]",
            NULLIF(REPLACE(payload->>'大專校院(全部計入校本部)[人]', ',', ''), '')::int AS "大專校院(全部計入校本部)[人]",
            NULLIF(REPLACE(payload->>'大專校院(跨縣市教學計入所在地縣市)[人]', ',', ''), '')::int AS "大專校院(跨縣市教學計入所在地縣市)[人]",
            NULLIF(REPLACE(payload->>'宗教研修學院[人]', ',', ''), '')::int AS "宗教研修學院[人]",
            NULLIF(REPLACE(payload->>'國民補習及大專進修學校及空大[人]', ',', ''), '')::int AS "國民補習及大專進修學校及空大[人]",
            NULLIF(REPLACE(payload->>'特殊教育學校[人]', ',', ''), '')::int AS "特殊教育學校[人]"
        FROM school_population_by_county;
        """
    )


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS v_edu_B_1_4")
