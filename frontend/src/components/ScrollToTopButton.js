import React, { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button when page is scrolled beyond a certain point
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' 
    });
  };

  return (
    <>
      <style>{`
        .scroll-to-top-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          background-color: #1560bd;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.6rem;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: opacity 0.3s ease-in-out;
        }
        .scroll-to-top-btn:hover {
          background-color: #0d4f9c;
        }
      `}</style>

      {isVisible && (
        <button 
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
}
