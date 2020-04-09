from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

import os

app = Flask(__name__)
CORS(app)

app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:IsttyPwbH@localhost/Terminal"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(16)

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True)
    password = db.Column(db.String(20))
    email = db.Column(db.String(50))
    access_level = db.Column(db.Integer)

    def __init__(self, id, username, password, email, access_level):
        self.id = id
        self.username = username
        self.password = password
        self.email = email
        self.access_level = access_level

@app.route('/api/users', methods=['POST'])
#@cross_origin(origin='localhost',headers=['Content- Type','Authorization'])
def users():
    if request.method == 'POST':
        auth_status = request.get_json()
        result = User.query.filter((User.username == auth_status['username']) & (User.password == auth_status['password'])).first()
        auth_status['password'] = ''
        if result:
            auth_status['loggedIn'] = True
            auth_status['accessLevel'] = result.access_level
        else:
            auth_status['username'] = ''
        return jsonify(auth_status)


if __name__ == '__main__':
    app.run()
