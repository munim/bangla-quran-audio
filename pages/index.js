import { useEffect, useRef, useState } from 'react';
import fs from 'fs';
import path from 'path';
import NodeID3 from 'node-id3';

export async function getStaticProps() {
  const directoryPath = path.join(process.cwd(), 'public/quran-bangla-translation-audio');
  const files = fs.readdirSync(directoryPath);

  const audios = files
    .filter(file => file.endsWith('.mp3'))
    .map(file => {
      const filePath = path.join(directoryPath, file);
      const tags = NodeID3.read(filePath);
      return {
        fileName: file,
        title: tags.title || file,
      };
    })
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  return {
    props: {
      audios,
    },
  };
}

export default function Home({ audios }) {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Load saved audio position from localStorage
  useEffect(() => {
    const savedAudio = localStorage.getItem('currentAudio');
    const savedTime = localStorage.getItem('currentTime');
    if (savedAudio) {
      setCurrentAudio(savedAudio);
      setCurrentTime(parseFloat(savedTime || 0));
    }
  }, []);

  // Save audio position every 20 seconds
  useEffect(() => {
    if (audioRef.current) {
      const interval = setInterval(() => {
        localStorage.setItem('currentAudio', currentAudio);
        localStorage.setItem('currentTime', audioRef.current.currentTime);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [currentAudio]);

  const handleAudioPlay = (file) => {
    setCurrentAudio(file);
    setCurrentTime(0);  // Reset to start when new file is selected
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
      if (currentTime > 0) {
        audioRef.current.play();
      }
    }
  }, [currentAudio, currentTime]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Quran translations in Bengali</h1>
      {currentAudio && (
        <audio ref={audioRef} controls className="mb-6 w-full">
          <source src={`/quran-bangla-translation-audio/${currentAudio}`} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      <ul>
        {audios.map((audio, index) => (
          <li key={index} className="mb-2">
            <button
              className="text-blue-500 underline"
              onClick={() => handleAudioPlay(audio.fileName)}
            >
              {audio.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}