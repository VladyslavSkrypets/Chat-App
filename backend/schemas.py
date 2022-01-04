from datetime import datetime
from marshmallow import Schema, fields, post_dump


class UserSchema(Schema):
    user_id = fields.Str()
    email = fields.Str()
    username = fields.Str()
    email = fields.Str()


class MessageSchema(Schema):
    message_id = fields.Str()
    room_member_id = fields.Int()
    message_text = fields.Str()
    sent_at = fields.DateTime()
    is_reply_to = fields.Str()

    @post_dump
    def prettify_date(self, data, **kwargs):
        if data:
            date = datetime.strptime(data['sent_at'], '%Y-%m-%dT%H:%M:%S.%f')
            data['sent_at'] = format(date, '%H:%M %d.%m.%y')

        return data


class RoomSchema(Schema):
    room_id = fields.Int()
    name = fields.Str()
    creator_id = fields.Str()
    chatMembers = fields.List(fields.Dict())
