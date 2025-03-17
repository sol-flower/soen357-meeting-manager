import React from 'react';
import {firestore } from '../firebase';
import { collection, addDoc } from "@firebase/firestore";

export default function Home() {
    const messageRef = React.useRef();
    const ref = collection(firestore, 'messages');

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
        <form onSubmit={handleSave}>
            <label> Enter message: </label>
            <input type="text" ref={messageRef} />
            <button type="submit"> Save </button>
        </form>
    </div>
  );
}
