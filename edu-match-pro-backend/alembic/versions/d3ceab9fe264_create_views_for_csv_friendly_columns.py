"""create views for csv-friendly columns

Revision ID: d3ceab9fe264
Revises: 4174ae0b35b5
Create Date: 2025-09-29 22:14:47.964943

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3ceab9fe264'
down_revision: Union[str, None] = '4174ae0b35b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # View for faraway3.csv
    op.execute(
        """
        CREATE OR REPLACE VIEW v_faraway3 AS
        SELECT
            id,
            created_at,
            updated_at,
            (payload->>'學年度')        AS "學年度",
            (payload->>'縣市名稱')      AS "縣市名稱",
            COALESCE(payload->>'鄉鎮市區', payload->>'鄉鎮市區名稱') AS "鄉鎮市區",
            COALESCE(payload->>'學生等級', payload->>'學校層級', payload->>'教育階段') AS "學生等級",
            COALESCE(payload->>'本校代碼', payload->>'學校代碼') AS "本校代碼",
            COALESCE(payload->>'本校名稱', payload->>'學校名稱') AS "本校名稱",
            COALESCE(payload->>'分校分班名稱', payload->>'分校名稱', payload->>'分校') AS "分校分班名稱",
            COALESCE(payload->>'公/私立', payload->>'公私立', payload->>'設立別') AS "公/私立",
            COALESCE(payload->>'地區屬性', payload->>'地區類型') AS "地區屬性",
            (payload->>'班級數')::int   AS "班級數",
            (payload->>'男學生數[人]')::int AS "男學生數[人]",
            (payload->>'女學生數[人]')::int AS "女學生數[人]",
            NULLIF(payload->>'原住民學生比率','')::numeric AS "原住民學生比率",
            (payload->>'上學年男畢業生數[人]')::int AS "上學年男畢業生數[人]",
            (payload->>'上學年女畢業生數[人]')::int AS "上學年女畢業生數[人]"
        FROM faraway_school_list;
        """
    )

    # View for edu_B_1_4.csv
    op.execute(
        """
        CREATE OR REPLACE VIEW v_edu_B_1_4 AS
        SELECT
            id,
            created_at,
            updated_at,
            (payload->>'學年度') AS "學年度",
            COALESCE(payload->>'縣市名稱', payload->>'縣市別', payload->>'直轄市(縣市)別') AS "縣市名稱",
            -- 保留所有原始寬表欄位（若為空字串則顯示 NULL）
            NULLIF(payload->>'幼兒園[人]', '')::int AS "幼兒園[人]",
            NULLIF(payload->>'國小[人]', '')::int AS "國小[人]",
            NULLIF(payload->>'國中[人]', '')::int AS "國中[人]",
            NULLIF(payload->>'高中[人]', '')::int AS "高中[人]",
            NULLIF(payload->>'五專[人]', '')::int AS "五專[人]",
            NULLIF(payload->>'大專院校[人]', '')::int AS "大專院校[人]",
            NULLIF(payload->>'特殊教育學校[人]', '')::int AS "特殊教育學校[人]"
        FROM school_population_by_county;
        """
    )


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS v_edu_B_1_4")
    op.execute("DROP VIEW IF EXISTS v_faraway3")
