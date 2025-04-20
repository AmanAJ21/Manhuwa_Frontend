'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Menu from '../components/Menu';
import Image from 'next/image';
import { loadSites, loadManhuwas, saveManhuwas, removeRelatedData, removeChapter, removeImage } from '../utils/storage'; // Import necessary functions
import '../../public/css/AddManhuwa.css';

require('dotenv').config();

export default function AddManhuwa() {
  const [targetName, setTargetName] = useState('');
  const [sites, setSites] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedManhuwas, setAddedManhuwas] = useState([]);


  useEffect(() => {
    const savedSites = loadSites();
    setSites(savedSites);
  }, []);
  
  useEffect(() => {
    const savedManhuwas = loadManhuwas();
    if (savedManhuwas) {
      setAddedManhuwas(savedManhuwas);
    }
  }, []);


  const handleAddManhuwa = useCallback(
    (manhuwa) => {
      if (addedManhuwas.some((m) => m.link === manhuwa.link)) {
        alert(`"${manhuwa.name}" is already added.`);
        return;
      }
      const updated = [...addedManhuwas, manhuwa];
      saveManhuwas(updated);
      setAddedManhuwas(updated);
      alert(`Added "${manhuwa.name}" successfully.`);
    },
    [addedManhuwas]
  );

  const handleRemoveManhuwa = useCallback(
    (link) => {
      if (!confirm('Are you sure you want to remove this manhuwa and all related data?')) return;

      // Remove all related data first
      removeRelatedData(link);

      // Then update saved manhuwas list
      const updated = addedManhuwas.filter((m) => m.link !== link);
      saveManhuwas(updated);
      setAddedManhuwas(updated);

      alert('Manhuwa and related data removed successfully.');
    },
    [addedManhuwas]
  );

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!targetName.trim()) {
      setError('Please enter a target name.');
      return;
    }

    if (sites.length === 0) {
      setError('No saved sites to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setAllResults([]);

    try {
      const validSites = sites.filter((site) => site.url && site.url.trim() !== '');

      if (validSites.length === 0) {
        setError('No saved sites with valid URLs to search.');
        return;
      }

      const fetches = validSites.map((site) =>
        fetch(process.env.NEXT_PUBLIC_URL +'/api/search-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: site.url,
            targetName: targetName.trim(),
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch from ${site.url}`);
            return res.json();
          })
          .then((data) => ({
            siteTitle: site.siteTitle,
            faviconUrl: site.faviconUrl,
            pairedData: data.pairedData || [],
          }))
          .catch((error) => {
            console.error('Fetch error:', error);
            return { siteTitle: site.siteTitle, faviconUrl: site.faviconUrl, pairedData: [] };
          })
      );

      const results = await Promise.all(fetches);
      setAllResults(results);

      const totalResults = results.reduce((acc, cur) => acc + cur.pairedData.length, 0);
      if (totalResults === 0) {
        setError('No results found across all sites.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error fetching manhuwa data.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <Menu />
      <main className="manhuwa-container">
        <h1>Search Manhuwa Across All Saved Sites</h1>

        <form onSubmit={handleSearch} className="manhuwa-form" noValidate>
          <label htmlFor="target-name">Target Name:</label>
          <input
            id="target-name"
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="Enter manhuwa name"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <p className="error-message" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <section className="search-results">
          {allResults.map(({ siteTitle, faviconUrl, pairedData }) => (
            <div key={siteTitle} className="site-results">
              <span className="site-header">
                {faviconUrl ? (
                  <Image src={faviconUrl} alt={`${siteTitle} favicon`} width={20} height={20} />
                ) : (
                  <div className="favicon-placeholder" />
                )}
                <h3>{siteTitle}</h3>
              </span>
              {pairedData.length === 0 ? (
                <p>No manhuwa found on this site.</p>
              ) : (
                <ul className="manhuwa-list">
                  {pairedData.map(({ link, name, src }) => (
                    <li key={link} className="manhuwa-item">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="manhuwa-link"
                        title={name}
                      >
                        <Image src={src} alt={name} width={120} height={174} className="manhuwa-image" />
                        <p className="manhuwa-name">{name}</p>
                      </a>
                      <button
                        className="add-manhuwa-button"
                        onClick={() => handleAddManhuwa({ link, name, src, sourceSite: siteTitle })}
                        disabled={addedManhuwas.some((m) => m.link === link)}
                        title={
                          addedManhuwas.some((m) => m.link === link)
                            ? 'Already added'
                            : 'Add Manhuwa'
                        }
                      >
                        {addedManhuwas.some((m) => m.link === link) ? 'Added' : 'Add Manhuwa'}
                      </button>

                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        <section className="saved-manhuwas">
          <h2>Saved Manhuwas</h2>
          {addedManhuwas.length === 0 ? (
            <p>No manhuwa added yet.</p>
          ) : (
            <div className="manhuwa-grid">
              {addedManhuwas.map(({ link, name, src, sourceSite }) => (
                <div key={link} className="manhuwa-box" tabIndex={0}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="manhuwa-link"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Image src={src} alt={name}  width={120} height={174}/>
                    <p>{name}</p>
                    <small className="source-site">Source: {sourceSite}</small>
                  </a>
                  <button
                    className="remove-manhuwa-button"
                    onClick={() => handleRemoveManhuwa(link)}
                    aria-label={`Remove ${name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

          )}
        </section>
      </main>
    </>
  );
}