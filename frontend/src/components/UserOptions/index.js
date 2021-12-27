import React from 'react';
import './UserOptions.scss';
const UserOptions = ({ users, onSelectUser }) => {
  return (
    <>
      {users.length
        ? users.map((us) => (
            <div className={'userOption'} key={us.email}>
              <div>{us.name} </div>
              <div>
                <input
                  type={'checkbox'}
                  checked={us.checked}
                  onChange={() => onSelectUser(us)}
                />
              </div>
            </div>
          ))
        : null}
    </>
  );
};

export default UserOptions;
