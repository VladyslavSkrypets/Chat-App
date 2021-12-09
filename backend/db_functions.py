import datetime

from __init__ import db
from models import *
from typing import Iterable, List


def save_room(room_name: str, creator_id: int) -> int:
    new_room = Room(room_name, creator_id)
    db.session.add(new_room)
    db.session.commit()

    return new_room.id


def add_room_members(room_id: int, creator_id: int, members: Iterable[str]) -> None:
    room = Room.query.filter_by(id=room_id, creator_id=creator_id).first()
    for username in members:
        user = User.query.filter_by(username=username).first()
        if user is not None:
            room.users.append(user)

    db.session.add(room)
    db.session.commit()


def remove_room_members(room_id: int, creator_id: int, members: Iterable[str]):
    pass


def get_room_members(room_id: int, creator_id: int) -> List[str]:
    pass


def save_message(username: str, room_name: str, sent_at: datetime.datetime,
                 msg_text: str) -> int:
    pass

