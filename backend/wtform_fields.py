from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo, ValidationError
from models import User
from passlib.hash import pbkdf2_sha256


def invalid_credentials(form, field):
    """
    Username and password checker
    """

    username_entered = form.username.data
    password_entered = field.data

    user_obj = User.query.filter_by(username=username_entered).first()
    if user_obj is None or \
            not pbkdf2_sha256.verify(password_entered, user_obj.password):
        raise ValidationError('Username or password is incorrect')


class RegistrationForm(FlaskForm):
    """
    Sign-up form
    """

    username = StringField(
        'username_label',
        validators=[
            InputRequired(message='Username required'),
            Length(min=4, max=25,
                   message='Username must be between 4 and 25 characters')
        ]
    )
    password = PasswordField(
        'password_label',
        validators=[
            InputRequired(message='Password required'),
            Length(min=4, max=25,
                   message='Password must be between 4 and 25 characters')
        ]
    )
    confirm_pswd = PasswordField(
        'confirm_pswd_label',
        validators=[
            InputRequired(message='Password confirmation required'),
            EqualTo('password', message='Passwords must match')
        ]
    )
    submit_button = SubmitField('Create')

    def validate_username(self, username):
        user_obj = User.query.filter_by(username=username.data).first()
        if user_obj is not None:
            raise ValidationError('Username already exists!')


class LoginForm(FlaskForm):
    """
    Login form
    """

    username = StringField(
        'username_label',
        validators=[InputRequired(message='Username required')]
    )
    password = PasswordField(
        'password_label',
        validators=[
            InputRequired(message='Password required'),
            invalid_credentials
        ]
    )
    submit_button = SubmitField('Login')
