'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Menu from '../components/Menu';
import '../../public/css/Manhuwa.css';
import ScrollToTopButton from '../components/TopButton';
import Image from 'next/image';
import { loadManhuwas, addChapter, setSelectedChapter } from '../utils/storage';

require('dotenv').config();

const CHAPTERS_STORAGE_KEY_PREFIX = 'chapters_';

// Encode/decode helpers for unique link in URL
function encodeLink(link) {
  return encodeURIComponent(btoa(link));
}
function decodeLink(encoded) {
  try {
    return atob(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

export default function ManhuwaPage() {
  const router = useRouter();
  const params = useParams();
  // For /manhuwa/[manhuwa], params.manhwa is the encoded link
  const encodedLink = params?.manhuwa;

  const [manhuwaInfo, setManhuwaInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized chapter loader
  const loadChapters = useCallback(
    (manhwa) => {
      if (!manhwa) return;
      const chaptersKey = CHAPTERS_STORAGE_KEY_PREFIX + manhwa.link;
      const cachedChapters = JSON.parse(localStorage.getItem(chaptersKey) || '[]');
      if (cachedChapters.length > 0) {
        setChapters(cachedChapters);
        setLoading(false);
      } else {
        fetchChapters(manhwa.link, chaptersKey, manhwa.name);
      }
    },
    []
  );

  // Fetch chapters from API and conditionally update localStorage
  async function fetchChapters(url, storageKey, targetName) {
    setLoading(true);
    try {
      // Get cached chapters here
      const cachedChapters = JSON.parse(localStorage.getItem(storageKey) || '[]');

      const response = await fetch(process.env.NEXT_PUBLIC_URL + '/api/chapter-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, targetName }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success && Array.isArray(data.chapterLinks)) {
        setChapters(data.chapterLinks);
        if (data.chapterLinks.length !== cachedChapters.length) {
          data.chapterLinks.forEach((chapter) => addChapter(url, chapter));
        }
      } else {
        setChapters([]);
      }
    } catch (error) {
      console.error('Failed to load chapters:', error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (!encodedLink) {
      setManhuwaInfo(null);
      setChapters([]);
      setLoading(false);
      router.replace('/'); // redirect to homepage
      return;
    }

    setLoading(true);
    const decodedLink = decodeLink(encodedLink);
    if (!decodedLink) {
      setManhuwaInfo(null);
      setChapters([]);
      setLoading(false);
      router.replace('/'); // redirect to homepage
      return;
    }

    const storedManhuwas = loadManhuwas();
    const storedManhuwa = storedManhuwas.find((m) => m.link === decodedLink);

    if (storedManhuwa) {
      setManhuwaInfo(storedManhuwa);
      loadChapters(storedManhuwa);
    } else {
      setManhuwaInfo(null);
      setChapters([]);
      setLoading(false);
      router.replace('/'); // redirect to homepage if manhuwa not found
    }
  }, [encodedLink, loadChapters, router]);


  // Extract chapter number from chapter text, e.g. "Chapter 202" → "202"
  function extractChapterNumber(text) {
    const match = text.match(/[\d.]+/);
    return match ? match[0] : '';
  }

  // Handle chapter click navigation
  function handleChapterClick(chapter) {
    setSelectedChapter(chapter);
    const chapterNumber = extractChapterNumber(chapter.text);
    const chapterSlug = `chapter-${chapterNumber}`;
    // Navigate to /manhuwa/[manhuwa]/[chapter]
    router.push(`/${encodedLink}/${chapterSlug}`);
  }

  if (loading) {
    return (
      <>
        <Menu />
        <div className='loading'>
          <p>Loading manhuwa...</p>
          <div className='spinner'></div>
        </div>
      </>
    );
  }


  if (!manhuwaInfo) {
    return <p>Manhuwa info not found. Please navigate from the home page.</p>;
  }

  return (
    <>
      <Menu />
      <div className="manhuwas-container">
        <h1 className="manhuwas-title">{manhuwaInfo.name}</h1>
        <p className="manhuwas-source">{manhuwaInfo.link}</p><br />
        <Image
          className="manhuwas-img"
          src={manhuwaInfo.src}
          alt={manhuwaInfo.name}
          width={240}
          height={320}
          priority
        />


        <div className="chapters-grid">
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <div
                key={index}
                className="chapter-box"
                onClick={() => handleChapterClick(chapter)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleChapterClick(chapter);
                }}
              >
                {chapter.text}
              </div>
            ))
          ) : (
            <p>No chapters available.</p>
          )}
        </div>

        <ScrollToTopButton />
      </div>
    </>
  );
}
