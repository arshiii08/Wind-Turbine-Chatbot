# models.py
from sqlalchemy import Column, Integer, Text, DateTime, func, String, ForeignKey
from sqlalchemy.orm import relationship  # ✅ Correct
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

# class ChatMessage(Base):
#     __tablename__ = "chatbot_messages"
#     __table_args__ = {'extend_existing': True}  

#     id = Column(Integer, primary_key=True, index=True)
#     chat_id = Column(UUID(as_uuid=True), default=uuid.uuid4, index=True)
#     user_message = Column(Text, nullable=False)
#     bot_response = Column(Text)
#     intent = Column(Text)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# ────────────── USER MODEL ──────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chats = relationship("ChatMessage", back_populates="user")

# ────────────── CHAT MODEL ──────────────
class ChatMessage(Base):
    __tablename__ = "chatbot_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(UUID(as_uuid=True), default=uuid.uuid4, index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text)
    intent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign key linking to the user
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="chats")
