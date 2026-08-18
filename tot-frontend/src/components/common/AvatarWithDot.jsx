import React from 'react';
import './AvatarWithDot.css';
import { formatMediaUrl } from '../../utils/mediaUrl';

export default function AvatarWithDot({ user, onlineIds = new Set(), size = 40 }) {
  const isOnline = onlineIds.has(user?.id);
  const avatarSrc = formatMediaUrl(
    user?.avatar || user?.profile_picture,
    '/assets/images/pf4.png',
  );

  return (
    <div className="avatar-dot-wrapper" style={{ width: size, height: size }}>
      <img
        src={avatarSrc}
        alt={user?.name || 'User'}
        className="avatar-img object-cover"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.currentTarget.src = '/assets/images/pf4.png';
        }}
      />
      <span className={`status-dot ${isOnline ? 'on' : ''}`} />
    </div>
  );
}