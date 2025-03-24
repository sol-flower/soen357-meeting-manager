import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ⬅️ add useNavigate
import EventCalendar from "../components/calendar";
import { auth } from '../firebase/firebase';

export default function CalendarPage() {
    const { groupID } = useParams();
    const currentUserID = auth.currentUser.uid;
    const navigate = useNavigate(); // ⬅️ hook to handle navigation

    const handleShowAvailability = () => {
        console.log("Show everyone's availability clicked!");
        navigate(`/calendar/${groupID}/all`); // ⬅️ redirect on button click
    };

    return (
        <div className="relative min-h-screen">
            <EventCalendar groupID={groupID} currentUserID={currentUserID} />

            <button
                onClick={handleShowAvailability}
                className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg z-50"
            >
                Show Everyone’s Availability
            </button>
        </div>
    );
}
