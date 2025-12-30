from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

# ⚠️ 必须和 backend 完全一致
from app.config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")



def get_current_user_from_jwt(
    token: str = Depends(oauth2_scheme),
) -> dict:
    """
    AI 服务专用：
    - 只验证 JWT
    - 不查数据库
    - 返回 user 基本信息 dict
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")

        if user_id is None:
            raise credentials_exception

        return {
            "user_id": int(user_id),
            "email": email,
        }

    except (JWTError, ValueError) as e:
        print("❌ JWT decode error:", e)
        raise credentials_exception
