'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Menu from './components/Menu';
import '../public/css/Home.css'
import { loadManhuwas, removeManhuwa } from './utils/storage'; // Adjust the path as necessary

// Utility to format manhuwa name into URL-friendly slug
function formatTitleForUrl(title) {
  return encodeURIComponent(
    title.replace(/:/g, '').trim().replace(/\s+/g, '-').toLowerCase()
  );
}

function encodeLink(link) {
  return encodeURIComponent(btoa(link)); // base64 encode + URL encode
}

function decodeLink(encoded) {
  try {
    return atob(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

export default function Home() {
  const [manhuwas, setManhuwas] = useState([]);
  const router = useRouter();

  // Load saved manhuwas on component mount
  useEffect(() => {
    const savedManhuwas = loadManhuwas();
    setManhuwas(savedManhuwas);
  }, []);

  
  
  // Navigate to dynamic manhuwa page on click
  function handleClick(manhwa) {
    const encodedLink = encodeLink(manhwa.link);
    router.push(`/${encodedLink}`);
  }

  // Remove manhuwa from saved list
  function handleRemove(manhwa) {
    const updatedManhuwas = removeManhuwa(manhuwas, manhwa.link);
    setManhuwas(updatedManhuwas);
  }

  return (
    <div>
      <Menu />
      {manhuwas.length === 0 ? (
        <p>No manhuwa saved yet.</p>
      ) : (
        <div className="manhuwa-grid">
          {manhuwas.map((manhwa) => (
            <div
              key={manhwa.link}
              className="manhuwa-box"
              title={manhwa.name}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(manhwa)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleClick(manhwa);
              }}
              style={{ cursor: 'pointer' }}
            >
              <Image src={manhwa.src.trim()} alt={manhwa.name} width={120} height={174} />
              <p>{manhwa.name}</p>
              <small>{manhwa.sourceSite}</small>
              {manhwa.hasUpdates && <span style={{ color: 'red' }}>New Chapters Available!</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(manhwa);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8069198795330862"
     crossorigin="anonymous"></script>
      
    </div>
  );
}
