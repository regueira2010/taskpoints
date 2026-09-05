import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

const Confetti = ({ active, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!show) return null;

  return (
    <ReactConfetti
      width={window.innerWidth}
      height={window.innerHeight}
      recycle={false}
      numberOfPieces={200}
      gravity={0.2}
    />
  );
};

export default Confetti;