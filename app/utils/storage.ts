// utils/storage.ts

// Interfaces for strong typing
export interface Site {
  id: number;
  url: string;
  faviconUrl: string;
  siteTitle: string;
}

export interface Manhuwa {
  link: string;
  name: string;
  src: string;
  sourceSite: string;
  // Add other fields as needed
}

export interface Chapter {
  href: string;
  text: string;
}

export interface Image {
  url: string;
  // Add other fields if needed
}

// Storage keys and prefixes
const SITES_STORAGE_KEY = 'sites';
const MANHUWAS_STORAGE_KEY = 'manhuwas';
const CHAPTERS_STORAGE_KEY_PREFIX = 'chapters_';
const IMAGES_STORAGE_KEY_PREFIX = 'images_';

// Utility to safely access localStorage
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch { }
}

// --- Sites ---

export function loadSites(): Site[] {
  const stored = safeGetItem(SITES_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Site[];
  } catch (error) {
    console.error('Failed to parse sites from localStorage:', error);
    return [];
  }
}

export function saveSites(sites: Site[]): void {
  safeSetItem(SITES_STORAGE_KEY, JSON.stringify(sites));
}

export function removeSite(sites: Site[], id: number): Site[] {
  const updatedSites = sites.filter(site => site.id !== id);
  saveSites(updatedSites);
  return updatedSites;
}

// --- Manhuwas ---

export function loadManhuwas(): Manhuwa[] {
  const stored = safeGetItem(MANHUWAS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Manhuwa[];
  } catch (error) {
    console.error('Failed to parse manhuwas from localStorage:', error);
    return [];
  }
}

export function saveManhuwas(manhuwas: Manhuwa[]): void {
  safeSetItem(MANHUWAS_STORAGE_KEY, JSON.stringify(manhuwas));
}

export function removeManhuwa(manhuwas: Manhuwa[], link: string): Manhuwa[] {
  const updatedManhuwas = manhuwas.filter(m => m.link !== link);
  saveManhuwas(updatedManhuwas);
  removeRelatedData(link);
  return updatedManhuwas;
}

// Remove related data for a manhuwa
// Remove all related data for a manhwa (chapters + images)
export function removeRelatedData(manhwaLink: string): void {
  const encodedManhwaLink = encodeURIComponent(manhwaLink);

  // Remove chapters and related images
  const chaptersKey = `${CHAPTERS_STORAGE_KEY_PREFIX}${encodedManhwaLink}`;
  const chaptersJSON = localStorage.getItem(chaptersKey);

  if (chaptersJSON) {
    try {
      const chapters = JSON.parse(chaptersJSON);
      if (Array.isArray(chapters)) {
        chapters.forEach((chapter: { href: string }) => {
          const imagesKey = `${IMAGES_STORAGE_KEY_PREFIX}${encodeURIComponent(chapter.href)}`;
          localStorage.removeItem(imagesKey);
        });
      }
    } catch (e) {
      console.error('Failed to parse chapters JSON for removal', e);
    }
  }

  // Remove chapters key itself
  localStorage.removeItem(chaptersKey);
}

// --- Chapters ---

export function loadChapters(manhwaLink: string): Chapter[] {
  const key = `${CHAPTERS_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const stored = safeGetItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Chapter[];
  } catch (error) {
    console.error('Failed to parse chapters from localStorage:', error);
    return [];
  }
}

// Replace entire chapter list (useful after fetch)
export function setChapters(manhwaLink: string, chapters: Chapter[]): void {
  const key = `${CHAPTERS_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  safeSetItem(key, JSON.stringify(chapters));
}

// Add a chapter only if it doesn't exist (by href)
export function addChapter(manhwaLink: string, chapter: Chapter): void {
  const key = `${CHAPTERS_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const existingChapters = loadChapters(manhwaLink);
  if (!existingChapters.some(c => c.href === chapter.href)) {
    existingChapters.push(chapter);
    safeSetItem(key, JSON.stringify(existingChapters));
  }
}

export function removeChapter(manhwaLink: string, chapterHref: string): void {
  // Remove chapter from the chapters list
  const chaptersKey = `${CHAPTERS_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const existingChapters = loadChapters(manhwaLink);
  const updatedChapters = existingChapters.filter(c => c.href !== chapterHref);
  safeSetItem(chaptersKey, JSON.stringify(updatedChapters));

  // Remove images related to this chapter
  const imagesKey = `images_${encodeURIComponent(chapterHref)}`;
  localStorage.removeItem(imagesKey); // Remove images from localStorage[2][4][5]

  // (Optional) Remove any other related data here using similar logic
}

export function setSelectedChapter(chapter) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('selectedChapter', JSON.stringify(chapter));
  } catch (err) {
    console.error('Failed to set selectedChapter:', err);
  }
}

export function loadSelectedChapter(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('selectedChapter');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}


// --- Images ---

export function loadImages(manhwaLink: string): string[] {
  const key = `${IMAGES_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const stored = safeGetItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as string[];
  } catch (error) {
    console.error('Failed to parse images from localStorage:', error);
    return [];
  }
}

// Replace entire image list (useful after fetch)
export function setImages(manhwaLink: string, images: string[]): void {
  const key = `${IMAGES_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  safeSetItem(key, JSON.stringify(images));
}

// Add an image only if it doesn't exist
export function addImage(manhwaLink: string, imageUrl: string): void {
  const key = `${IMAGES_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const existingImages = loadImages(manhwaLink);
  if (!existingImages.includes(imageUrl)) {
    existingImages.push(imageUrl);
    safeSetItem(key, JSON.stringify(existingImages));
  }
}

export function removeImage(manhwaLink: string, imageUrl: string): void {
  const key = `${IMAGES_STORAGE_KEY_PREFIX}${encodeURIComponent(manhwaLink)}`;
  const existingImages = loadImages(manhwaLink);
  const updatedImages = existingImages.filter(img => img !== imageUrl);
  safeSetItem(key, JSON.stringify(updatedImages));
}
