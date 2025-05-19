// src/components/routes/Other/UCP/UCP.js

import React, { useState, useRef, useEffect } from 'react';
import './UCP.css';

const UCP = ({ isLoggedIn = true }) => { 
  const [showPopup, setShowPopup] = useState(false);
  const popupContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleMinimize = () => {
    setShowPopup(false); // Hide the popup when minimized
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName !== 'IFRAME' && e.target.tagName !== 'BUTTON') {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <button 
        className="ucp-popup-btn" 
        onClick={handleOpenPopup}
      >
        Open UCP
      </button>

      <div 
        className={`ucp-popup-container ${!showPopup ? 'ucp-hidden' : ''}`}
        ref={popupContainerRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMouseDown={handleMouseDown}
      >
        <div className="ucp-popup-header">
          <button 
            className="ucp-minimize-btn" 
            onClick={handleMinimize}
            title="Minimize"
          >
            -
          </button>
        </div>
        <iframe 
          ref={iframeRef}
          src="https://ucpmed.voicemeetme.com/ucp/login" 
          title="UCP Embedded"
          className="ucp-iframe"
          allow="microphone; camera; autoplay"
          style={{ display: showPopup ? 'block' : 'none' }}
        />
      </div>
    </>
  );
};

export default UCP;
