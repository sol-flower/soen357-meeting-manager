import React from 'react';
import {firestore } from '../firebase/firebase';
import { collection, addDoc } from "@firebase/firestore";
import { useAuth } from '../contexts/authContext';

export default function Home() {
    const messageRef = React.useRef();
    const ref = collection(firestore, 'messages');
    const { currentUser } = useAuth();

    const handleSave = async (e) => {
        e.preventDefault();
        console.log(messageRef.current.value);

        let data = {
            message: messageRef.current.value
        };
        console.log(data);

        try {
            await addDoc(ref, data);
        } catch (e) {
            console.log(e);
        } 
    }; 

  return (
    <div>
        <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
        <form onSubmit={handleSave}>
            <label> Enter message: </label>
            <input type="text" ref={messageRef} />
            <button type="submit"> Save </button>
        </form>
    </div>
  );
}
