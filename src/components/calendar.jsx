import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { Typography, Button, TextField, Modal, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const localizer = momentLocalizer(moment);

const EventCalendar = ({ groupID }) => {
    const [events, setEvents] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [timeIncrement, setTimeIncrement] = useState(30);
    const timeslots = 60 / timeIncrement;

    useEffect(() => {
        const fetchEvents = async () => {
            const groupRef = doc(firestore, 'groups', groupID);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                const data = groupSnap.data();
                const fetchedEvents = data.availabilities || [];
                setName(data.groupName || '');

                const formattedEvents = fetchedEvents.map(event => ({
                    ...event,
                    start: event.start.toDate(),
                    end: event.end.toDate(),
                }));

                setEvents(formattedEvents);
            } else {
                alert("Group not found!");
            }
            setLoading(false);
        };

        fetchEvents();
    }, [groupID]);

    // Function to open the name changing modal
    const handleOpenModal = () => {
        setNewGroupName(name);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Function to save the edited group name into Firebase
    const handleSaveGroupName = async () => {
        if (!newGroupName.trim()) {
            alert("Group name cannot be empty!");
            return;
        }

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, { groupName: newGroupName });
            setName(newGroupName);
            setIsModalOpen(false);
            alert("Group name updated successfully!");
        } catch (error) {
            console.error("Error updating group name:", error);
            alert("Failed to update group name.");
        }
    };

    // Function to merge consecutive time slots into one + to avoid overlapping
    const mergeTimeSlots = (slots) => {
        if (slots.length === 0) return [];

        const sortedSlots = slots.sort((a, b) => a.start - b.start);

        const mergedSlots = [];
        let currentSlot = { ...sortedSlots[0] };

        for (let i = 1; i < sortedSlots.length; i++) {
            const nextSlot = sortedSlots[i];

            if (nextSlot.start <= currentSlot.end) {
                currentSlot.end = new Date(Math.max(currentSlot.end, nextSlot.end));
            } else {
                mergedSlots.push(currentSlot);
                currentSlot = { ...nextSlot };
            }
        }

        mergedSlots.push(currentSlot);

        return mergedSlots;
    };

    // Handle select of rbc
    const handleSelectSlot = async ({ start, end }) => {
        const newEvent = {
            start,
            end: new Date(start.getTime() + timeIncrement * 60 * 1000),
            title: "Available Slot"
        };

        const updatedEvents = mergeTimeSlots([...events, newEvent]);
        setEvents(updatedEvents);

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, { availabilities: updatedEvents });
        } catch (error) {
            console.error("Error updating availability:", error);
            alert("Failed to save availability.");
        }
    };

    // Function to delete a slot
    const handleRemoveSlot = async (eventToRemove, e) => {
        const slotHeight = e.target.getBoundingClientRect().height;
        const clickY = e.nativeEvent.offsetY;

        const fractionClicked = clickY / slotHeight;

        const incrementMs = timeIncrement * 60 * 1000;

        let updatedEvent;
        if (slotHeight === 30 || slotHeight === 0) {
            updatedEvent = null;
        } else if (fractionClicked < 0.33) {
            updatedEvent = {
                ...eventToRemove,
                start: new Date(eventToRemove.start.getTime() + incrementMs),
            };
        } else if (fractionClicked > 0.66) {
            updatedEvent = {
                ...eventToRemove,
                end: new Date(eventToRemove.end.getTime() - incrementMs),
            };
        } else {
            updatedEvent = null;
        }

        const updatedEvents = events
            .filter((event) => event.start !== eventToRemove.start || event.end !== eventToRemove.end)
            .concat(updatedEvent ? [updatedEvent] : []);

        setEvents(updatedEvents);

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, { availabilities: updatedEvents });
        } catch (error) {
            console.error("Error removing availability:", error);
            alert("Failed to remove availability.");
        }
    };

    // Loading message for users
    if (loading) return <p>Loading calendar...</p>;

    return (
        <div className='h-600 m-16'>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Typography
                    variant="h4"
                    style={{
                        fontFamily: 'Quicksand, sans-serif',
                        fontWeight: 'bold',
                        color: '#333',
                        borderRadius: '8px',
                        display: 'inline-block',
                        marginRight: '8px',
                    }}
                >
                    Calendar for Group: {name}
                </Typography>
                <Button
                    onClick={handleOpenModal}
                    style={{
                        opacity: 0.7,
                        color: '#333',
                        fontFamily: 'Quicksand, sans-serif',
                    }}
                    startIcon={<EditIcon />}
                >
                    Edit
                </Button>
            </div>

            <Typography
                variant="h5"
                style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 'bold',
                    color: '#333',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '16px',
                }}
            >
                Group ID: {groupID}
            </Typography>

            <div style={{ marginBottom: '16px', width: '200px' }}>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel style={{ fontFamily: 'Quicksand, sans-serif' }}>Time Increment</InputLabel>
                    <Select
                        value={timeIncrement}
                        onChange={(e) => setTimeIncrement(e.target.value)}
                        label="Time Increment"
                        style={{ fontFamily: 'Quicksand, sans-serif' }}
                    >
                        <MenuItem value={15} style={{ fontFamily: 'Quicksand, sans-serif' }}>15 minutes</MenuItem>
                        <MenuItem value={30} style={{ fontFamily: 'Quicksand, sans-serif' }}>30 minutes</MenuItem>
                        <MenuItem value={60} style={{ fontFamily: 'Quicksand, sans-serif' }}>60 minutes</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Calendar component */}
            <Calendar
                localizer={localizer}
                events={events}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleRemoveSlot}
                defaultView="week"
                min={new Date(2025, 2, 19, 8, 0)}
                max={new Date(2025, 2, 19, 23, 0)}
                views={['month', 'week', 'day']}
                step={timeIncrement}
                timeslots={timeslots}
                showMultiDayTimes
                style={{ height: 800 }}
            />

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="edit-group-name-modal"
                aria-describedby="edit-group-name-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                        fontFamily: 'Quicksand, sans-serif',
                    }}
                >
                    <Typography
                        variant="h6"
                        style={{
                            fontFamily: 'Quicksand, sans-serif',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                        }}
                    >
                        Edit Group Name
                    </Typography>
                    <TextField
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        label="Group Name"
                        variant="outlined"
                        style={{ marginBottom: '16px' }}
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
                            fontFamily: 'Quicksand, sans-serif',
                        }}
                    />
                    <Button
                        onClick={handleSaveGroupName}
                        variant="contained"
                        color="primary"
                        style={{
                            fontFamily: 'Quicksand, sans-serif',
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default EventCalendar;