import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebase';
import { Typography, Button, TextField, Modal, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const localizer = momentLocalizer(moment);

const EventCalendar = ({ groupID, currentUserID, isGroupView }) => {
    const [events, setEvents] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [timeIncrement, setTimeIncrement] = useState(30);
    const [totalUsers, setTotalUsers] = useState(1);
    const timeslots = 60 / timeIncrement;

    useEffect(() => {
        const fetchEvents = async () => {
            const groupRef = doc(firestore, 'groups', groupID);
            const groupSnap = await getDoc(groupRef);

            if (!groupSnap.exists()) {
                alert("Group not found!");
                setLoading(false);
                return;
            }

            const data = groupSnap.data();
            setName(data.groupName || '');

            const members = data.members || {};

            if (isGroupView) {
                if (isGroupView) {
  const availabilityMap = new Map();
  const bucketDuration = timeIncrement * 60 * 1000; // in ms

  Object.values(members).forEach(member => {
    if (Array.isArray(member.availabilities)) {
      member.availabilities.forEach(slot => {
        const start = slot.start.toDate().getTime();
        const end = slot.end.toDate().getTime();
        for (let t = start; t < end; t += bucketDuration) {
          const key = new Date(t).toISOString();
          availabilityMap.set(key, (availabilityMap.get(key) || 0) + 1);
        }
      });
    }
  });

  const totalMembers = Object.keys(members).length;
  const commonBuckets = [...availabilityMap.entries()]
    .filter(([_, count]) => count === totalMembers)
    .map(([time]) => new Date(time));

  // Convert these buckets back into merged blocks
  const sortedTimes = commonBuckets.sort((a, b) => a - b);
  const merged = [];
  let start = null;

  for (let i = 0; i < sortedTimes.length; i++) {
    if (!start) start = sortedTimes[i];
    const next = sortedTimes[i + 1];
    if (!next || next - sortedTimes[i] > bucketDuration) {
      merged.push({ start, end: new Date(sortedTimes[i].getTime() + bucketDuration), title: "Everyone Available" });
      start = null;
    }
  }

  setEvents(merged);
}

            } else {
                const currentUser = members[currentUserID];
                const fetchedEvents = currentUser?.availabilities || [];
                const formattedEvents = fetchedEvents.map(event => ({
                    ...event,
                    start: event.start.toDate(),
                    end: event.end.toDate(),
                    title: "Available Slot"
                }));
                setEvents(formattedEvents);
            }

            setLoading(false);
        };

        fetchEvents();
    }, [groupID, currentUserID, isGroupView, timeIncrement]);

    const handleOpenModal = () => {
        setNewGroupName(name);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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

    const handleSelectSlot = async ({ start, end }) => {
        if (isGroupView) return;

        if (!currentUserID || currentUserID !== auth.currentUser.uid) {
            console.error("Current User ID is undefined.");
            alert("User not authenticated. Please log in.");
            return;
        }

        const newEvent = { start, end, title: "Available Slot" };
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, {
                [`members.${currentUserID}.availabilities`]: updatedEvents.map(event => ({
                    start: event.start,
                    end: event.end,
                })),
            });
        } catch (error) {
            console.error("Error updating availability:", error);
            alert("Failed to save availability.");
        }
    };

    const handleRemoveSlot = async (eventToRemove, e) => {
        if (isGroupView) return;

        const updatedEvents = events.filter((event) => event.start !== eventToRemove.start || event.end !== eventToRemove.end);
        setEvents(updatedEvents);

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, {
                [`members.${currentUserID}.availabilities`]: updatedEvents.map(event => ({
                    start: event.start,
                    end: event.end,
                })),
            });
        } catch (error) {
            console.error("Error removing availability:", error);
            alert("Failed to remove availability.");
        }
    };

    if (loading) return <p>Loading calendar...</p>;

    return (
        <div className='h-600 m-16'>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Typography variant="h4" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold', color: '#333', borderRadius: '8px', display: 'inline-block', marginRight: '8px' }}>
                    Calendar for Group: {name}
                </Typography>
                <Button onClick={handleOpenModal} style={{ opacity: 0.7, color: '#333', fontFamily: 'Quicksand, sans-serif' }} startIcon={<EditIcon />}>
                    Edit
                </Button>
            </div>

            <Typography variant="h5" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold', color: '#333', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
                Group ID: {groupID}
            </Typography>

            <div style={{ marginBottom: '16px', width: '200px' }}>
                <FormControl variant="outlined" fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray' }, '&.Mui-focused fieldset': { borderColor: 'rgb(255, 150, 199)' } }, '& .MuiInputLabel-root': { '&.Mui-focused': { color: 'rgb(255, 150, 199)' } } }}>
                    <InputLabel style={{ fontFamily: 'Quicksand, sans-serif' }}>Time Increment</InputLabel>
                    <Select value={timeIncrement} onChange={(e) => setTimeIncrement(e.target.value)} label="Time Increment" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        <MenuItem value={15}>15 minutes</MenuItem>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={60}>60 minutes</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                selectable={!isGroupView}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleRemoveSlot}
                defaultView="week"
                min={new Date(2025, 2, 19, 8, 0)}
                max={new Date(2025, 2, 19, 23, 0)}
                views={['month', 'week', 'day']}
                step={timeIncrement}
                timeslots={timeslots}
                showMultiDayTimes
                style={{ height: timeIncrement === 15 ? 1000 : 800 }}
                eventPropGetter={(event) => {
                    if (!isGroupView) return {};
                    const opacity = Math.min(0.2 + (event.count / totalUsers), 1);
                    return {
                        style: {
                            backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                            border: 'none',
                            color: '#fff'
                        }
                    };
                }}
            />

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px', fontFamily: 'Quicksand, sans-serif' }}>
                    <Typography variant="h6" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold', marginBottom: '16px' }}>
                        Edit Group Name
                    </Typography>
                    <TextField
                        fullWidth
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        label="Group Name"
                        variant="outlined"
                        style={{ marginBottom: '16px' }}
                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray' }, '&.Mui-focused fieldset': { borderColor: 'rgb(255, 150, 199)' } }, '& .MuiInputLabel-root': { '&.Mui-focused': { color: 'rgb(255, 150, 199)' } }, fontFamily: 'Quicksand, sans-serif' }}
                    />
                    <Button onClick={handleSaveGroupName} variant="contained" className='custom-button' style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Save
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default EventCalendar;
