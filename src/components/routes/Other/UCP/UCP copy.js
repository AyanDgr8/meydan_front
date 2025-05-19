// src/components/routes/Other/UCP/UCP.js

import React, { useState, useRef, useEffect } from 'react';
import './UCP.css';

const UCP = ({ isLoggedIn = true }) => { 
  const [showPopup, setShowPopup] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const popupContainerRef = useRef(null);
  const floatingContainerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Floating window state
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [isFloatingDragging, setIsFloatingDragging] = useState(false);
  const [floatingStartPos, setFloatingStartPos] = useState({ x: 0, y: 0 });

  const handleOpenPopup = () => {
    setShowPopup(true);
    setShowFloating(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePopOut = () => {
    setShowFloating(true);
    setShowPopup(false);
  };

  const handlePopIn = () => {
    setShowFloating(false);
    setShowPopup(true);
  };

  // Dragging functionality for the main popup
  const handleMouseDown = (e) => {
    if (e.target.tagName !== 'IFRAME') {
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

  // Dragging functionality for the floating window
  const handleFloatingMouseDown = (e) => {
    if (e.target.className === 'floating-header') {
      setIsFloatingDragging(true);
      setFloatingStartPos({
        x: e.clientX - floatingPosition.x,
        y: e.clientY - floatingPosition.y
      });
    }
  };

  const handleFloatingMouseMove = (e) => {
    if (isFloatingDragging) {
      setFloatingPosition({
        x: e.clientX - floatingStartPos.x,
        y: e.clientY - floatingStartPos.y
      });
    }
  };

  const handleFloatingMouseUp = () => {
    setIsFloatingDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleFloatingMouseMove);
    document.addEventListener('mouseup', handleFloatingMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleFloatingMouseMove);
      document.removeEventListener('mouseup', handleFloatingMouseUp);
    };
  }, [isDragging, isFloatingDragging, startPos, floatingStartPos]);

  // If not logged in, don't render anything
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        className="ucp-popup-btn" 
        onClick={handleOpenPopup}
      >
        Open UCP
      </button>

      {/* Main Popup Container */}
      {showPopup && (
        <div 
          className="ucp-popup-container" 
          ref={popupContainerRef}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          onMouseDown={handleMouseDown}
        >
          <div className="ucp-popup-header">
            <button 
              className="ucp-popout-btn" 
              onClick={handlePopOut}
              title="Open in floating window"
            >
              ↗
            </button>
            <button 
              className="ucp-close-btn" 
              onClick={handleClosePopup}
              title="Minimize"
            >
              -
            </button>
          </div>
          <iframe 
            src="https://ucdemo.voicemeetme.com/ucp/login" 
            title="UCP Embedded"
            className="ucp-iframe"
            allow="microphone; camera; autoplay"
          />
        </div>
      )}

      {/* Floating Window */}
      {showFloating && (
        <div 
          className="ucp-floating-container" 
          ref={floatingContainerRef}
          style={{ transform: `translate(calc(-50% + ${floatingPosition.x}px), calc(-50% + ${floatingPosition.y}px))` }}
        >
          <div 
            className="floating-header"
            onMouseDown={handleFloatingMouseDown}
          >
            <button 
              className="ucp-popin-btn" 
              onClick={handlePopIn}
              title="Pop In"
            >
              ↙
            </button>
            <button 
              className="ucp-floating-close-btn" 
              onClick={handlePopIn}
              title="Close"
            >
              ×
            </button>
          </div>
          <iframe 
            src="https://ucdemo.voicemeetme.com/ucp/login" 
            title="UCP Floating"
            className="ucp-floating-iframe"
            allow="microphone; camera; autoplay"
          />
        </div>
      )}
    </>
  );
};

export default UCP;
