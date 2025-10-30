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
CONNECTED_DEVICES_PATH = os.path.join(DATA_DIR, "全國國民中小學可上網電腦設備數量.csv")
VOLUNTEER_TEAMS_PATH = os.path.join(DATA_DIR, "資訊志工團隊名單.csv")


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


async def upsert_wide_connected_devices(session: AsyncSession, row: Dict[str, Any]) -> None:
    """將可上網電腦設備數量資料寫入 wide_connected_devices 表（upsert）。
    參考已有 wide 表的實作風格：使用 pg_insert 並以 year + county + device_type 作為唯一鍵。
    欄位命名會以 CSV 內最常見的欄位做對映：縣市, 縣市代碼, 學校類別, 設備類型, 數量
    """
    metadata = MetaData()
    table = Table(
        'wide_connected_devices',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('縣市', sa.Text),
        sa.Column('縣市代碼', sa.Text),
        sa.Column('鄉鎮市區', sa.Text),
        sa.Column('學校名稱', sa.Text),
        sa.Column('教學電腦數', sa.Text),
    )

    def gi(key: str) -> Optional[int]:
        return parse_int(row.get(key))

    # CSV 欄位可能使用不同名稱，嘗試幾種常見欄位 key
    def get_field(*candidates: str) -> Optional[str]:
        for c in candidates:
            v = row.get(c)
            if v is not None:
                return str(v).strip()
        return None

    now = datetime.utcnow()
    stmt = (
        pg_insert(table)
        .values(
            id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **{
                '縣市': (get_field('縣市', '縣市別', '縣市名稱') or ''),
                '縣市代碼': (get_field('縣市代碼', '縣市代號', '縣市別代砠') or ''),
                '鄉鎮市區': (get_field('鄉鎮市區', '鄉鎮', '鄉鎮市區') or ''),
                '學校名稱': (get_field('學校名稱', '本校名稱', '本校名稱(學校名稱)') or ''),
                '教學電腦數': (get_field('教學電腦數', '教學電腦數', '數量', '數量(台)', '可上網電腦數量') or ''),
            }
        )
        .on_conflict_do_update(
            # 使用 縣市 + 縣市代碼 + 鄉鎮市區 + 學校名稱 作為唯一鍵
            constraint='uq_wide_connected_county_code_town_school',
            set_={
                'updated_at': sa.literal(now),
                '教學電腦數': sa.literal((get_field('教學電腦數', '教學電腦數', '數量', '數量(台)', '可上網電腦數量') or '')),
                '鄉鎮市區': sa.literal((get_field('鄉鎮市區', '鄉鎮', '鄉鎮市區') or '')),
                '縣市代碼': sa.literal((get_field('縣市代碼', '縣市代號', '縣市別代砠') or '')),
                '學校名稱': sa.literal((get_field('學校名稱', '本校名稱', '本校名稱(學校名稱)') or '')),
            }
        )
    )
    await session.execute(stmt)


async def upsert_wide_volunteer_teams(session: AsyncSession, row: Dict[str, Any]) -> None:
    """將資訊志工團隊名單資料寫入 wide_volunteer_teams 表（upsert）。
    CSV 欄位：年度, 縣市, 受服務單位, 志工團隊學校
    """
    metadata = MetaData()
    table = Table(
        'wide_volunteer_teams',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('年度', sa.Text),
        sa.Column('縣市', sa.Text),
        sa.Column('受服務單位', sa.Text),
        sa.Column('志工團隊學校', sa.Text),
    )

    now = datetime.utcnow()
    
    year = (row.get('年度') or '').strip()
    county = (row.get('縣市') or '').strip()
    service_unit = (row.get('受服務單位') or '').strip()
    volunteer_school = (row.get('志工團隊學校') or '').strip()
    
    stmt = (
        pg_insert(table)
        .values(
            id=str(uuid.uuid4()),
            created_at=now,
            updated_at=now,
            **{
                '年度': year,
                '縣市': county,
                '受服務單位': service_unit,
                '志工團隊學校': volunteer_school,
            }
        )
        .on_conflict_do_update(
            # 使用 年度 + 縣市 + 受服務單位 + 志工團隊學校 作為唯一鍵
            constraint='uq_wide_volunteer_year_county_unit_school',
            set_={
                'updated_at': sa.literal(now),
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


async def ingest_connected_devices_wide() -> int:
    if not os.path.exists(CONNECTED_DEVICES_PATH):
        raise FileNotFoundError(CONNECTED_DEVICES_PATH)
    count = 0
    async with await get_session() as session:
        await session.begin()
        # 嘗試以 UTF-8 首選，若失敗可改為 big5 或其他編碼
        encodings = ["utf-8-sig", "big5", "cp950"]
        opened = False
        for enc in encodings:
            try:
                with open(CONNECTED_DEVICES_PATH, newline="", encoding=enc) as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        await upsert_wide_connected_devices(session, row)
                        count += 1
                opened = True
                break
            except UnicodeDecodeError:
                # 嘗試下一種編碼
                continue
        if not opened:
            # 最後一招：用二進位讀取並以 replacement 解碼，避免中斷
            with open(CONNECTED_DEVICES_PATH, "rb") as f:
                text_data = f.read().decode("utf-8", errors="replace")
                reader = csv.DictReader(text_data.splitlines())
                for row in reader:
                    await upsert_wide_connected_devices(session, row)
                    count += 1
        await session.commit()
    return count


async def ingest_volunteer_teams_wide() -> int:
    """導入資訊志工團隊名單"""
    if not os.path.exists(VOLUNTEER_TEAMS_PATH):
        raise FileNotFoundError(VOLUNTEER_TEAMS_PATH)
    count = 0
    async with await get_session() as session:
        await session.begin()
        # 嘗試以 UTF-8 首選，若失敗可改為 big5 或其他編碼
        encodings = ["utf-8-sig", "big5", "cp950"]
        opened = False
        for enc in encodings:
            try:
                with open(VOLUNTEER_TEAMS_PATH, newline="", encoding=enc) as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # 跳過空行
                        if not any(row.values()):
                            continue
                        await upsert_wide_volunteer_teams(session, row)
                        count += 1
                opened = True
                break
            except UnicodeDecodeError:
                # 嘗試下一種編碼
                continue
        if not opened:
            # 最後一招：用二進位讀取並以 replacement 解碼，避免中斷
            with open(VOLUNTEER_TEAMS_PATH, "rb") as f:
                text_data = f.read().decode("utf-8", errors="replace")
                reader = csv.DictReader(text_data.splitlines())
                for row in reader:
                    if not any(row.values()):
                        continue
                    await upsert_wide_volunteer_teams(session, row)
                    count += 1
        await session.commit()
    return count


async def ensure_wide_tables_exist() -> None:
    """確保四張 wide 表存在；若不存在就建立（使用 SQLAlchemy metadata.create_all）。"""
    engine = create_async_engine(settings.database_url, echo=False)
    metadata = MetaData()

    # wide_edu_B_1_4
    Table(
        'wide_edu_B_1_4',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID, primary_key=True),
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
        sa.UniqueConstraint('學年度', '縣市別', name='uq_wide_edu_year_county')
    )

    # wide_faraway3
    Table(
        'wide_faraway3',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID, primary_key=True),
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
        sa.UniqueConstraint('學年度', '本校代碼', '分校分班名稱', name='uq_wide_faraway_year_code_branch')
    )

    # wide_connected_devices
    Table(
        'wide_connected_devices',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID, primary_key=True),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('縣市', sa.Text),
        sa.Column('縣市代碼', sa.Text),
        sa.Column('鄉鎮市區', sa.Text),
        sa.Column('學校名稱', sa.Text),
        sa.Column('教學電腦數', sa.Text),
        sa.UniqueConstraint('縣市', '縣市代碼', '鄉鎮市區', '學校名稱', name='uq_wide_connected_county_code_town_school')
    )

    # wide_volunteer_teams
    Table(
        'wide_volunteer_teams',
        metadata,
        sa.Column('id', sa.dialects.postgresql.UUID, primary_key=True),
        sa.Column('created_at', sa.DateTime),
        sa.Column('updated_at', sa.DateTime),
        sa.Column('年度', sa.Text),
        sa.Column('縣市', sa.Text),
        sa.Column('受服務單位', sa.Text),
        sa.Column('志工團隊學校', sa.Text),
        sa.UniqueConstraint('年度', '縣市', '受服務單位', '志工團隊學校', name='uq_wide_volunteer_year_county_unit_school')
    )

    # 使用 async engine 並在 sync context 中建立表
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)
    await engine.dispose()


async def main() -> None:
    # 預設情況下使用 Alembic migration 管理資料表。若你想在 ingest 時自動建立表
    #（開發模式），可以將環境變數 CREATE_TABLES_AT_INGEST 設為 1/true。
    if os.getenv("CREATE_TABLES_AT_INGEST", "false").lower() in ("1", "true", "yes"):
        await ensure_wide_tables_exist()

    print("📊 開始導入資料...")
    print("-" * 60)
    
    w1 = await ingest_school_population_wide()
    print(f"✅ 已處理 {w1} 筆 edu_B_1_4 資料")
    
    w2 = await ingest_faraway_list_wide()
    print(f"✅ 已處理 {w2} 筆 faraway3 資料")
    
    w3 = await ingest_connected_devices_wide()
    print(f"✅ 已處理 {w3} 筆 connected_devices 資料")
    
    w4 = await ingest_volunteer_teams_wide()
    print(f"✅ 已處理 {w4} 筆 volunteer_teams 資料")
    
    print("-" * 60)
    print("📈 資料庫統計:")
    
    async with await get_session() as session:
        res1 = await session.execute(text('SELECT COUNT(*) FROM "wide_edu_B_1_4"'))
        res2 = await session.execute(text('SELECT COUNT(*) FROM wide_faraway3'))
        res3 = await session.execute(text('SELECT COUNT(*) FROM wide_connected_devices'))
        res4 = await session.execute(text('SELECT COUNT(*) FROM wide_volunteer_teams'))
        
        print(f"  • wide_edu_B_1_4: {res1.scalar_one()} 筆")
        print(f"  • wide_faraway3: {res2.scalar_one()} 筆")
        print(f"  • wide_connected_devices: {res3.scalar_one()} 筆")
        print(f"  • wide_volunteer_teams: {res4.scalar_one()} 筆")
        
        print("-" * 60)
        print("🎉 資料導入完成！")


if __name__ == "__main__":
    asyncio.run(main())
