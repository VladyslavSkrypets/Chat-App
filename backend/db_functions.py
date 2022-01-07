from itertools import chain
from schemas import RoomSchema, UserSchema, MessageSchema
from models import *
from typing import List, Set


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


def save_message(user_id: uuid.uuid4(), room_id: str, sent_at: datetime.datetime,
                 msg_text: str, reply_to_id: uuid.UUID) -> uuid.UUID:

    room_member_id = db.session.query(room_member).filter_by(
        room_id=room_id, user_id=user_id
    ).first().id
    new_msg = Messages(**{
        'room_member_id': room_member_id,
        'sent_at': sent_at,
        'message_text': msg_text,
        'is_reply_to': reply_to_id
    })
    db.session.add(new_msg)
    db.session.commit()

    return new_msg


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
        members = (
            db.session.query(room_member.c.id).filter(room_member.c.room_id == room['room_id']).all()
        )
        members = chain(*members) if members else []
        last_message = db.session.query(
            Messages.room_member_id, Messages.message_text,
            Messages.message_id, Messages.is_reply_to, Messages.sent_at
        ).order_by(Messages.sent_at.desc()).filter(Messages.room_member_id.in_(members)).first()

        room['chatMembers'] = get_room_members(room['room_id'])
        room['last_message'] = MessageSchema().dump(last_message)

    return total_rooms


def get_room_members(room_id: int):
    members_ids = list(
        chain(
            *db.session.query(room_member.c.user_id)
            .filter(room_member.c.room_id == room_id)
            .all()
        )
    )
    members_data = db.session.query(User).filter(User.user_id.in_(members_ids)).all()
    return UserSchema().dump(members_data, many=True)
