from itertools import chain
from schemas import RoomSchema, UserSchema
from models import *
from typing import Iterable, List, Set


def save_room(room_name: str, creator_id: int) -> int:
    new_room = Room(name=room_name, creator_id=creator_id)
    db.session.add(new_room)
    db.session.commit()

    return new_room.room_id


def add_room_member(room_id: int, creator_id: int, user_id: UUID) -> None:
    room = Room.query.filter_by(room_id=room_id, creator_id=creator_id).first()
    db.session.add(room)
    user = User.query.filter_by(user_id=user_id).first()
    if user is not None:
        room.users.append(user)

    db.session.commit()


def remove_room_members(room_id: int, creator_id: int, members: Iterable[str]):
    pass


def save_message(user_id: uuid.uuid4(), room_name: str, sent_at: datetime.datetime,
                 msg_text: str, reply_to_id: uuid.UUID) -> uuid.UUID:
    print(room_name)
    room_id = Room.query.filter_by(name=room_name).first().room_id

    room_member_id = db.session.query(room_member).filter_by(
        room_id=room_id, user_id=user_id
    ).first().id

    new_msg = Messages(room_member_id, sent_at, msg_text, reply_to_id)
    db.session.add(new_msg)
    db.session.commit()

    return new_msg.message_id


def delete_message(msg_id):
    User.query.filter_by(msg_id).delete()
    db.session.commit()


def get_current_user_rooms(user_id):
    return [room.name for room in User.query.get(user_id).rooms]


def get_users_sessions(users_ids: Set[str]) -> List[tuple]:
    return [
        (user.user_id, user.session_id)
        for user in db.session.query(User).filter(User.user_id.in_(users_ids))
    ]


def remove_room(room_id):

    room_members = db.session.query(room_member.c.id).filter_by(room_id=room_id)
    room_messages = (
        db.session.query(Messages)
        .filter(Messages.room_member_id.in_(chain(*room_members.all())))
    )
    room_messages.delete()
    db.session.query(room_member).filter(room_member.c.room_id == room_id).delete()
    Room.query.filter_by(room_id=room_id).delete()
    db.session.commit()


def get_uid_by_room_member_id(room_member_id):
    return db.session.query(room_member).filter_by(id=room_member_id).first().user_id


def get_room_members_by_room_id(room_id):
    return db.session.query(room_member).filter_by(room_id=room_id).all()


def get_chats(user_id: UUID):
    rooms = (
        db.session.query(Room.room_id, Room.name, Room.creator_id, room_member)
        .join(room_member, Room.room_id == room_member.c.room_id)
        .filter(room_member.c.user_id == user_id).all()
    )
    total_rooms = RoomSchema().dump(set(rooms), many=True)
    for room in total_rooms:
        room['chatMembers'] = get_room_members(room['room_id'])

    return total_rooms


def get_room_members(room_id: int) :
    members_ids = list(
        chain(
            *db.session.query(room_member.c.user_id)
            .filter(room_member.c.room_id == room_id)
            .all()
        )
    )
    members_data = db.session.query(User).filter(User.user_id.in_(members_ids)).all()
    return UserSchema().dump(members_data, many=True)
