import React from 'react';
import { generateAvatarFromHash } from '../../utils/helpers';
import './Avatar.scss';

const Avatar = ({ user }) => {
  console.log('USER = ', user['name'])
  const { color, colorLighten } = generateAvatarFromHash('22222222-2222-2222-2222-222222222222');
    const firstChar = user.name ? user.name[0].toUpperCase() : ' '
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
