from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Numeric
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

# 1. 縣市教育統計 (WideEduB14)
class WideEduB14(Base):
    """
    縣市教育統計表 (City Education Statistics)
    
    對應資料庫表格: `wide_edu_b_1_4`
    來源: 教育部統計處 - 縣市別各級學校學生人數
    用途: 提供各縣市不同教育階段（幼兒園至大專）的學生總數概況。
    """
    __tablename__ = "wide_edu_b_1_4"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    year = Column("學年度", Text)  # e.g., "112"
    city = Column("縣市別", Text)  # e.g., "南投縣"
    kindergarten_count = Column("幼兒園[人]", Integer)
    primary_count = Column("國小[人]", Integer)
    junior_count = Column("國中[人]", Integer)
    senior_ordinary_count = Column("高級中等學校-普通科[人]", Integer)
    senior_professional_count = Column("高級中等學校-專業群科[人]", Integer)
    senior_comprehensive_count = Column("高級中等學校-綜合高中[人]", Integer)
    senior_practical_count = Column("高級中等學校-實用技能學程[人]", Integer)
    senior_night_count = Column("高級中等學校-進修部[人]", Integer)
    college_main_count = Column("大專校院(全部計入校本部)[人]", Integer)
    college_cross_count = Column("大專校院(跨縣市教學計入所在地縣市)[人]", Integer)
    religious_count = Column("宗教研修學院[人]", Integer)
    continuing_count = Column("國民補習及大專進修學校及空大[人]", Integer)
    special_edu_count = Column("特殊教育學校[人]", Integer)

# 2. 偏遠地區學校 (WideFaraway3)
class WideFaraway3(Base):
    """
    偏遠地區學校名單 (Remote Schools List)
    
    對應資料庫表格: `wide_faraway3`
    來源: 教育部統計處 - 偏遠地區國民中小學名錄
    用途: 提供偏鄉學校的詳細資訊，包括偏遠等級、學生人數及原住民比率。
    """
    __tablename__ = "wide_faraway3"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    year = Column("學年度", Text)
    city = Column("縣市名稱", Text)
    district = Column("鄉鎮市區", Text)
    student_level = Column("學生等級", Text)  # e.g., "國小", "國中"
    school_code = Column("本校代碼", Text)
    school_name = Column("本校名稱", Text)
    branch_name = Column("分校分班名稱", Text)
    public_private = Column("公/私立", Text)
    area_type = Column("地區屬性", Text)  # "偏遠", "特偏", "極偏"
    class_count = Column("班級數", Integer)
    male_students = Column("男學生數[人]", Integer)
    female_students = Column("女學生數[人]", Integer)
    indigenous_ratio = Column("原住民學生比率", Numeric(10, 4))
    grad_male_prev = Column("上學年男畢業生數[人]", Integer)
    grad_female_prev = Column("上學年女畢業生數[人]", Integer)

# 3. 學校電腦設備 (WideConnectedDevices)
class WideConnectedDevices(Base):
    """
    學校數位設備統計 (School Digital Devices)
    
    對應資料庫表格: `wide_connected_devices`
    來源: 數位發展部 - 全國國民中小學可上網電腦設備數量
    用途: 評估學校的硬體資源狀況。
    """
    __tablename__ = "wide_connected_devices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    city = Column("縣市", Text)
    city_code = Column("縣市代碼", Text)
    district = Column("鄉鎮市區", Text)
    school_name = Column("學校名稱", Text)
    computer_count = Column("教學電腦數", Text)  # 需注意資料清洗

# 4. 志工團隊 (WideVolunteerTeams)
class WideVolunteerTeams(Base):
    """
    資訊志工團隊名單 (IT Volunteer Teams)
    
    對應資料庫表格: `wide_volunteer_teams`
    來源: 教育部 - 資訊志工團隊計畫
    用途: 了解學校獲得的外部人力資源支援情況。
    """
    __tablename__ = "wide_volunteer_teams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    year = Column("年度", Text)
    city = Column("縣市", Text)
    service_unit = Column("受服務單位", Text)  # 通常為學校名稱
    volunteer_school = Column("志工團隊學校", Text)  # 提供服務的大學或單位
