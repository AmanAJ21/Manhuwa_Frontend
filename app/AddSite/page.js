'use client';

import React, { useState, useEffect } from 'react';
import { loadSites, saveSites, removeSite } from '../utils/storage';
import Image from 'next/image';
import Menu from '../components/Menu';
import '../../public/css/AddSite.css'

require('dotenv').config();

export default function AddSitePage() {
  const [url, setUrl] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [siteId, setSiteId] = useState(0);

  useEffect(() => {

    const initialSites = loadSites();
    setSites(initialSites);
    setSiteId(initialSites.length > 0 ? Math.max(...initialSites.map(site => site.id)) + 1 : 0);
  }, []);

  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_URL+'/api/favicon-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        const newSite = {
          id: siteId,
          url:url,
          faviconUrl: data.faviconUrl,
          siteTitle: data.siteTitle,
        };
        const updatedSites = [...sites, newSite];
        setSites(updatedSites);
        saveSites(updatedSites);
        setSiteId(siteId + 1);
        setUrl('');
      } else {
        setError('Failed to fetch site data.');
      }
    } catch {
      setError('Error fetching site data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSite = (id) => {
    const updatedSites = removeSite(sites, id);
    setSites(updatedSites);
    saveSites(updatedSites);
  };

  return (
    <>
      <Menu />
      <main className="site-form-container">
        <form onSubmit={handleSubmit} className="site-form" noValidate>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            aria-label="Site URL"
            required
            className="site-input"
          />
          <button type="submit" disabled={loading} className="site-button">
            {loading ? 'Adding...' : 'Add Site'}
          </button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}

        <ul className="site-list">
          {sites.map(({ id, faviconUrl, siteTitle }) => (
            <li key={id} className="site-item">
              <Image
                src={faviconUrl}
                alt={`${siteTitle} favicon`}
                width={20}
                height={20}
                className="site-favicon"
              />
              <span className="site-title">{siteTitle}</span>
              <button
                onClick={() => handleRemoveSite(id)}
                className="remove-button"
                aria-label={`Remove ${siteTitle}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
