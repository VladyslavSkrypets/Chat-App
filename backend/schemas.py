from marshmallow import Schema, fields


class UserSchema(Schema):
    user_id = fields.Str()
    username = fields.Str()
    email = fields.Str()
