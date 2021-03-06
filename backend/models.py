import uuid
import datetime

from __init__ import db
from flask_login import UserMixin
from sqlalchemy import UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID

UUID_FIELD = UUID(as_uuid=True)


room_member = db.Table(
    'room_members',
    db.Column('id', db.Integer),
    db.Column('room_id', db.Integer, db.ForeignKey('room.room_id'),
              nullable=False),
    db.Column('user_id', UUID_FIELD, db.ForeignKey('users.user_id'),
              nullable=False),
    db.Column('datetime', db.DateTime, default=datetime.datetime.utcnow()),
    PrimaryKeyConstraint('id'),
    UniqueConstraint('room_id', 'user_id', name='room_id_member_id_uq')
)


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    user_id = db.Column(UUID_FIELD, primary_key=True)
    email = db.Column(db.String, unique=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    session_id = db.Column(db.String, unique=True)
    # password = db.Column(db.String(), nullable=False)
    datetime = db.Column(db.DateTime, default=datetime.datetime.utcnow())

    rooms = db.relationship('Room', secondary=room_member,
                            backref='users',
                            cascade="all,delete")

    def get_id(self):
        return self.user_id


class Room(db.Model):
    __table_args__ = (
        db.UniqueConstraint('name', 'creator_id',
                            name='room_name_creator_id_uq'),
    )

    room_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    creator_id = db.Column(UUID_FIELD, db.ForeignKey('users.user_id'),
                           nullable=False)
    datetime = db.Column(db.DateTime, default=datetime.datetime.utcnow())


class Messages(db.Model):
    __tablename__ = 'messages'

    message_id = db.Column(UUID_FIELD, primary_key=True,
                           default=uuid.uuid4)
    room_member_id = db.Column(db.Integer, db.ForeignKey('room_members.id'),
                               nullable=False)
    message_text = db.Column(db.TEXT, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=False)
    is_reply_to = db.Column(UUID_FIELD, nullable=True)
