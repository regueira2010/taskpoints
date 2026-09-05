import { useCallback } from 'react';
import useSound from 'use-sound';

const useSoundEffects = () => {
  // Nota: Estos son sonidos gratuitos de ejemplo
  // Puedes reemplazar las URLs con tus propios sonidos
  const [playComplete] = useSound('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', { volume: 0.5 });
  const [playLevelUp] = useSound('https://www.soundjay.com/misc/sounds/fanfare-6.mp3', { volume: 0.5 });
  const [playPoints] = useSound('https://www.soundjay.com/misc/sounds/coin-drop-2.mp3', { volume: 0.5 });
  const [playExpired] = useSound('https://www.soundjay.com/misc/sounds/error-01.mp3', { volume: 0.5 });

  return {
    playComplete,
    playLevelUp,
    playPoints,
    playExpired,
  };
};

export default useSoundEffects;