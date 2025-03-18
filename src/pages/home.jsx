import React, { useRef } from 'react';
import { firestore, auth } from '../firebase/firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { useAuth } from '../contexts/authContext';
import { Card, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    let navigate = useNavigate();
    const groupIDRef = useRef();
    const { currentUser } = useAuth();

    // Join an existing group
    const joinGroup = async (event) => {
        event.preventDefault();
        const groupID = groupIDRef.current.value.trim();

        if (!groupID) {
            alert("Please enter a Group ID.");
            return;
        }

        const userID = auth.currentUser.uid;
        const groupRef = doc(firestore, "groups", groupID);
      
        try {
            await updateDoc(groupRef, {
                members: arrayUnion(userID),
            });
            alert(`Joined group ${groupID} successfully!`);
            navigate(`/calendar/${groupID}`);
        } catch (error) {
            console.error("Error joining group:", error);
            alert("Group not found or could not be joined.");
        }
    };

    // Create a new group
    const createGroup = async () => {
        const groupID = uuidv4().split('-')[0];
        const groupRef = doc(firestore, "groups", groupID);
        const userID = auth.currentUser.uid;

        try {
            await setDoc(groupRef, {
                id: groupID,
                members: [userID],
                availabilities: []
            });
            alert(`Group created! Your Group ID is: ${groupID}`);
            navigate(`/calendar/${groupID}`);
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group.");
        }
    };

    return (
        <div>
            <div className='text-2xl font-bold pt-14'>
                Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, welcome back.
            </div>

            <div className='flex flex-row '>
                <Card>
                    <p>Received a Group ID? Join the Group Now!</p>
                    <form onSubmit={joinGroup}>
                        <label>Enter Group ID:</label>
                        <input type="text" ref={groupIDRef} required />
                        <Button type="submit" variant="contained">Join Group</Button>
                    </form>
                </Card>

                <Card>
                    <p>Or Create a New Group:</p>
                    <Button onClick={createGroup} variant="outlined" color="primary">
                        Create Group
                    </Button>
                </Card>
            </div>
        </div>
    );
}
