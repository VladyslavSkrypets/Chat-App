from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from config import ProductionDataBase


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

config_db = ProductionDataBase
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{config_db.USER}:{config_db.PASSWORD}@localhost:{config_db.PORT}/{config_db.DATABASE}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret-key'

socketio = SocketIO(app)
db = SQLAlchemy(app)



