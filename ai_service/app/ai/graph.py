from typing import Literal, TypedDict

from langgraph.graph import END, StateGraph

from app.providers.qwen_client import qwen_chat


ChatIntent = Literal["who_am_i", "system_help", "price_analysis", "chat"]


class ChatState(TypedDict):
    question: str
    username: str | None
    intent: ChatIntent
    answer: str


def run_intent_graph(question: str, username: str | None):
    result = chat_graph.invoke({"question": question, "username": username})
    return result["intent"]


def intent_node(state: ChatState) -> ChatState:
    prompt = f"""
你是一个意图分类器，只能返回下面 4 个之一：

- who_am_i（询问用户身份）
- system_help（询问系统功能）
- price_analysis（询问房价、价格、贵不贵）
- chat（普通聊天）

用户问题：
{state["question"]}

只返回标签，不要解释。
"""

    intent = qwen_chat(prompt).strip()
    if intent not in {"who_am_i", "system_help", "price_analysis", "chat"}:
        intent = "chat"

    return {**state, "intent": intent}


def who_am_i_node(state: ChatState) -> ChatState:
    username = state.get("username")
    answer = "我暂时不知道你的身份，请先登录。" if not username else f"你当前登录的账户名是：{username}"
    return {**state, "answer": answer}


def system_help_node(state: ChatState) -> ChatState:
    return {
        **state,
        "answer": (
            "这是一个完整的全栈房价预测与分析系统，技术栈包括：\n\n"
            "React + FastAPI + MySQL + SQLAlchemy + Alembic + Machine Learning + AI Agent。\n\n"
            "系统主要包含以下模块：\n"
            "- 后端 RESTful API：房源信息的增删改查（CRUD）、用户系统、传统机器学习房价预测\n"
            "- 独立 AI 服务：使用 Kimi / Qwen / DeepSeek 对房价结果进行智能分析与问答\n"
            "- 前端多页面应用：房价预测、房源管理、个人信息、数据可视化大屏\n"
            "- 数据层：MySQL 持久化存储，Alembic 管理数据库迁移\n\n"
            "你可以直接向我提问，例如：\n"
            "- 这个系统能做什么？\n"
            "- 房价预测是怎么计算的？\n"
            "- AI 分析和传统预测有什么区别？"
        ),
    }


def price_analysis_node(state: ChatState) -> ChatState:
    return {**state, "answer": "这里将接入房价预测与分析逻辑（下一步实现）。"}


def chat_node(state: ChatState) -> ChatState:
    answer = qwen_chat(state["question"])
    return {**state, "answer": answer}


graph = StateGraph(ChatState)
graph.add_node("intent", intent_node)
graph.add_node("who_am_i", who_am_i_node)
graph.add_node("system_help", system_help_node)
graph.add_node("price_analysis", price_analysis_node)
graph.add_node("chat", chat_node)

graph.set_entry_point("intent")
graph.add_conditional_edges(
    "intent",
    lambda state: state["intent"],
    {
        "who_am_i": "who_am_i",
        "system_help": "system_help",
        "price_analysis": "price_analysis",
        "chat": "chat",
    },
)
graph.add_edge("who_am_i", END)
graph.add_edge("system_help", END)
graph.add_edge("price_analysis", END)
graph.add_edge("chat", END)

chat_graph = graph.compile()
