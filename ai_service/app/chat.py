import json
import logging
from collections.abc import Iterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.ai.graph import chat_graph
from app.schemas import ChatRequest
from app.security.jwt import get_current_user_from_jwt

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/ai/chat")
def chat(
    req: ChatRequest,
    user: dict = Depends(get_current_user_from_jwt),
):
    result = chat_graph.invoke({"question": req.question, "username": user["email"]})

    return {"answer": result["answer"]}


@router.post("/ai/chat/stream")
def chat_stream(
    req: ChatRequest,
    user: dict = Depends(get_current_user_from_jwt),
):
    if not req.question:
        raise HTTPException(status_code=400, detail="question required")

    result = chat_graph.invoke({"question": req.question, "username": user["email"]})

    intent = result["intent"]

    if intent != "chat":
        answer = result["answer"]

        def once() -> Iterator[str]:
            yield f"data: {json.dumps({'delta': answer})}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(once(), media_type="text/event-stream")

    def event_generator() -> Iterator[str]:
        try:
            from app.providers.qwen_client import qwen_chat_stream

            for token in qwen_chat_stream(req.question):
                yield f"data: {json.dumps({'delta': token})}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.exception("Stream chat failed")
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
