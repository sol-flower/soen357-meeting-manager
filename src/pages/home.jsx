import React, { useRef } from 'react';
import { firestore, auth } from '../firebase/firebase';
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { useAuth } from '../contexts/authContext';
import { Card, Button, TextField, Typography, CardContent, CardActions } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import EventCarousel from '../components/eventCarousel';

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
        <>
        <div className="font-sans flex flex-col items-center pt-14">
            <Typography variant="h4" className="mb-30" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Hello {currentUser.displayName || currentUser.email}, welcome back!
            </Typography>
            <br></br>
            <div className="flex space-x-6">
            <Card className="w-80 p-6 shadow-lg">
                    <CardContent className="flex-grow">
                        <Typography variant="h6" style={{ fontFamily: 'Quicksand, sans-serif' }} gutterBottom>
                            <b>Received a New Group ID?</b> <br></br>Join the Group Now!
                        </Typography>
                        <form onSubmit={joinGroup}>
                            <TextField
                                label="Enter Group ID"
                                variant="outlined"
                                fullWidth
                                inputRef={groupIDRef}
                                className="mb-4"
                                required
                                InputProps={{
                                    style: { fontFamily: 'Quicksand, sans-serif' },
                                  }}
                                  InputLabelProps={{
                                    style: { fontFamily: 'Quicksand, sans-serif' },
                                  }}
                            />
                            <CardActions>
                                <Button type="submit" variant="contained" className="custom-button" style={{ fontFamily: 'Quicksand, sans-serif' }} color="primary" fullWidth>
                                    Join Group
                                </Button>
                            </CardActions>
                        </form>
                    </CardContent>
                </Card>

                <Card className="w-80 p-6 shadow-lg flex flex-col">
                <CardContent className="flex-grow flex flex-col">
                    <Typography variant="h6" gutterBottom style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    <b>Create a New Group</b>
                    </Typography>
                    <div className="mt-auto">
                    <CardActions>
                        <Button 
                        onClick={createGroup} 
                        variant="contained" 
                        color="primary"
                        className="custom-button"
                        style={{ fontFamily: 'Quicksand, sans-serif' }}
                        fullWidth
                        >
                        Create Group
                        </Button>
                    </CardActions>
                    </div>
                </CardContent>
            </Card>
        </div>
    <div className='mt-8 font-sans pt-14'>
        <Typography variant="h5" className="mb-30" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                My Groups
        </Typography>
    <div>
    <EventCarousel /></div>
    </div>
    </div>
    </>
    );
}