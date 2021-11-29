from flask import make_response, jsonify
from __init__ import app, socketio


@app.route('/')
def index():
    return make_response(jsonify({'message': 'Hello World'}))


if __name__ == '__main__':
    socketio.run(app, port=5000)
