import React from 'react';
import { useParams } from 'react-router-dom';
import EventCalendar from "../components/calendar";

export default function CalendarPage() {
    const { groupID } = useParams();
    console.log("id", groupID);
    return (
        <div>
            <EventCalendar groupID={groupID} />
        </div>
    );
}