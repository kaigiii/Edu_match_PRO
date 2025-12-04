from typing import Dict, Optional
from app.agents.coordinator import CoordinatorAgent

class SessionManager:
    """
    Session Manager
    
    負責管理所有活躍的代理人對話 Session。
    確保每個使用者 (Session ID) 都有獨立的代理人實例。
    """
    def __init__(self):
        self._sessions: Dict[str, CoordinatorAgent] = {}

    def get_or_create_session(self, session_id: str) -> CoordinatorAgent:
        """
        取得或建立 Session
        
        Args:
            session_id (str): 使用者的 Session ID
            
        Returns:
            CoordinatorAgent: 對應的協調者代理人實例
        """
        if session_id not in self._sessions:
            print(f"SessionManager: Creating new session for {session_id}")
            self._sessions[session_id] = CoordinatorAgent()
        
        return self._sessions[session_id]

    def get_session(self, session_id: str) -> Optional[CoordinatorAgent]:
        """
        取得 Session (若不存在則回傳 None)
        """
        return self._sessions.get(session_id)

    def clear_session(self, session_id: str):
        """
        清除特定 Session
        """
        if session_id in self._sessions:
            del self._sessions[session_id]

# 全域 Session Manager 實例
session_manager = SessionManager()
