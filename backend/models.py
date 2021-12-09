from __init__ import db
from flask_login import UserMixin
from sqlalchemy import UniqueConstraint


room_member = db.Table(
    'room_members',
    db.Column('room_id', db.Integer, db.ForeignKey('room.id'), nullable=False),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=False),
    UniqueConstraint('room_id', 'user_id', name='room_id_member_id_uq')
)


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)

    rooms = db.relationship('Room', secondary=room_member,
                            backref=db.backref('users', lazy='dynamic'),
                            cascade="all,delete")

    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<User %r>' % self.username


class Room(db.Model):
    __table_args__ = (
        db.UniqueConstraint('name', 'creator_id',
                            name='room_name_creator_id_uq'),
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __init__(self, name: str, creator_id: int):
        self.name = name
        self.creator_id = creator_id

