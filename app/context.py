from contextvars import ContextVar
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

# ContextVar to hold the database session for the current request
db_session_var: ContextVar[Optional[AsyncSession]] = ContextVar("db_session", default=None)

# ContextVar to hold the last SQL result for the current request (for Analysis Agent)
last_sql_result_var: ContextVar[str] = ContextVar("last_sql_result", default="")
