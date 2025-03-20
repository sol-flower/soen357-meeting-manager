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
  const visibleItems = 3;
  const gap = 16;

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

  const handleNext = () => {
    if (currentIndex < groups.length - visibleItems) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  if (loading) return <p>Loading groups...</p>;
  if (groups.length === 0) return <p>No groups found.</p>;

  return (
    <>
      <div className="mt-2">
        <div className="w-full max-w-4xl mx-auto overflow-hidden px-4">
          <div className="relative">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                paddingLeft: `${gap}px`,
                paddingRight: `${gap}px`,
              }}
            >
              {groups.map((group) => (
                <div
                  className="flex-none w-1/3 h-60 p-4 bg-white rounded-lg shadow-md flex flex-col justify-between"
                  key={group.id}
                  style={{ minWidth: `calc(100% / ${visibleItems} - ${gap}px)` }}
                >
                  <h2 className='text-xl font-bold'>{group.groupName}</h2>
                  <h3 className="text-lg font-semibold">Group ID: {group.id}</h3>
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
        <button
          onClick={handlePrev}
          className={`carousel-arrow mr-4 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentIndex === 0}
        >
          <img src={leftArrowPath} alt="Prev" className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className={`carousel-arrow ml-4 ${
            currentIndex >= groups.length - visibleItems ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentIndex >= groups.length - visibleItems}
        >
          <img src={rightArrowPath} alt="Next" className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default EventCarousel;