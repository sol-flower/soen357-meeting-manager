import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="mt-2">
      <div className="w-11/12">
        <div className="relative">
          <div className="flex space-x-4">
            {groups.slice(currentIndex, currentIndex + 3).map((group) => (
              <div className="flex-none w-1/3 p-4 bg-white rounded-lg shadow-md" key={group.id}>
                <h3 className="text-lg font-bold">{group.id}</h3>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 relative bottom-44">
            <button
              className="w-6 h-6 rounded-full bg-gray-300 relative right-4"
              onClick={handlePrev}
            >
              &lt;
            </button>
            <button
              className="w-6 h-6 rounded-full bg-gray-300 relative left-10"
              onClick={handleNext}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCarousel;