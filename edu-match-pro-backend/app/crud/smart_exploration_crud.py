"""
智能探索數據查詢 CRUD
針對四個 wide 表進行優化查詢，減少 API 調用
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text


async def query_schools_by_criteria(
    session: AsyncSession,
    counties: Optional[List[str]] = None,
    area_type: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    根據條件查詢學校數據（省 API 方式：在數據庫層面聚合）
    
    Args:
        session: 數據庫會話
        counties: 目標縣市列表
        area_type: 地區屬性
        limit: 限制返回數量
    
    Returns:
        包含統計數據和學校列表的字典
    """
    result = {
        "faraway_schools": [],
        "edu_stats": [],
        "devices_info": [],
        "volunteer_teams": [],
        "statistics": {
            "total_schools": 0,
            "total_students": 0,
            "counties_covered": [],
            "area_types": {}
        }
    }
    
    # 1. 查詢偏鄉學校數據（wide_faraway3）
    # 注意：列名是「本校名稱」和「分校分班名稱」，學生數需要計算
    # 縣市名稱格式：「13屏東縣」（前面有數字編號），所以用 LIKE 查詢
    conditions = []
    
    # 如果 counties 包含「全台灣」、「全台」等，則不篩選縣市
    if counties and not any(keyword in str(counties) for keyword in ['全台灣', '全台', '所有縣市', '全部']):
        # 過濾掉空字串
        valid_counties = [c for c in counties if c and c.strip()]
        if valid_counties:
            county_conditions = " OR ".join([f"縣市名稱 LIKE '%{county}'" for county in valid_counties])
            conditions.append(f"({county_conditions})")
    
    if area_type:
        conditions.append(f"地區屬性 = '{area_type}'")
    
    if conditions:
        faraway_query = text(f"""
            SELECT 縣市名稱, 本校名稱, 分校分班名稱, 地區屬性, 班級數, 
                   (COALESCE("男學生數[人]", 0) + COALESCE("女學生數[人]", 0)) AS 學生數
            FROM wide_faraway3
            WHERE {' AND '.join(conditions)}
            ORDER BY 學生數 DESC
            LIMIT {limit}
        """)
    else:
        faraway_query = text(f"""
            SELECT 縣市名稱, 本校名稱, 分校分班名稱, 地區屬性, 班級數, 
                   (COALESCE("男學生數[人]", 0) + COALESCE("女學生數[人]", 0)) AS 學生數
            FROM wide_faraway3
            ORDER BY 學生數 DESC
            LIMIT {limit}
        """)
    
    try:
        faraway_result = await session.execute(faraway_query)
        faraway_rows = faraway_result.fetchall()
        
        for row in faraway_rows:
            result["faraway_schools"].append({
                "county": row[0],
                "school_name": row[1],
                "branch_name": row[2],
                "area_type": row[3],
                "classes": row[4],
                "students": row[5]
            })
    except Exception as e:
        print(f"[查詢錯誤] 偏鄉學校: {e}")
    
    # 2. 查詢教育統計數據（wide_edu_B_1_4）
    # 注意：表名包含大寫字母，需要用雙引號包裹
    # 列名：縣市別, 幼兒園[人], 國小[人], 國中[人] 等
    edu_query_conditions = []
    if counties and not any(keyword in str(counties) for keyword in ['全台灣', '全台', '所有縣市', '全部']):
        valid_counties = [c for c in counties if c and c.strip()]
        if valid_counties:
            county_conditions = " OR ".join([f"縣市別 LIKE '%{county}'" for county in valid_counties])
            edu_query_conditions.append(f"({county_conditions})")
    
    if edu_query_conditions:
        edu_query = text(f"""
            SELECT 縣市別, 
                   SUM(CAST("幼兒園[人]" AS INTEGER)) as total_kindergarten,
                   SUM(CAST("國小[人]" AS INTEGER)) as total_elementary,
                   SUM(CAST("國中[人]" AS INTEGER)) as total_junior,
                   SUM(CAST("高級中等學校-普通科[人]" AS INTEGER) + 
                       CAST("高級中等學校-專業群科[人]" AS INTEGER) + 
                       CAST("高級中等學校-綜合高中[人]" AS INTEGER)) as total_senior
            FROM "wide_edu_B_1_4"
            WHERE {' AND '.join(edu_query_conditions)}
            GROUP BY 縣市別
        """)
    else:
        edu_query = text(f"""
            SELECT 縣市別, 
                   SUM(CAST("幼兒園[人]" AS INTEGER)) as total_kindergarten,
                   SUM(CAST("國小[人]" AS INTEGER)) as total_elementary,
                   SUM(CAST("國中[人]" AS INTEGER)) as total_junior,
                   SUM(CAST("高級中等學校-普通科[人]" AS INTEGER) + 
                       CAST("高級中等學校-專業群科[人]" AS INTEGER) + 
                       CAST("高級中等學校-綜合高中[人]" AS INTEGER)) as total_senior
            FROM "wide_edu_B_1_4"
            GROUP BY 縣市別
            LIMIT {limit}
        """)
    
    try:
        edu_result = await session.execute(edu_query)
        edu_rows = edu_result.fetchall()
        
        for row in edu_rows:
            result["edu_stats"].append({
                "county": row[0],
                "kindergarten": row[1] or 0,
                "elementary": row[2] or 0,
                "junior": row[3] or 0,
                "senior": row[4] or 0
            })
    except Exception as e:
        print(f"[查詢錯誤] 教育統計: {e}")
    
    # 3. 查詢電腦設備數據（wide_connected_devices）
    # 列名：教學電腦數
    devices_query_conditions = []
    if counties and not any(keyword in str(counties) for keyword in ['全台灣', '全台', '所有縣市', '全部']):
        valid_counties = [c for c in counties if c and c.strip()]
        if valid_counties:
            county_conditions = " OR ".join([f"縣市 LIKE '%{county}'" for county in valid_counties])
            devices_query_conditions.append(f"({county_conditions})")
    
    if devices_query_conditions:
        devices_query = text(f"""
            SELECT 縣市, 鄉鎮市區, 學校名稱, 
                   CAST(教學電腦數 AS INTEGER) as computers
            FROM wide_connected_devices
            WHERE {' AND '.join(devices_query_conditions)}
            ORDER BY computers DESC
            LIMIT {limit}
        """)
    else:
        devices_query = text(f"""
            SELECT 縣市, 鄉鎮市區, 學校名稱, 
                   CAST(教學電腦數 AS INTEGER) as computers
            FROM wide_connected_devices
            ORDER BY computers DESC
            LIMIT {limit}
        """)
    
    try:
        devices_result = await session.execute(devices_query)
        devices_rows = devices_result.fetchall()
        
        for row in devices_rows:
            result["devices_info"].append({
                "county": row[0],
                "township": row[1],
                "school_name": row[2],
                "computers": row[3] or 0
            })
    except Exception as e:
        print(f"[查詢錯誤] 電腦設備: {e}")
    
    # 4. 查詢志工團隊數據（wide_volunteer_teams）
    # 列名：年度, 受服務單位, 志工團隊學校
    volunteer_query_conditions = []
    if counties and not any(keyword in str(counties) for keyword in ['全台灣', '全台', '所有縣市', '全部']):
        valid_counties = [c for c in counties if c and c.strip()]
        if valid_counties:
            county_conditions = " OR ".join([f"縣市 LIKE '%{county}'" for county in valid_counties])
            volunteer_query_conditions.append(f"({county_conditions})")
    
    if volunteer_query_conditions:
        volunteer_query = text(f"""
            SELECT 年度, 縣市, 受服務單位, 志工團隊學校
            FROM wide_volunteer_teams
            WHERE {' AND '.join(volunteer_query_conditions)}
            LIMIT {limit}
        """)
    else:
        volunteer_query = text(f"""
            SELECT 年度, 縣市, 受服務單位, 志工團隊學校
            FROM wide_volunteer_teams
            LIMIT {limit}
        """)
    
    try:
        volunteer_result = await session.execute(volunteer_query)
        volunteer_rows = volunteer_result.fetchall()
        
        for row in volunteer_rows:
            result["volunteer_teams"].append({
                "year": row[0],
                "county": row[1],
                "service_unit": row[2],
                "volunteer_school": row[3]
            })
    except Exception as e:
        print(f"[查詢錯誤] 志工團隊: {e}")
    
    # 計算統計數據
    result["statistics"]["total_schools"] = len(result["faraway_schools"])
    result["statistics"]["total_students"] = sum(
        school.get("students", 0) for school in result["faraway_schools"]
    )
    
    counties_set = set()
    area_types_count = {}
    
    for school in result["faraway_schools"]:
        if school.get("county"):
            counties_set.add(school["county"])
        if school.get("area_type"):
            area_type_val = school["area_type"]
            area_types_count[area_type_val] = area_types_count.get(area_type_val, 0) + 1
    
    result["statistics"]["counties_covered"] = list(counties_set)
    result["statistics"]["area_types"] = area_types_count
    
    return result

