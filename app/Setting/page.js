'use client';

import React, { useEffect, useState, useRef } from 'react';
import Menu from '../components/Menu';
import { loadSites, loadManhuwas, saveSites, saveManhuwas } from '../utils/storage'; // Import necessary functions

export default function Setting() {
  const [storageData, setStorageData] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load all localStorage data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadStorageData();
  }, []);

  // Load all localStorage data into state
  const loadStorageData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const rawValue = localStorage.getItem(key);
      try {
        data[key] = JSON.parse(rawValue);
      } catch {
        data[key] = rawValue;
      }
    }
    setStorageData(data);
  };

  // Remove item from localStorage and update states
  const handleRemove = (key) => {
    if (!window.confirm(`Are you sure you want to remove "${key}" from localStorage?`)) return;
    localStorage.removeItem(key);
    loadStorageData();
  };

  // Export all localStorage data as JSON file
  const handleExport = () => {
    try {
      setLoading(true);
      const dataStr = JSON.stringify(storageData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'localStorage_backup.json';
      a.click();

      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change for import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        const importedData = JSON.parse(event.target.result);
        if (typeof importedData !== 'object' || importedData === null) {
          alert('Invalid JSON data.');
          return;
        }

        if (!window.confirm('Importing will clear your current localStorage data. Proceed?')) {
          return;
        }

        // Clear current localStorage and set imported data
        localStorage.clear();

        for (const [key, value] of Object.entries(importedData)) {
          try {
            const toStore = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, toStore);
          } catch (err) {
            console.warn(`Failed to set localStorage item "${key}":`, err);
          }
        }

        loadStorageData();
        alert('Import successful!');
      } catch (error) {
        alert('Failed to parse JSON file.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);

    // Reset file input so same file can be imported again if needed
    e.target.value = '';
  };

  // Trigger hidden file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Styles extracted for readability
  const buttonStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    userSelect: 'none',
  };

  const removeButtonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    userSelect: 'none',
  };

  const listItemStyle = {
    marginBottom: '1rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems : 'center',
    wordBreak: 'break-word',
  };

  const preStyle = {
    display: 'inline',
    whiteSpace: 'pre-wrap',
    margin: 0,
    fontFamily: 'inherit',
  };

  return (
    <>
      <Menu />

      <div style={{ padding: '1rem ', maxWidth: '800px', margin: '0 auto' }}>
        <h1>LocalStorage Data</h1>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            style={buttonStyle}
            aria-label="Export localStorage data to JSON file"
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>

          <button
            onClick={triggerFileInput}
            style={{ ...buttonStyle, backgroundColor: '#16a34a' }}
            aria-label="Import localStorage data from JSON file"
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>

          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </div>

        {Object.keys(storageData).length === 0 ? (
          <p>No data found in localStorage.</p>
        ) : (
          <>
            <h2>All LocalStorage Items</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(storageData).map(([key, value]) => (
                <li key={key} style={listItemStyle}>
                  <div>
                    <strong>{key}:</strong>{' '}
                    <pre style={preStyle}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleRemove(key)}
                    style={removeButtonStyle}
                    aria-label={`Remove localStorage item ${key}`}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}