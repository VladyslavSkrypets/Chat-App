import os
import jwt
import logging
from flask import request, abort, jsonify
from __init__ import app, socketio, login
from schemas import *
from flask_login import login_user, current_user, login_required, logout_user
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

#
# @socketio.on('disconnect')
# def disconnect():
#     current_user.session_id = None
#     db.session.commit()


def set_null_session():
    current_user.session_id = None


@app.route('/destroy-session', methods=['PATCH'])
def destroy_session():
    set_null_session()
    db.session.commit()
    return {'success': True}


@socketio.on('incoming-msg')
def on_message(data):

    msg = data['msg']
    username = data['username']
    room_id = data['room']
    print(data)
    user = User.query.filter_by(username=username).first()
    reply_to_id = data['reply_to_id']
    # Set timestamp
    sent_ts = datetime.datetime.utcnow()
    time_stamp = datetime.datetime.strftime(sent_ts, '%b-%d %I:%M%p')
    msg_id = save_message(user.user_id, room_id, sent_ts, msg, reply_to_id)

    room_name = Room.query.filter(Room.room_id == room_id).first().name

    emit('add_message', {
        'username': username,
        'msg': {
            'text': msg,
            'id': str(msg_id)
        },
        'time': time_stamp,
        'room': room_name
    }, sid=room_name)


@socketio.on('join')
def on_join(data):
    """User joins a room"""

    room_name = db.session.query(Room.name).filter(Room.room_id == data['dialog_id'])
    join_room(room_name)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""

    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": {'text':  username + " has left the " + room + " room."}}, room=room)


@app.route('/rooms/list')
def list_rooms():
    # TODO: implement logic that allows to list chats
    # TODO: (ids, names, img_urls etc)
    pass


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
                    """emit to front all users data (user_id, name, email)"""
                except Exception as e:
                    set_null_session()
                    db.session.commit()

        for user_id, sid in users_sids:
            emit('add_chat', {
                'name': room_name,
                'room_id': room_id,
                'creator_id': creator_id,
                'chatMembers': get_room_members(room_id)
            }, to=sid)

    except Exception as e:

        emit('room-create', {'message': e, 'status': 400})


@app.route('/get-user')
def get_user():
    user_name = request.args.get('name', '')
    user = User.query.filter(User.username.like(f'%{user_name}%')).all()
    if bool(user):
        return jsonify(UserSchema().dump(user, many=True))

    return jsonify({'users': []})


@socketio.on('room-edit')
# @room_admin_checker
def edit_room(data):
    room_name = data['room_name']
    creator_id = current_user.user_id

    room = Room.query.filter_by(name=room_name).first()
    room_id = room.room_id

    old_room_name, new_room_name = room.name, data['room_name']

    if new_room_name != old_room_name:
        room.name = new_room_name
        db.session.commit()

    new_members = {user['user_id'] for user in data['members'] if user['user_id']} | {str(creator_id)}

    old_members = set(
        map(
            str, chain(*db.session.query(room_member.c.user_id).filter_by(room_id=room_id).all())
        )
    )

    add_members = [('add', *data) for data in get_users_sessions(new_members - old_members)]
    remove_members = [('remove', *data) for data in get_users_sessions(old_members - new_members)]
    not_changed_members = [('skip', *data) for data in get_users_sessions(new_members & old_members)]

    for action_type, user_id, sid in add_members + remove_members + not_changed_members:
        if action_type == 'add':
            add_room_member(room_id, creator_id, user_id)
            if sid:
                try:
                    join_room(sid=sid, room=new_room_name)
                    emit('room-created', {'message': f'You {sid} have been added to the chat', 'status': 201}, to=sid)
                except Exception as e:
                    print(e)
                    set_null_session()
                    db.session.commit()

        elif action_type == 'remove':
            room_members = db.session.query(room_member.c.id).filter_by(user_id=user_id)
            room_messages = (
                db.session.query(Messages)
                .filter(Messages.room_member_id.in_(chain(*room_members.all())))
            )
            room_messages.delete()
            (
                db.session.query(room_member)
                .filter(room_member.c.user_id == user_id)
                .filter(room_member.c.room_id == room_id).delete()
            )
            db.session.commit()
            if sid:
                try:
                    leave_room(sid=sid, room=old_room_name)
                    emit('room-created', {'message': f'You {sid} have been deleted to the chat', 'status': 201}, to=sid)
                except Exception as e:
                    print(e)
                    set_null_session()
                    db.session.commit()

        else:
            print('hit skip')
            leave_room(sid=sid, room=old_room_name)
            join_room(sid=sid, room=new_room_name)
            emit('user_re_joined', {'new_room': new_room_name}, to=sid)


@socketio.on('room-delete')
@room_admin_checker
def delete_room(room_id):
    remove_room(room_id)
    emit('remove_chat', {'room_id': room_id})


@app.route('/rooms/<room_id>/messages')
# @room_member_checker
def room_messages(room_id):
    limit = request.args.get('limit', 100)
    offset = request.args.get('offset', 0)

    room_member_ids = (
        rm.id for rm in
        get_room_members_by_room_id(room_id)
    )
    all_msgs = (
        Messages.query
        .filter(Messages.room_member_id.in_(room_member_ids))
        .order_by(Messages.sent_at.desc())
        .limit(limit)
        .offset(offset)
    )

    return jsonify([
        {
            'user_id': get_uid_by_room_member_id(msg.room_member_id),
            **MessageSchema().dump(msg)
        }
        for msg in all_msgs
    ])


@app.route('/rooms/<room_id>/members')
@room_member_checker
def room_members(room_id):
    return jsonify(
        UserSchema().dump(
            Room.query.get(room_id).users, many=True
        )
    )


@socketio.on('get-chats')
def get_user_chats():
    print('USER IN GETTING CHATS', current_user)
    chats = get_chats(current_user.user_id)
    emit('user:chats', {'chats': chats})


@app.route('/curr_user')
def curr_user():
    return current_user.username


if __name__ == '__main__':
    logger.info('test')
    socketio.run(app, debug=True)
