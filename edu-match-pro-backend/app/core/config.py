from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Union
from pydantic import field_validator


class Settings(BaseSettings):
    database_url: str
    test_database_url: Optional[str] = None
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI 服務配置
    gemini_api_key: Optional[str] = None
    
    # Demo user passwords (for local/demo only)
    demo_school_password: str = "demo_school_2024"
    demo_company_password: str = "demo_company_2024"
    demo_rural_school_password: str = "demo_rural_2024"
    
    # CORS 配置優化
    cors_origins: Union[list[str], str] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://charlesetta-indignant-horacio.ngrok-free.dev,https://pedigreed-uncompulsively-reece.ngrok-free.dev"
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # 分割逗號分隔的字串
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8'
    )


settings = Settings()
