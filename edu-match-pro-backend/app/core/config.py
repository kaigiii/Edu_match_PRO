from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union
from pydantic import field_validator


class Settings(BaseSettings):
    database_url: str
    test_database_url: Optional[str] = None
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI 服務配置 - 支援多個API密鑰輪換
    gemini_api_key: Optional[str] = None
    gemini_api_key_2: Optional[str] = None
    gemini_api_key_3: Optional[str] = None
    gemini_api_key_4: Optional[str] = None
    
    # Demo user passwords (for local/demo only)
    demo_school_password: str = "demo_school_2024"
    demo_company_password: str = "demo_company_2024"
    demo_rural_school_password: str = "demo_rural_2024"
    
    # CORS 配置優化
    # 本地開發 + GitHub Pages + ngrok 後端
    cors_origins: Union[list[str], str] = "http://localhost:5173,http://127.0.0.1:5173,https://kaigiii.github.io,https://nonexpendable-superinquisitive-harmony.ngrok-free.dev"
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # 分割逗號分隔的字串
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    def get_gemini_api_keys(self) -> list[str]:
        """獲取所有可用的 Gemini API 密鑰列表"""
        keys = []
        if self.gemini_api_key:
            keys.append(self.gemini_api_key)
        if self.gemini_api_key_2:
            keys.append(self.gemini_api_key_2)
        if self.gemini_api_key_3:
            keys.append(self.gemini_api_key_3)
        if self.gemini_api_key_4:
            keys.append(self.gemini_api_key_4)
        return keys
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8'
    )


settings = Settings()
