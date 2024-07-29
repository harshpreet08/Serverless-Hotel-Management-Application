import React from 'react';
import { Button } from '@mui/material';
import { Hotel, AttachMoney, SupportAgent } from '@mui/icons-material';
import hotelBackground from'../assets/hotel-background.jpg'
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate()
  return (
    <div>
      <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: `url(${hotelBackground})` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-white text-6xl font-bold mb-2">Planning for a Vacation ?</h1>
          <h4 className="text-white text-2xl mb-4">We got the best properties to book from</h4>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={() =>  navigate('/properties')}
          >
            View Properties
          </Button>
        </div>
      </div>

      {/* Component Part 2 */}
      <div className="p-8 bg-yellow-500 text-white text-center">
        <h2 className="text-5xl font-bold mb-8 mt-5">Why choose us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 mb-8">
          <div className="flex flex-col items-center">
            <Hotel fontSize="large" />
            <p className="mt-2">Comfortable stays</p>
          </div>
          <div className="flex flex-col items-center">
            <AttachMoney fontSize="large" />
            <p className="mt-2">Budget friendly</p>
          </div>
          <div className="flex flex-col items-center">
            <SupportAgent fontSize="large" />
            <p className="mt-2">24/7 support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
