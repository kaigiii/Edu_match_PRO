"""合併演示用戶和正式用戶表

Revision ID: merge_demo_users
Revises: f4a1b2c3d4e6
Create Date: 2025-01-01 12:00:00.000000

注意：此迁移假设 demo_users 表可能不存在（如果数据库是从另一个分支来的）
会安全地处理表不存在的情况
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'merge_demo_users'
down_revision = 'f4a1b2c3d4e6'  # 从当前分支继续
branch_labels = None
depends_on = None


def upgrade():
    """
    合併 demo_users 到 user 表
    合併 demo_profiles 到 profile 表
    """
    # 1. 在 user 表中添加新字段
    op.add_column('user', sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user', sa.Column('display_name', sa.String(length=255), nullable=True))
    op.add_column('user', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('user', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('user', sa.Column('last_used_at', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'))
    
    # 2. 修改 profile 表，讓某些字段可為空
    op.alter_column('profile', 'contact_person',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('profile', 'position',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('profile', 'phone',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.alter_column('profile', 'address',
               existing_type=sa.VARCHAR(),
               nullable=True)
    
    # 3. 添加 profile.user_id 的唯一約束（如果還沒有）
    op.create_unique_constraint('uq_profile_user_id', 'profile', ['user_id'])
    
    # 4. 遷移數據：將 demo_users 的數據遷移到 user 表
    # 注意：需要確保 demo_users 表存在
    conn = op.get_bind()
    
    # 檢查 demo_users 表是否存在
    inspector = sa.inspect(conn)
    if 'demo_users' in inspector.get_table_names():
        # 遷移 demo_users 到 user
        conn.execute(sa.text("""
            INSERT INTO "user" (id, created_at, updated_at, email, password, role, is_demo, display_name, description, is_active, last_used_at, usage_count)
            SELECT id, created_at, updated_at, email, password, role::text::userrole, true, display_name, description, is_active, last_used_at, usage_count
            FROM demo_users
            WHERE email NOT IN (SELECT email FROM "user")
        """))
        
        # 遷移 demo_profiles 到 profile
        if 'demo_profiles' in inspector.get_table_names():
            conn.execute(sa.text("""
                INSERT INTO profile (id, created_at, updated_at, user_id, organization_name, contact_person, position, phone, address, bio, avatar_url)
                SELECT id, created_at, updated_at, user_id, organization_name, contact_person, position, phone, address, bio, avatar_url
                FROM demo_profiles
                WHERE user_id IN (SELECT id FROM "user" WHERE is_demo = true)
                AND user_id NOT IN (SELECT user_id FROM profile)
            """))
    
    # 5. 刪除舊的 demo_users 和 demo_profiles 表
    # 注意：這一步是可選的，如果想保留舊數據可以註釋掉
    if 'demo_profiles' in inspector.get_table_names():
        op.drop_table('demo_profiles')
    if 'demo_users' in inspector.get_table_names():
        op.drop_table('demo_users')


def downgrade():
    """
    回滾操作：將合併的用戶分離回 demo_users 表
    注意：此操作可能會導致數據丟失，建議在回滾前備份數據
    """
    # 1. 重新創建 demo_users 表
    op.create_table('demo_users',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_demo_only', sa.Boolean(), nullable=False),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_demo_users_email', 'demo_users', ['email'], unique=True)
    
    # 2. 重新創建 demo_profiles 表
    op.create_table('demo_profiles',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('organization_name', sa.String(length=255), nullable=False),
        sa.Column('contact_person', sa.String(length=255), nullable=False),
        sa.Column('position', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['demo_users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 3. 遷移數據回 demo_users
    conn = op.get_bind()
    conn.execute(sa.text("""
        INSERT INTO demo_users (id, created_at, updated_at, email, password, role, display_name, description, is_active, is_demo_only, last_used_at, usage_count)
        SELECT id, created_at, updated_at, email, password, role, display_name, description, is_active, true, last_used_at, usage_count
        FROM "user"
        WHERE is_demo = true
    """))
    
    conn.execute(sa.text("""
        INSERT INTO demo_profiles (id, created_at, updated_at, user_id, organization_name, contact_person, position, phone, address, bio, avatar_url)
        SELECT id, created_at, updated_at, user_id, organization_name, contact_person, position, phone, address, bio, avatar_url
        FROM profile
        WHERE user_id IN (SELECT id FROM "user" WHERE is_demo = true)
    """))
    
    # 4. 刪除 user 表中的演示用戶
    conn.execute(sa.text("DELETE FROM profile WHERE user_id IN (SELECT id FROM \"user\" WHERE is_demo = true)"))
    conn.execute(sa.text("DELETE FROM \"user\" WHERE is_demo = true"))
    
    # 5. 移除添加的字段
    op.drop_column('user', 'usage_count')
    op.drop_column('user', 'last_used_at')
    op.drop_column('user', 'is_active')
    op.drop_column('user', 'description')
    op.drop_column('user', 'display_name')
    op.drop_column('user', 'is_demo')
    
    # 6. 恢復 profile 表的必填約束
    op.alter_column('profile', 'contact_person',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('profile', 'position',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('profile', 'phone',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('profile', 'address',
               existing_type=sa.VARCHAR(),
               nullable=False)
    
    # 7. 移除唯一約束
    op.drop_constraint('uq_profile_user_id', 'profile', type_='unique')

