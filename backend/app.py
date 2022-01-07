import os
import jwt
import logging
from flask import request, abort, jsonify
from __init__ import app, socketio, login
from schemas import *
from flask_login import login_user, current_user
from flask_socketio import send, emit, join_room, leave_room
from db_functions import *
from functools import wraps

LOGS_DIR = os.path.join(os.path.dirname(__file__), 'logs')

if not os.path.isdir(LOGS_DIR):
    os.mkdir(LOGS_DIR)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s\t:  %(message)s',
    datefmt='%d.%m.%Y-%H:%M:%S'
)

logger = logging.getLogger()


def room_admin_checker(function):
    @wraps(function)
    def wrapper(data):
        admin_id = Room.query.get(data['room_id']).creator_id
        if admin_id == current_user.user_id:
            return function(data)
        abort(403, description="You have to be a room admin "
                               "to edit/delete the room")

    return wrapper


def room_member_checker(function):
    @wraps(function)
    def wrapper(room_id):
        room_user_ids = {u.user_id for u in Room.query.get(room_id).users}
        if current_user.user_id in room_user_ids:
            return function(room_id)
        abort(403, description="You have to be a room member "
                               "to fetch the members list")

    return wrapper


@login.user_loader
def load_user(id_: uuid.UUID = uuid.uuid4()):
    return User.query.get(id_)


@socketio.on('connected')
def connected(token):
    print('emmited to this point')
    session_id = request.sid
    decoded_data = jwt.decode(token, options={"verify_signature": False})
    user = User.query.filter_by(user_id=decoded_data['userid']).first()

    user_id = decoded_data['userid']
    user_data = {
        'user_id': user_id,
        'email': decoded_data['email'],
        'username': decoded_data['name'],
        'session_id': session_id
    }

    if not bool(user):
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()

    current_user.session_id = session_id
    user.session_id = session_id
    db.session.commit()

    login_user(user)
    print(f'USER = {current_user}')

    emit('user:connected', {
        'user': user_data,
        'chats': get_chats(user_id)
    }, to=session_id)


def set_null_session():
    current_user.session_id = None


@app.route('/destroy-session', methods=['PATCH'])
def destroy_session():
    set_null_session()
    db.session.commit()
    return {'success': True}


@socketio.on('incoming-msg')
def on_message(data):
    print("MESSAGE DATA = ", data)
    response = {}
    msg = data['msg']
    user_id = data['user_id']
    room_id = data['room']
    reply_to_id = data['reply_to_id']
    # Set timestamp
    sent_ts = datetime.datetime.utcnow()
    new_message = save_message(user_id, room_id, sent_ts, msg, reply_to_id)
    room_name = Room.query.filter(Room.room_id == room_id).first().name
    members = set(
        chain(
            *db.session.query(room_member.c.user_id)
            .filter_by(room_id=room_id)
            .all()
        )
    )
    if reply_to_id:
        replied_message = Messages.query.filter(Messages.message_id == reply_to_id).first()
        response.update({
            'room_id': room_id,
            'user_id': user_id,
            'room_name': room_name,
            'repliedMessage': {
                'room_id': room_id,
                'user_id': user_id,
                **MessageSchema().dump(replied_message)
            },
            **MessageSchema().dump(new_message)
        })
    else:
        response.update({
            'room_id': room_id,
            'user_id': user_id,
            'room_name': room_name,
            **MessageSchema().dump(new_message)
        })
    emit('add_message', response, to=room_name)
    for id_, sid in get_users_sessions(set(map(str, members))):
        emit('MESSAGE:ADD_LAST', response, to=sid)


@socketio.on('join')
def on_join(data):
    """User joins a room"""
    print("JOINING USER TO ROOM", data)
    room_id = data.get('dialog_id', '')
    if room_id:
        room_name, = db.session.query(Room.name).filter(Room.room_id == data['dialog_id']).first()
        print(f'joined to = {room_name}')
        join_room(room_name)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""

    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": {'text': username + " has left the " + room + " room."}}, room=room)


@socketio.on('room-create')
def create_room(data):
    try:
        print(data)
        room_name = data['room_name']
        creator_id = data['creator_id']
        members = {user['user_id'] for user in data['members'] if user['user_id']} | {creator_id}
        room_id = save_room(room_name, creator_id)
        users_sids = get_users_sessions(members)

        for user_id, sid in users_sids:
            print(f"sid = {sid} | room_name = {room_name}")
            add_room_member(room_id, creator_id, user_id)
            if sid:
                try:
                    join_room(sid=sid, room=room_name)
                except:
                    set_null_session()
                    db.session.commit()

        for user_id, sid in users_sids:
            emit('add_chat', {
                'name': room_name,
                'room_id': room_id,
                'creator_id': creator_id,
                'last_message': {},
                'chatMembers': get_room_members(room_id)
            }, to=sid)

    except Exception as e:

        emit('room-create', {'message': e, 'status': 400})


@socketio.on('ROOM:REMOVE_USER')
def remove_user_from_chat(data):
    remove_user_id, room_id, creator_id = data['user_id'], data['room_id'], data['creator_id']
    members_before = set(
        chain(*db.session.query(room_member.c.user_id).filter_by(room_id=room_id).all())
    )
    room_member_id, = (
        db.session.query(room_member.c.id)
        .filter_by(room_id=room_id)
        .filter_by(user_id=remove_user_id)
        .first()
    )
    Messages.query.filter(Messages.room_member_id == room_member_id).delete()
    db.session.query(room_member).filter_by(id=room_member_id).delete()
    db.session.commit()
    room_name = db.session.query(Room).filter_by(room_id=room_id).first().name
    for user_id, sid in get_users_sessions(members_before):
        chats = get_chats(user_id)
        try:
            if str(user_id) != remove_user_id:
                emit('CHATS:UPDATE', {
                    'chats': chats,
                    'clear': False,
                    'room_id': room_id,
                    'removed_user_id': remove_user_id
                }, to=sid)
            else:
                emit('CHATS:UPDATE', {
                    'chats': chats,
                    'clear': True,
                    'room_id': room_id,
                    'room_name': room_name,
                    'removed_user_id': remove_user_id
                }, to=sid)
        except Exception as e:
            print(e)

    members_after = set(
        chain(*db.session.query(room_member.c.user_id).filter_by(room_id=room_id).all())
    )
    if len(members_after) == 0:
        remove_room(room_id)

    print("REMOVE USER DATA = ", data)


@socketio.on('ROOM:ADD_USER')
def add_user_to_chat(data_list):
    for data in data_list:
        user_id, room_id, creator_id = data['user_id'], data['room_id'], data['creator_id']
        add_room_member(room_id, creator_id, user_id)
        room_name = db.session.query(Room).filter_by(room_id=room_id).first().name
        members = set(chain(*db.session.query(room_member.c.user_id).filter_by(room_id=room_id).all()))
        for user_id, sid in get_users_sessions(members):
            chats = get_chats(user_id)
            try:
                if str(user_id) == creator_id:
                    emit('CHATS:UPDATE', {'chats': chats, 'room_id': room_id}, to=sid)
                else:
                    emit('CHATS:UPDATE', {
                        'chats': chats,
                        'room_id': room_id,
                        'room_name': room_name,
                        'is_added': True
                    }, to=sid)
            except Exception as e:
                print(e)


@app.route('/get-user')
def get_user():
    user_name = request.args.get('name', '')
    user = User.query.filter(User.username.like(f'%{user_name}%')).all()
    if bool(user):
        return jsonify(UserSchema().dump(user, many=True))

    return jsonify({'users': []})


@app.route('/rooms/<room_id>/messages')
# @room_member_checker
def room_messages(room_id):
    room_member_ids = (
        rm.id for rm in
        get_room_members_by_room_id(room_id)
    )
    all_msgs = (
        Messages.query
        .filter(Messages.room_member_id.in_(room_member_ids))
        .order_by(Messages.sent_at.asc())
    )

    all_msgs = [
        {
            'user_id': get_uid_by_room_member_id(msg.room_member_id),
            **MessageSchema().dump(msg)
        }
        for msg in all_msgs
    ]

    for message in all_msgs:
        if message['is_reply_to']:
            replied_message = Messages.query.filter(Messages.message_id == message['is_reply_to']).first()
            message['repliedMessage'] = {
                'room_id': room_id,
                'user_id': get_uid_by_room_member_id(message['room_member_id']),
                **MessageSchema().dump(replied_message)
            }

    return jsonify(all_msgs)


@app.route('/rooms/<room_id>/members')
@room_member_checker
def room_members(room_id):
    return jsonify(
        UserSchema().dump(
            Room.query.get(room_id).users, many=True
        )
    )


if __name__ == '__main__':
    logger.info('test')
    socketio.run(app, debug=True)
