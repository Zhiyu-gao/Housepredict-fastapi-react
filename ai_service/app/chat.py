from fastapi import APIRouter, Depends
from app.schemas import ChatRequest
from app.ai.graph import chat_graph
from app.security.jwt import get_current_user_from_jwt

router = APIRouter()

@router.post("/ai/chat")
def chat(
    req: ChatRequest,
    user = Depends(get_current_user_from_jwt),
):
    result = chat_graph.invoke({
        "question": req.question,
        "username": user["email"],  # 或 user_id
    })

    return {"answer": result["answer"]}
