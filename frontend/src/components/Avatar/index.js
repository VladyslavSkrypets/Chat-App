import React from 'react';
import { generateAvatarFromHash } from '../../utils/helpers';
import './Avatar.scss';

const Avatar = ({ user }) => {
  if (user.photo) {
    return (
      <img
        className="avatar"
        src={`http://localhost:3001/api/chats/${user.photo}`}
        alt={`Avatar ${user.name}`}
      />
    );
  } else {
    const { color, colorLighten } = generateAvatarFromHash(user.uuid);
    const firstChar = user.name[0].toUpperCase();
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${colorLighten} 96.52%)`,
        }}
        className="avatar avatar--symbol"
      >
        {firstChar}
      </div>
    );
  }
};

export default Avatar;
