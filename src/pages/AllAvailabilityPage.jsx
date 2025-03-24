// AllAvailabilityPage.jsx — reuse EventCalendar component for group heatmap

import React from 'react';
import { useParams } from 'react-router-dom';
import EventCalendar from '../components/calendar';
import { auth } from '../firebase/firebase';

export default function AllAvailabilityPage() {
  const { groupID } = useParams();
  const currentUserID = auth.currentUser?.uid;

  return (
    <div className="relative min-h-screen group-view-mode">
      <h1 className="text-2xl font-bold px-6 pt-6 mb-4">
      
      </h1>

      <EventCalendar
        groupID={groupID}
        currentUserID={currentUserID}
        isGroupView={true} // this prop will signal heatmap mode inside EventCalendar
      />
    </div>
  );
}
