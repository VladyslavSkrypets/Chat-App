import flask
import time
from flask import request, make_response, jsonify, render_template, redirect, url_for
from __init__ import app, socketio, db, login
from wtform_fields import *
from models import *
from passlib.hash import pbkdf2_sha256
from flask_login import login_user, current_user, login_required, logout_user
from flask_socketio import send, emit, join_room, leave_room
from db_functions import *

ROOMS = ['loung', 'news', 'games', 'coding']


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


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


@app.route('/rooms/create', methods=['GET', 'POST'])
# @login_required
def create_room():
    # TODO: notify all members (except admin) that they were added

    if request.method == 'POST':
        room_name = request.form.get('room_name')
        usernames = [username.strip() for username in
                     request.form.get('members').split(',')]

        if room_name is not None and usernames:
            room_id, exists = save_room(room_name, current_user.id)
            if current_user.username in usernames:
                usernames.remove(current_user.username)
            add_room_members(room_id, current_user.id, usernames)

        return 'success'


@app.route('/rooms/<room_id>/edit', methods=['GET', 'PUT'])
# @login_required
def edit_room(room_id):
    # TODO: show modification to all room members
    pass


@app.route('/rooms/<room_id>')
# @login_required
def view_room(room_id):
    pass


@app.route('/rooms/<room_id>/delete', methods=['DELETE'])
# @login_required
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
