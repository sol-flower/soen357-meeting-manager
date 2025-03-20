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
                availabilities: [],
                groupName: 'Untitled Group'
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
            <div
                style={{
                    background: 'linear-gradient(to right, rgb(255, 200, 221), rgb(247, 118, 178))',
                    width: '100%',
                    paddingTop: '50px', 
                    paddingBottom: '50px', 
                }}
            >
                <div className="font-sans flex flex-col items-center">
                    <Typography
                        variant="h4"
                        className="mb-8"
                        style={{ fontFamily: 'Quicksand, sans-serif', color: 'white' }}
                    >
                        SyncUp: Plan Together, Stay Connected
                    </Typography>
                    <Typography
                        variant="h6"
                        className="mb-16"
                        style={{ fontFamily: 'Quicksand, sans-serif', color: 'white' }}
                    >
                    Planning your next event is one step away, all you need is a group ID. Don't have one ? Create one below !
                    </Typography>

                    <div className="flex space-x-6">
                        <Card className="w-80 p-6 shadow-lg">
                            <CardContent className="flex-grow">
                                <Typography variant="h6" style={{ fontFamily: 'Quicksand, sans-serif' }} gutterBottom>
                                    <b>Received a New Group ID?</b> <br />Join the Group Now!
                                </Typography>
                                <form onSubmit={joinGroup}>
                                    <TextField
                                        label="Enter Group ID"
                                        variant="outlined"
                                        fullWidth
                                        inputRef={groupIDRef}
                                        className="mb-4"
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'gray',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'rgb(255, 150, 199)',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                '&.Mui-focused': {
                                                    color: 'rgb(255, 150, 199)',
                                                },
                                            },
                                        }}
                                        InputProps={{
                                            style: { fontFamily: 'Quicksand, sans-serif' },
                                        }}
                                        InputLabelProps={{
                                            style: { fontFamily: 'Quicksand, sans-serif' },
                                        }}
                                    />
                                    <CardActions>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="custom-button"
                                            style={{ fontFamily: 'Quicksand, sans-serif' }}
                                            color="primary"
                                            fullWidth
                                        >
                                            Join Group
                                        </Button>
                                    </CardActions>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="w-80 p-6 shadow-lg flex flex-col">
                            <CardContent className="flex-grow flex flex-col">
                                <Typography variant="h6" gutterBottom style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                    <b>Create a New Group</b><br />Share the Link and Start Planning
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
                </div>
            </div>

            <div className="font-sans flex flex-col pt-14 ml-8">
                <Typography variant="h4" className="mb-8" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Hello {currentUser.displayName || currentUser.email}, welcome back!
                </Typography>
            </div>
                                        
            <div className="mt-8 mb-4 flex flex-col items-center">
                <Typography variant="h5" className="mb-30" style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 'bold',
                    color: '#333',
                    borderRadius: '8px',
                    display: 'inline-block',
                }}>
                    My Groups
                </Typography>
                
            </div>
            <div>
                <EventCarousel />
            </div>
        </>
    );
}