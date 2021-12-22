import time
from flask import request, make_response, jsonify, render_template, redirect, url_for
from __init__ import app, socketio, login
from wtform_fields import *
from models import *
from schemas import UserSchema
from passlib.hash import pbkdf2_sha256
from flask_login import login_user, current_user, login_required, logout_user
from flask_socketio import send, emit, join_room, leave_room
from db_functions import *

ROOMS = ['loung', 'news', 'games', 'coding']

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

    return render_template("chat.html", username=current_user.username,
                           rooms=ROOMS)


@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect(url_for('login'))


@socketio.on('incoming-msg')
def on_message(data):
    """Broadcast messages"""

    # TODO: save message in database
    # TODO: (see save_message() function in db_functions.py

    msg = data["msg"]
    username = data["username"]
    room = data["room"]
    # Set timestamp
    time_stamp = time.strftime('%b-%d %I:%M%p', time.localtime())
    send({"username": username, "msg": msg, "time": time_stamp}, room=room)


@socketio.on('join')
def on_join(data):
    """User joins a room"""

    # TODO: update rooms members after new user joins

    username = data["username"]
    room = data["room"]
    join_room(room)

    # Broadcast that new user has joined
    send({"msg": username + " has joined the " + room + " room."}, room=room)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""

    # TODO: update rooms members after user leaves

    username = data['username']
    room = data['room']
    leave_room(room)
    send({"msg": username + " has left the room"}, room=room)


@app.route('/rooms/list')
def list_rooms():
    # TODO: implement logic that allows to list chats
    # TODO: (ids, names, img_urls etc)
    pass


# @login_required
@socketio.on('room-create')
def create_room(data):
    # TODO: notify all members (except admin) that they were added
    try:
        room_name = data['room_name']
        creator_id = current_user.id
        members = {user['user_id'] for user in data['members'] if user['user_id'] != creator_id}

        room_id, exists = save_room(room_name, creator_id)
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


@socketio.on('room-edit')
# @login_required
def edit_room(room_id):
    # TODO: show modification to all room members
    pass


@app.route('/rooms/<room_id>')
# @login_required
def view_room(room_id):
    pass


@socketio.on('room-delete')
def delete_room(room_id):
    # TODO: update the db + notify all rooms members
    pass


@app.route('/rooms/<room_id>/messages')
def room_messages(room_id):
    # TODO: logic that lists N room messages (author, text, time_sent etc)
    pass


@app.route('/rooms/<room_id>/members')
def room_members(room_id):
    # TODO: logic that lists room members (username, photo_url)
    pass


if __name__ == '__main__':
    socketio.run(app, debug=True)
