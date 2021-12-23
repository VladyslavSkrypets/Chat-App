import time
import datetime
import logging
import os

from flask import request, make_response, abort, jsonify, Response, render_template, redirect, url_for
from __init__ import app, socketio, login
from wtform_fields import *
from models import *
from schemas import UserSchema, MessageSchema
from passlib.hash import pbkdf2_sha256
from flask_login import login_user, current_user, login_required, logout_user
from flask_socketio import send, emit, join_room, leave_room
from db_functions import *
from functools import wraps


ROOMS = ['loung', 'news', 'games', 'coding']

LOGS_DIR = os.path.join(os.path.dirname(__file__), 'logs')

if not os.path.isdir(LOGS_DIR):
    os.mkdir(LOGS_DIR)

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s\t:  %(message)s',
    datefmt='%d.%m.%Y-%H:%M:%S'
)

logger = logging.getLogger()

"""
    SOCKETS on frontend:
        - message (from back we return message about action 
            (For example, 'user_name' deleted, 'user_name' was added, new message was send, room name was changed etc.))
        - message-delete
    SOCKETS on backend: 
        - incoming-msg (send message)
        - reply-msg (reply message)
        - delete-msg (delete message)
        - join (join to room)
        - leave (leave room)
        - room-create
        - room-edit
        - room-delete 
    ENDPOINTS: 
        - /rooms/list (implement logic that allows to list chats (ids, names, img_urls etc) ) 
        - /rooms/<room_id>/messages (get rooms messages)
        - ? (do not sure) /rooms/<room_id>/members (list of users in room)
"""


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
        room_user_ids = {u.user_id for u in Room.query.get(room_id).users.all()}
        if current_user.user_id in room_user_ids:
            return function(room_id)
        abort(403, description="You have to be a room member "
                               "to fetch the members list")
    return wrapper


@login.user_loader
def load_user(id_: uuid.UUID = uuid.uuid4()):
    return User.query.get(id_)


@app.route('/', methods=['GET', 'POST'])
def index():
    reg_form = RegistrationForm()
    if reg_form.validate_on_submit():
        username = reg_form.username.data
        password = reg_form.password.data

        hashed_pswd = pbkdf2_sha256.hash(password)

        user = User(username=username, password=hashed_pswd)
        db.session.add(user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('index.html', form=reg_form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    login_form = LoginForm()

    if login_form.validate_on_submit():
        user_obj = \
            User.query.filter_by(username=login_form.username.data).first()
        login_user(user_obj)
        return redirect(url_for('chat'))

    return render_template('login.html', form=login_form)


@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))

    return render_template(
        "chat.html", username=current_user.username,
        rooms=get_current_user_rooms(current_user.user_id)
    )


@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect(url_for('login'))


@socketio.on('incoming-msg')
def on_message(data):
    """Broadcast messages"""
    # {"msg": "test_reply", "username": "user1", "user_id": "4156d5b2-8e97-4b61-8e35-6f3814dacc80", "room": "coding", "reply_to_id": "19c81bd7-f8cc-49f2-b8fd-d73d2fc1c3c5"}
    # TODO: save message in database
    # TODO: (see save_message() function in db_functions.py

    msg = data['msg']
    username = data['username']
    ######
    # TODO: receive from the client side
    # user_id = data['user_id']
    user_id = User.query.filter_by(username=username).first().user_id
    ######

    room = data['room'].lower()

    reply_to_id = data.get('reply_to_id')
    # Set timestamp
    sent_ts = datetime.datetime.utcnow()
    time_stamp = datetime.datetime.strftime(sent_ts, '%b-%d %I:%M%p')
    msg_id = save_message(user_id, room, sent_ts, msg, reply_to_id)

    # try:
    send({'username': username, 'msg': {'text': msg, 'id': msg_id},
          'time': time_stamp}, room=room)

    # except Exception as e:
    #     logger.error(f'Failed to send a message {msg_id}\n{e}')
    #     delete_message(msg_id)


@socketio.on('join')
def on_join(data):
    """User joins a room"""

    username = data["username"]
    room = data["room"]
    join_room(room)

    # Broadcast that new user has joined
    send({"msg": username + " has joined the " + room + " room."}, room=room)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""

    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": username + " has left the room"}, room=room)


@app.route('/rooms/list')
def list_rooms():
    # TODO: implement logic that allows to list chats
    # TODO: (ids, names, img_urls etc)
    pass


a = {
    'room_name': 'test_room',
    'members': [{'user_id': "9082e49a-9850-457d-a47d-101d39191d8e"}, {'user_id': "c0b90118-ae8e-4960-883d-e83de9619a25"}]
}
# @login_required

@socketio.on('room-create')
def create_room(data):

    # TODO: notify all members (except admin) that they were added
    try:
        print(data)
        room_name = data['room_name']
        creator_id = current_user.user_id
        members = {user['user_id'] for user in data['members']} | \
                  {current_user.user_id}

        room_id = save_room(room_name, creator_id)
        add_room_members(room_id, creator_id, members)

        emit('room-created', {'message': 'Room created', 'status': 201})
    except Exception as e:
        print(e)
        emit('room-created', {'message': e, 'status': 400})


@app.route('/get-user')
def get_user():
    user_email = request.args.get('user_email', '')
    user = User.query.filter_by(User.email.like(f'%{user_email}%')).first()
    if bool(user):
        return jsonify({'user': UserSchema().dump(user)}), 200

    return jsonify({'user': {}}), 404


b = {"room_name": "test2", "room_id": 1, "members": [{}]}


@socketio.on('room-edit')
@room_admin_checker
def edit_room(data):
    room_id = data['room_id']
    room = Room.query.filter_by(room_id=room_id).first()
    if room is None:
        emit('room-edited', {'message': 'Room is not found', 'status': 401})

    else:
        room.name = data['room_name']
        db.session.query(room_member).filter_by(room_id=room_id).delete()
        db.session.commit()

        members = {user['user_id'] for user in data['members']} | \
                  {current_user.user_id}
        add_room_members(room_id, room.creator_id, members)

        emit('room-edited', {'message': 'Room edited', 'status': 200})


@app.route('/rooms/<room_id>')
# @login_required
def view_room(room_id):
    pass


@socketio.on('room-delete')
@room_admin_checker
def delete_room(room_id):
    remove_room(room_id)
    # TODO: update this room members' chats list
    pass


@app.route('/rooms/<room_id>/messages')
@room_member_checker
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
        .order_by(Messages.send_at.desc())
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
    user_ids = (
        rm.user_id for rm in
        get_room_members_by_room_id(room_id)
    )
    all_members = User.query.filter(User.user_id.in_(user_ids))
    return jsonify(UserSchema().dump(all_members, many=True))


if __name__ == '__main__':
    logger.info('test')
    socketio.run(app, debug=True)
