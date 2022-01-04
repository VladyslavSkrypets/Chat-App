import React from 'react';
import { generateAvatarFromHash } from '../../utils/helpers';
import './Avatar.scss';

const Avatar = ({ user }) => {
  console.log("AVATAR USER = ", user);
  if (!user.name && !user.username) {
    user.name = '#'
  }
  const { color, colorLighten } = generateAvatarFromHash(user?.name ? user?.name : user?.username);
    const firstChar = user?.name ? user?.name[0].toUpperCase() : user.username[0].toUpperCase()
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
};

export default Avatar;
