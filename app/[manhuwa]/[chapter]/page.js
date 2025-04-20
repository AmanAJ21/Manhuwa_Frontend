'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Menu from '../../components/Menu';
import ScrollToTopButton from '../../components/TopButton';
import styles from '../../../public/css/Chapter.module.css';
import { loadSelectedChapter, loadImages, setImages, loadChapters, setSelectedChapter } from '../../utils/storage';

// Helper to decode base64 URL param safely
function decodeLink(encoded) {
  try {
    return atob(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const encodedManhuwa = params?.manhuwa || '';
  const chapterSlug = params?.chapter || '';

  const [chapter, setChapter] = useState(null);
  const [images, setImagesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chapterIndex, setChapterIndex] = useState(null);

  const manhuwaLink = decodeLink(encodedManhuwa);

  
require('dotenv').config();
  // Fetch images from API and save to storage
  const fetchChapterImages = useCallback(async (url) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_URL+'/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success && data.images) {
        setImages(url, data.images);
        return data.images;
      } else {
        throw new Error('Images not found');
      }
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Load chapter and images (from cache or fetch)
  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsLogin(false);

    // Check if the Manhuwa URL is in local storage
    // Check if the Manhuwa URL is in local storage
    const storedManhuwas = JSON.parse(localStorage.getItem('manhuwas')) || [];
    const manhuwaExists = storedManhuwas.some(m => m.link === manhuwaLink);

    if (!manhuwaExists) {
      router.push('/'); // Redirect to home page if not found
      return;
    }

    try {
      const chapterObj = loadSelectedChapter();
      if (!chapterObj) throw new Error('No chapter found in local storage.');
      setChapter(chapterObj);

      // Load all chapters for prev/next navigation
      const allChapters = manhuwaLink ? loadChapters(manhuwaLink) : [];
      setChapters(allChapters);

      // Find current chapter index
      const idx = allChapters.findIndex(
        (ch) => ch.text.replace(/\s+/g, '').toLowerCase() === chapterObj.text.replace(/\s+/g, '').toLowerCase()
      );
      setChapterIndex(idx);

      let chapterImages = loadImages(chapterObj.href);
      if (!chapterImages || chapterImages.length === 0) {
        chapterImages = await fetchChapterImages(chapterObj.href);
      }

      if (chapterImages.length === 0) {
        setNeedsLogin(true);
      }
      setImagesState(chapterImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchChapterImages, manhuwaLink, router]);

  
  // Fetch images again on button click
  const handleFetchImages = async () => {
    if (!chapter) return;
    setLoading(true);
    setError(null);
    setNeedsLogin(false);
    try {
      const freshImages = await fetchChapterImages(chapter.href);
      setImagesState(freshImages);
      if (freshImages.length === 0) setNeedsLogin(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract chapter number from chapter text
  function extractChapterNumber(text) {
    const match = text.match(/[\d.]+/);
    return match ? match[0] : '';
  }

  // Navigate to prev or next chapter
  const handleNavigate = (direction) => {
    if (chapterIndex == null || !chapters.length) return;
    let newIndex = direction === 'prev' ? chapterIndex - 1 : chapterIndex + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;
    const targetChapter = chapters[newIndex];
    setSelectedChapter(targetChapter);
    const chapterNumber = extractChapterNumber(targetChapter.text);
    const newSlug = `chapter-${chapterNumber}`;
    router.push(`/${encodedManhuwa}/${newSlug}`);
  };


  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  if (loading) {
    return (
      <>
        <Menu />
        <div className={styles.loading}>
          <p>Loading Chapter...</p>
          <div className={styles.spinner}></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Menu />
        <div className={styles.errorContainer}>
          <p className={styles.error}>Error: {error}</p>
          <button className={styles.retryButton} onClick={handleFetchImages}>
            Retry Fetch
          </button>
        </div>
      </>
    );
  }

  // Button style helper for disabled state
  const getButtonStyle = (disabled) => ({
    backgroundColor: disabled ? '#a1a1aa' : '#2563eb', // gray if disabled, blue if enabled
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <>
      <Menu />
      <div className={styles.container}>
        <h1 className={styles.title}>
          {manhuwaLink ? manhuwaLink.split('/').pop().replace(/-/g, ' ') : ''} — {chapterSlug.replace('chapter-', 'Chapter ')}
        </h1>
        <p className={styles.chapterUrl}>
          Chapter URL:{' '}
          <a href={chapter?.href} target="_blank" rel="noopener noreferrer">
            {chapter?.href}
          </a>
        </p>

        {needsLogin ? (
          <p className={styles.needsLogin}>
            This chapter may require you to be logged in. Please try again after logging in.
          </p>
        ) : images.length === 0 ? (
          <>
            <p className={styles.noImages}>No images found for this chapter.</p>
            <button className={styles.retryButton} onClick={handleFetchImages}>
              Fetch Images Again
            </button></>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>

              <button
                className={styles.retryButton}
                style={getButtonStyle(chapterIndex === chapters.length - 1)}
                onClick={() => handleNavigate('next')}
                disabled={chapterIndex === chapters.length - 1}
                aria-disabled={chapterIndex === chapters.length - 1}
              >
                Prev
              </button>
              <button className={styles.retryButton} onClick={handleFetchImages}>
                Fetch Images Again
              </button>
              <button
                className={styles.retryButton}
                style={getButtonStyle(chapterIndex === 0)}
                onClick={() => handleNavigate('prev')}
                disabled={chapterIndex === 0}
                aria-disabled={chapterIndex === 0}
              >
                Next
              </button>

            </div>



            <div className={styles.imagesStack}>
              {images.map((imageUrl, index) => (
                <div key={imageUrl} className={styles.imageWrapper}>
                  <Image
                    src={imageUrl.trim()}
                    alt={`Chapter page ${index + 1} of ${chapter?.text || ''}`}
                    width={700}
                    height={1000}
                    sizes="(max-width: 900px) 100vw, 700px"
                    className={styles.image}
                    priority={index === 0}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>

              <button
                className={styles.retryButton}
                style={getButtonStyle(chapterIndex === chapters.length - 1)}
                onClick={() => handleNavigate('next')}
                disabled={chapterIndex === chapters.length - 1}
                aria-disabled={chapterIndex === chapters.length - 1}
              >
                Prev
              </button>
              <button className={styles.retryButton} onClick={handleFetchImages}>
                Fetch Images Again
              </button>
              <button
                className={styles.retryButton}
                style={getButtonStyle(chapterIndex === 0)}
                onClick={() => handleNavigate('prev')}
                disabled={chapterIndex === 0}
                aria-disabled={chapterIndex === 0}
              >
                Next
              </button>

            </div>

          </>
        )}


      </div>
      <ScrollToTopButton />
    </>
  );
}
