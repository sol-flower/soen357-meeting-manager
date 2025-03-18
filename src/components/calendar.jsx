import React from 'react';
import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

const localizer = momentLocalizer(moment);

const EventCalendar = ({groupID}) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log("id", groupID);
    useEffect(() => {
        const fetchEvents = async () => {
            const groupRef = doc(firestore, 'groups', groupID);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                const data = groupSnap.data();
                setEvents(data.availabilities || []);
            } else {
                alert("Group not found!");
            }
            setLoading(false);
        };

        fetchEvents();
    }, [groupID]);

    const handleSelectSlot = async ({ start, end }) => {
        const newEvent = {
            start,
            end,
            title: "Available Slot"
        };

        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);

        const groupRef = doc(firestore, 'groups', groupID);
        try {
            await updateDoc(groupRef, { availabilities: updatedEvents });
            alert("Availability saved!");
        } catch (error) {
            console.error("Error updating availability:", error);
            alert("Failed to save availability.");
        }
    };

    if (loading) return <p>Loading calendar...</p>;

    return (
        <div style={{ height: '600px', margin: '50px' }}>
            <h2>Calendar for Group: {groupID}</h2>
            <Calendar
                localizer={localizer}
                events={events}
                selectable
                onSelectSlot={handleSelectSlot}
                defaultView="week"
                views={['month', 'week', 'day']}
                step={30}
                showMultiDayTimes
                style={{ height: 500 }}
            />
        </div>
    );
}

export default EventCalendar;