// src/app/components/HomePage/Countdown.tsx
import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date;
}

// Inline styles for Countdown component following the unified design system
const countdownStyles = `
  .countdown-timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-color-medium);
    font-size: 0.9rem;
  }

  .countdown-label {
    color: var(--text-color-medium);
  }

  .countdown-time-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .countdown-time-box {
    background-color: var(--primary-color);
    color: var(--white);
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    font-size: 0.85rem;
    line-height: 1;
    min-width: 28px;
    text-align: center;
  }

  .countdown-separator {
    color: var(--text-color-medium);
    font-weight: 600;
    margin: 0 0.125rem;
  }

  @media (max-width: 767.98px) {
    .countdown-timer {
      font-size: 0.8rem;
      gap: 0.375rem;
    }
    
    .countdown-time-box {
      padding: 0.2rem 0.4rem;
      font-size: 0.75rem;
      min-width: 24px;
    }
    
    .countdown-label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .countdown-timer {
      font-size: 0.75rem;
      gap: 0.25rem;
    }
    
    .countdown-time-box {
      padding: 0.15rem 0.3rem;
      font-size: 0.7rem;
      min-width: 20px;
    }
  }
`;

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // Helper to add a leading zero if the number is less than 10
  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: countdownStyles }} />
      <div className="countdown-timer">
        <span className="countdown-label">Ending in:</span>
        <div className="countdown-time-group">
          <div className="countdown-time-box">{formatTime(timeLeft.hours)}</div>
          <span className="countdown-separator">:</span>
          <div className="countdown-time-box">{formatTime(timeLeft.minutes)}</div>
          <span className="countdown-separator">:</span>
          <div className="countdown-time-box">{formatTime(timeLeft.seconds)}</div>
        </div>
      </div>
    </>
  );
};

export default Countdown;
