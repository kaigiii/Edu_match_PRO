import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()

async def fix_schema():
    database_url = os.getenv("DATABASE_URL")
    engine = create_async_engine(database_url, echo=True)
    async with engine.begin() as conn:
        # wide_edu_b_1_4
        try:
            await conn.execute(text('ALTER TABLE wide_edu_b_1_4 ADD CONSTRAINT uq_wide_edu_year_county UNIQUE ("學年度", "縣市別")'))
            print("Added constraint to wide_edu_b_1_4")
        except Exception as e:
            print(f"wide_edu_b_1_4: {e}")

        # wide_faraway3
        try:
            await conn.execute(text('ALTER TABLE wide_faraway3 ADD CONSTRAINT uq_wide_faraway_year_code_branch UNIQUE ("學年度", "本校代碼", "分校分班名稱")'))
            print("Added constraint to wide_faraway3")
        except Exception as e:
            print(f"wide_faraway3: {e}")

        # wide_connected_devices
        try:
            await conn.execute(text('ALTER TABLE wide_connected_devices ADD CONSTRAINT uq_wide_connected_county_code_town_school UNIQUE ("縣市", "縣市代碼", "鄉鎮市區", "學校名稱")'))
            print("Added constraint to wide_connected_devices")
        except Exception as e:
            print(f"wide_connected_devices: {e}")

        # wide_volunteer_teams
        try:
            await conn.execute(text('ALTER TABLE wide_volunteer_teams ADD CONSTRAINT uq_wide_volunteer_year_county_unit_school UNIQUE ("年度", "縣市", "受服務單位", "志工團隊學校")'))
            print("Added constraint to wide_volunteer_teams")
        except Exception as e:
            print(f"wide_volunteer_teams: {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
