import asyncio
from app.database import engine, Base
from app.db_models import WideFaraway3, WideConnectedDevices, WideVolunteerTeams
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

async def init_db():
    """
    初始化資料庫並填入測試數據 (Initialize Database and Populate Dummy Data)
    
    此腳本用於開發和測試階段，它會執行以下操作：
    1. 刪除現有的所有資料表 (Drop all tables) - **注意：這會清除所有數據！**
    2. 重新建立所有資料表 (Create all tables) - 根據 `app.db_models` 中的定義。
    3. 插入測試用的假數據 (Insert dummy data) - 包含南投縣和新北市的學校、設備及志工資料。
    """
    
    # 1. 重建資料表結構
    async with engine.begin() as conn:
        # 刪除所有表 (Drop all tables)
        await conn.run_sync(Base.metadata.drop_all)
        # 建立所有表 (Create all tables)
        await conn.run_sync(Base.metadata.create_all)
    
    # 建立異步 Session 工廠
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )

    # 2. 插入測試數據
    async with async_session() as session:
        # 學校基本資料 (School Info)
        schools = [
            # 南投縣學校 (Nantou County Schools)
            WideFaraway3(
                school_name="南投縣立南投國中",
                city="南投縣",
                district="南投市",
                area_type="一般",
                male_students=200,
                female_students=180,
                student_level="國中"
            ),
            WideFaraway3(
                school_name="南投縣立信義國中",
                city="南投縣",
                district="信義鄉",
                area_type="偏遠",
                male_students=50,
                female_students=45,
                student_level="國中"
            ),
             WideFaraway3(
                school_name="南投縣立仁愛國小",
                city="南投縣",
                district="仁愛鄉",
                area_type="特偏",
                male_students=30,
                female_students=25,
                student_level="國小"
            ),
            # 新北市學校 (New Taipei City Schools)
            WideFaraway3(
                school_name="新北市立石碇高中",
                city="新北市",
                district="石碇區",
                area_type="偏遠",
                male_students=150,
                female_students=140,
                student_level="高中"
            ),
            WideFaraway3(
                school_name="新北市立坪林國中",
                city="新北市",
                district="坪林區",
                area_type="特偏",
                male_students=40,
                female_students=35,
                student_level="國中"
            ),
            WideFaraway3(
                school_name="新北市立烏來國中小",
                city="新北市",
                district="烏來區",
                area_type="極偏",
                male_students=60,
                female_students=55,
                student_level="國中小"
            ),
            WideFaraway3(
                school_name="新北市立石門國小",
                city="新北市",
                district="石門區",
                area_type="偏遠",
                male_students=80,
                female_students=70,
                student_level="國小"
            )
        ]
        
        # 學校設備資料 (School Devices Info)
        devices = [
            WideConnectedDevices(school_name="南投縣立南投國中", computer_count="50"),
            WideConnectedDevices(school_name="南投縣立信義國中", computer_count="20"),
            WideConnectedDevices(school_name="南投縣立仁愛國小", computer_count="10"),
            WideConnectedDevices(school_name="新北市立石碇高中", computer_count="40"),
            WideConnectedDevices(school_name="新北市立坪林國中", computer_count="15"),
            WideConnectedDevices(school_name="新北市立烏來國中小", computer_count="25"),
            WideConnectedDevices(school_name="新北市立石門國小", computer_count="30")
        ]
        
        # 志工服務資料 (Volunteer Teams Info)
        volunteers = [
            WideVolunteerTeams(service_unit="南投縣立信義國中", year="112"),
            WideVolunteerTeams(service_unit="南投縣立仁愛國小", year="112")
        ]
        
        # 將物件加入 Session
        session.add_all(schools)
        session.add_all(devices)
        session.add_all(volunteers)
        
        # 提交交易 (Commit Transaction)
        await session.commit()
        print("Database initialized with dummy data.")

if __name__ == "__main__":
    asyncio.run(init_db())
