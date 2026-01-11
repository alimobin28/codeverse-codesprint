import React from 'react';

// Notice the 'export' keyword here directly
export const CosmicBackground = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -50,
        
        // Make sure this matches your uploaded file name exactly
        backgroundImage: `url('/i3.png')`, 
        
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
};

// Removed the 'export default' line to fix the error