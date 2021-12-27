// import { Avatar, Button } from '../index';
// import React from 'react';
// import './ChatInfo.scss';
// const ChatInfo = ({
//                       editMode,
//                       email,
//                       name,
//                       photo,
//                       isMe,
//                       // onNameChange,
//                       onAddFile,
//                       changePhoto,
//                       onToggleEdit,
//                   }) => {
//     return (
//         <div className={'chatInfo'}>
//             {isMe ? <Button onClick={onToggleEdit}>Edit</Button> : null}
//             <Avatar user={{ photo, name: name, uuid: email }} />
//             {editMode ? (
//                 <div className={'fileUpload'}>
//                     <label htmlFor="file">Choose images to upload (PNG, JPG)</label>
//                     <input
//                         type="file"
//                         id={'file'}
//                         onChange={({ target }) => onAddFile(target.files)}
//                     />
//                     <Button onClick={changePhoto}>Submit</Button>
//                 </div>
//             ) : null}
//             {editMode ? (
//               <>
//                 <label htmlFor="chatName">Input new member email:</label>
//                 <input
//                   id={'chatName'}
//                   onChange={({ target }) => onNameChange(target.value)}
//                   value={chatName}
//                 />
//               </>
//             ) : (
//             <div className={'name'}>{name}</div>
//             )}
//
//             ))}
//
//
//         </div>
//     );
// };
// export default ChatInfo;
