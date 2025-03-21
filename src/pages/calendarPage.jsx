import React from 'react';
import { useParams } from 'react-router-dom';
import EventCalendar from "../components/calendar";
import { auth } from '../firebase/firebase';

export default function CalendarPage() {
    const { groupID } = useParams();
    const currentUserID = auth.currentUser.uid;

    console.log("id", groupID);
    return (
        <div>
            <EventCalendar groupID={groupID} currentUserID={currentUserID} />
        </div>
    );
}
