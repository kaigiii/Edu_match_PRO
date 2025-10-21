import asyncio
import csv
import os
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Optional

import sqlalchemy as sa
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData, Table, text
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import settings


DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FARAWAY_PATH = os.path.join(DATA_DIR, "faraway3.csv")
EDU_B_1_4_PATH = os.path.join(DATA_DIR, "edu_B_1_4.csv")


async def get_session() -> AsyncSession:
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False, autoflush=False)
    return async_session()


def normalize_county(name: str) -> str:
    return name.replace("[", "").replace("]", "") if name else name


def parse_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    s = str(value).replace(",", "").strip()
    if s == "":
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def parse_decimal(value: Optional[str]) -> Optional[Decimal]:
    if value is None:
        return None
    s = str(value).replace(",", "").replace("%", "").strip()
    if s == "":
        return None
    try:
        return Decimal(s)
    except (InvalidOperation, ValueError):
        return None


# --- wide-table upserts ---
async def upsert_wide_edu(session: AsyncSession, row: Dict[str, Any]) -> None:
    metadata = MetaData()
    table = Table(
        'wide_edu_B_1_4',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('學年度', sa.Text),
        sa.Column('縣市別', sa.Text),
        sa.Column('幼兒園[人]', sa.Integer),
        sa.Column('國小[人]', sa.Integer),
        sa.Column('國中[人]', sa.Integer),
        sa.Column('高級中等學校-普通科[人]', sa.Integer),
        sa.Column('高級中等學校-專業群科[人]', sa.Integer),
        sa.Column('高級中等學校-綜合高中[人]', sa.Integer),
        sa.Column('高級中等學校-實用技能學程[人]', sa.Integer),
        sa.Column('高級中等學校-進修部[人]', sa.Integer),
        sa.Column('大專校院(全部計入校本部)[人]', sa.Integer),
        sa.Column('大專校院(跨縣市教學計入所在地縣市)[人]', sa.Integer),
        sa.Column('宗教研修學院[人]', sa.Integer),
        sa.Column('國民補習及大專進修學校及空大[人]', sa.Integer),
        sa.Column('特殊教育學校[人]', sa.Integer),
    )

    def gi(key: str) -> Optional[int]:
        return parse_int(row.get(key))

    now = datetime.utcnow()
    stmt = (
        pg_insert(table)
        .values(
            id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **{
                '學年度': (row.get('學年度') or '').strip(),
                '縣市別': (row.get('縣市別') or row.get('縣市名稱') or '').strip(),
                '幼兒園[人]': gi('幼兒園[人]'),
                '國小[人]': gi('國小[人]'),
                '國中[人]': gi('國中[人]'),
                '高級中等學校-普通科[人]': gi('高級中等學校-普通科[人]') or gi('高中[人]'),
                '高級中等學校-專業群科[人]': gi('高級中等學校-專業群科[人]'),
                '高級中等學校-綜合高中[人]': gi('高級中等學校-綜合高中[人]'),
                '高級中等學校-實用技能學程[人]': gi('高級中等學校-實用技能學程[人]'),
                '高級中等學校-進修部[人]': gi('高級中等學校-進修部[人]'),
                '大專校院(全部計入校本部)[人]': gi('大專校院(全部計入校本部)[人]'),
                '大專校院(跨縣市教學計入所在地縣市)[人]': gi('大專校院(跨縣市教學計入所在地縣市)[人]'),
                '宗教研修學院[人]': gi('宗教研修學院[人]'),
                '國民補習及大專進修學校及空大[人]': gi('國民補習及大專進修學校及空大[人]'),
                '特殊教育學校[人]': gi('特殊教育學校[人]'),
            }
        )
        .on_conflict_do_update(
            constraint='uq_wide_edu_year_county',
            set_={
                'updated_at': sa.literal(now),
                '幼兒園[人]': sa.literal(gi('幼兒園[人]')),
                '國小[人]': sa.literal(gi('國小[人]')),
                '國中[人]': sa.literal(gi('國中[人]')),
                '高級中等學校-普通科[人]': sa.literal(gi('高級中等學校-普通科[人]') or gi('高中[人]')),
                '高級中等學校-專業群科[人]': sa.literal(gi('高級中等學校-專業群科[人]')),
                '高級中等學校-綜合高中[人]': sa.literal(gi('高級中等學校-綜合高中[人]')),
                '高級中等學校-實用技能學程[人]': sa.literal(gi('高級中等學校-實用技能學程[人]')),
                '高級中等學校-進修部[人]': sa.literal(gi('高級中等學校-進修部[人]')),
                '大專校院(全部計入校本部)[人]': sa.literal(gi('大專校院(全部計入校本部)[人]')),
                '大專校院(跨縣市教學計入所在地縣市)[人]': sa.literal(gi('大專校院(跨縣市教學計入所在地縣市)[人]')),
                '宗教研修學院[人]': sa.literal(gi('宗教研修學院[人]')),
                '國民補習及大專進修學校及空大[人]': sa.literal(gi('國民補習及大專進修學校及空大[人]')),
                '特殊教育學校[人]': sa.literal(gi('特殊教育學校[人]')),
            }
        )
    )
    await session.execute(stmt)


async def upsert_wide_faraway(session: AsyncSession, row: Dict[str, Any]) -> None:
    metadata = MetaData()
    table = Table(
        'wide_faraway3',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('學年度', sa.Text),
        sa.Column('縣市名稱', sa.Text),
        sa.Column('鄉鎮市區', sa.Text),
        sa.Column('學生等級', sa.Text),
        sa.Column('本校代碼', sa.Text),
        sa.Column('本校名稱', sa.Text),
        sa.Column('分校分班名稱', sa.Text),
        sa.Column('公/私立', sa.Text),
        sa.Column('地區屬性', sa.Text),
        sa.Column('班級數', sa.Integer),
        sa.Column('男學生數[人]', sa.Integer),
        sa.Column('女學生數[人]', sa.Integer),
        sa.Column('原住民學生比率', sa.Numeric(10, 4)),
        sa.Column('上學年男畢業生數[人]', sa.Integer),
        sa.Column('上學年女畢業生數[人]', sa.Integer),
    )

    now = datetime.utcnow()
    stmt = (
        pg_insert(table)
        .values(
            id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **{
                '學年度': (row.get('學年度') or '').strip(),
                '縣市名稱': normalize_county((row.get('縣市名稱') or '').strip()),
                '鄉鎮市區': (row.get('鄉鎮市區') or '').strip() or None,
                '學生等級': (row.get('學生等級') or '').strip() or None,
                '本校代碼': (row.get('本校代碼') or '').strip(),
                '本校名稱': (row.get('本校名稱') or '').strip(),
                '分校分班名稱': (row.get('分校分班名稱') or '').strip(),
                '公/私立': (row.get('公/私立') or '').strip() or None,
                '地區屬性': (row.get('地區屬性') or '').strip() or None,
                '班級數': parse_int(row.get('班級數')),
                '男學生數[人]': parse_int(row.get('男學生數[人]')),
                '女學生數[人]': parse_int(row.get('女學生數[人]')),
                '原住民學生比率': parse_decimal(row.get('原住民學生比率')),
                '上學年男畢業生數[人]': parse_int(row.get('上學年男畢業生數[人]')),
                '上學年女畢業生數[人]': parse_int(row.get('上學年女畢業生數[人]')),
            }
        )
        .on_conflict_do_update(
            constraint='uq_wide_faraway_year_code_branch',
            set_={
                'updated_at': sa.literal(now),
                '縣市名稱': sa.literal(normalize_county((row.get('縣市名稱') or '').strip())),
                '鄉鎮市區': sa.literal((row.get('鄉鎮市區') or '').strip() or None),
                '學生等級': sa.literal((row.get('學生等級') or '').strip() or None),
                '本校名稱': sa.literal((row.get('本校名稱') or '').strip()),
                '分校分班名稱': sa.literal((row.get('分校分班名稱') or '').strip()),
                '公/私立': sa.literal((row.get('公/私立') or '').strip() or None),
                '地區屬性': sa.literal((row.get('地區屬性') or '').strip() or None),
                '班級數': sa.literal(parse_int(row.get('班級數'))),
                '男學生數[人]': sa.literal(parse_int(row.get('男學生數[人]'))),
                '女學生數[人]': sa.literal(parse_int(row.get('女學生數[人]'))),
                '原住民學生比率': sa.literal(parse_decimal(row.get('原住民學生比率'))),
                '上學年男畢業生數[人]': sa.literal(parse_int(row.get('上學年男畢業生數[人]'))),
                '上學年女畢業生數[人]': sa.literal(parse_int(row.get('上學年女畢業生數[人]'))),
            }
        )
    )
    await session.execute(stmt)


async def ingest_school_population_wide() -> int:
    if not os.path.exists(EDU_B_1_4_PATH):
        raise FileNotFoundError(EDU_B_1_4_PATH)
    count = 0
    async with await get_session() as session:
        await session.begin()
        with open(EDU_B_1_4_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                await upsert_wide_edu(session, row)
                count += 1
        await session.commit()
    return count


async def ingest_faraway_list_wide() -> int:
    if not os.path.exists(FARAWAY_PATH):
        raise FileNotFoundError(FARAWAY_PATH)
    count = 0
    async with await get_session() as session:
        await session.begin()
        with open(FARAWAY_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                await upsert_wide_faraway(session, row)
                count += 1
        await session.commit()
    return count


async def main() -> None:
    w1 = await ingest_school_population_wide()
    w2 = await ingest_faraway_list_wide()

    async with await get_session() as session:
        res1 = await session.execute(text('SELECT COUNT(*) FROM "wide_edu_B_1_4"'))
        res2 = await session.execute(text('SELECT COUNT(*) FROM wide_faraway3'))
        print({
            'wide_edu_B_1_4': res1.scalar_one(),
            'wide_faraway3': res2.scalar_one(),
            'processed_csv_rows': {'edu_B_1_4': w1, 'faraway3': w2},
        })


if __name__ == "__main__":
    asyncio.run(main())
