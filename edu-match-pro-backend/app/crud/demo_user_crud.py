"""
Demo用户CRUD操作
重新导出user_crud中的demo用户相关函数
"""
from app.crud.user_crud import (
    create_demo_user,
    get_user_by_email,
    authenticate_user,
    update_user_usage,
    get_all_users,
    get_users_by_role
)

__all__ = [
    'create_demo_user',
    'get_user_by_email',
    'authenticate_user', 
    'update_user_usage',
    'get_all_users',
    'get_users_by_role'
]

