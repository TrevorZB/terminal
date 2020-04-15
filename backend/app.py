from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from sqlalchemy.dialects import postgresql

import os, requests

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

class Command(db.Model):
    __tablename__ = 'Command'
    name = db.Column(db.String(20), primary_key=True)
    description = db.Column(postgresql.ARRAY(db.String(100)))
    server = db.Column(postgresql.BOOLEAN())
    access = db.Column(db.Integer)
    args = db.Column(postgresql.ARRAY(db.String(100)))

    def __init__(self, name, description, server, access, args):
        self.name = name
        self.description = description
        self.server = server
        self.access = access
        self.args = args
    
    def serialize(self):
        return {
            'name': self.name,
            'description': self.description,
            'server': self.server,
            'access': self.access,
            'args': self.args
        }

class Project(db.Model):
    __tablename__ = 'Project'
    name = db.Column(db.String(50), primary_key=True)
    description = db.Column(db.String(200))
    url = db.Column(db.String(200))
    host = db.Column(db.String(200))

    def __init__(self, name, description, url, host):
        self.name = name
        self.description = description
        self.url = url
        self.host = host

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

@app.route('/api/commands')
def commands():
    if request.method == 'GET':
        result = Command.query.all()
        commands = [c.serialize() for c in result]
        return jsonify(commands)

@app.route('/api/projects', methods=['POST'])
def projects():
    resp = {
        'valid_args': True,
        'valid_credentials': True,
        'outputs': []
    }
    if request.method == 'POST':
        data = request.get_json()
        if data['args']:
            valid_args = ['-u']
            for arg in data['args']:
                if arg not in valid_args:
                    resp['valid_args'] = False
                    return jsonify(resp)
            for arg in data['args']:
                if arg == '-u':
                    if data['credentials']['accessLevel'] < 1:
                        updateProjects(resp['outputs'])
                    else:
                        resp['valid_credentials'] = False
                        return jsonify(resp)
        else:
            all_db_projects = Project.query.all()
            for p in all_db_projects:
                resp['outputs'].append('')
                resp['outputs'].append('name: {0}'.format(p.name))
                resp['outputs'].append('  function: {0}'.format(p.description))
                resp['outputs'].append('  github repo: {0}'.format(p.url))
                if p.host:
                    resp['outputs'].append('  hosted at: {0}'.format(p.host))
            print('Returning all projects in the database')
        return jsonify(resp)

def updateProjects(outputs):
    r = requests.get('https://api.github.com/users/TrevorZB/repos', auth=('TrevorZB', '')).json()
    projects = [{'name': p['name'], 'description': p['description'], 'url': '{0}/{1}'.format('https://github.com/TrevorZB', p['name'])} for p in r if 'name' in p and 'description' in p]
    for p in projects:
        outputs.append('checking project: {0}'.format(p['name']))
        db_project = Project.query.filter(Project.name == p['name']).first()
        if db_project:
            if db_project.description != p['description']:
                outputs.append('project {0} has outdated description: updating...'.format(p['name']))
                print('Changing description of project {0} to {1}'.format(p, p['description']))
                db_project.description = p['description']
            if db_project.url != p['url']:
                outputs.append('project {0} has outdated url: updating...'.format(p['url']))
                print('Changing url of project {0} to {1}'.format(p, p['url']))
                db_project.url = p['url']
            outputs.append('project {0} is up to date'.format(p['name']))
            db.session.commit()
            
        else:
            outputs.append('project {0} not present in database: adding to database...'.format(p['name']))
            # no match found, need to add to db
            print("Adding {0} {1} {2} to the Project table".format(p['name'], p['description'], p['url']))
            proj = Project(p['name'], p['description'], p['url'])
            db.session.add(proj)
            db.session.commit()

if __name__ == '__main__':
    app.run()
