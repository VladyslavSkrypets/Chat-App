from marshmallow import Schema, fields


class UserSchema(Schema):
    user_id = fields.Str()
    username = fields.Str()
    email = fields.Str()


class MessageSchema(Schema):
    message_id = fields.Str()
    room_member_id = fields.Integer()
    message_text = fields.Str()
    send_at = fields.DateTime()
    is_reply_to = fields.Str()


class RoomSchema(Schema):
    room_id = fields.Integer()
    name = fields.Str()
    creator_id = fields.Str()