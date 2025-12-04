from pydantic import BaseModel
from typing import List, Optional, Any

class AgentQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class AgentQueryResponse(BaseModel):
    response: str
    tool_calls: Optional[List[dict]] = None
