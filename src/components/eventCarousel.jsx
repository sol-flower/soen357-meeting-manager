import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const leftArrowPath = require('../assets/left_arrow.png');
  const rightArrowPath = require('../assets/right_arrow.png');
  let navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userID = user.uid;
        console.log('Fetching groups for user:', userID);

        const groupsRef = collection(firestore, 'groups');
        const q = query(groupsRef, where('members', 'array-contains', userID));
        const querySnapshot = await getDocs(q);

        const userGroups = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Fetched groups:', userGroups);
        setGroups(userGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
      setLoading(false);
    };

    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && currentIndex > groups.length - 3) {
      setCurrentIndex(0);
    }
  }, [currentIndex, groups.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % groups.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + groups.length) % groups.length);
  };

  if (loading) return <p>Loading groups...</p>;
  if (groups.length === 0) return <p>No groups found.</p>;

  return (
    <>
      <div className="mt-2">
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex justify-center space-x-4 transition-transform duration-500 ease-in-out">
              {groups.slice(currentIndex, currentIndex + 3).map((group) => (
                <div
                  className="flex-none w-60 h-60 p-4 bg-white rounded-lg shadow-md flex flex-col justify-between"
                  key={group.id}
                >
                  <h3 className="text-lg font-semibold">Group ID: {group.id}</h3>
                  {/* Button at the bottom */}
                  <Button
                    onClick={() => navigate(`/calendar/${group.id}`)}
                    variant="contained"
                    color="primary"
                    className="custom-button"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                    fullWidth
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-4 mb-4">
        <button onClick={handlePrev} className="mr-4">
          <img src={leftArrowPath} alt="Prev" className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="ml-4">
          <img src={rightArrowPath} alt="Next" className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default EventCarousel;