import React, { useEffect, useState } from 'react';

const repoUrl = 'https://github.com/repositoryNiJani/bloomail';
const repoApiUrl = 'https://api.github.com/repos/repositoryNiJani/bloomail';

export default function GitHubStarsCard() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState('Loading GitHub stars…');

  useEffect(() => {
    let active = true;

    async function loadStars() {
      try {
        const response = await fetch(repoApiUrl, {
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'no-store'
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
        const repository = await response.json();
        if (!Number.isSafeInteger(repository.stargazers_count) || repository.stargazers_count < 0) {
          throw new Error('GitHub returned an invalid star count.');
        }
        if (active) {
          setCount(repository.stargazers_count);
          setStatus('');
        }
      } catch (error) {
        console.error('Could not load the Bloomail GitHub star count.', error);
        if (active) setStatus('Could not load the GitHub star count right now.');
      }
    }

    loadStars();
    window.addEventListener('focus', loadStars);
    return () => {
      active = false;
      window.removeEventListener('focus', loadStars);
    };
  }, []);

  return (
    <section className="github-stars-card" aria-label="Bloomail GitHub stars">
      <h2>Support Bloomail</h2>
      <p className="github-stars-total" aria-live="polite">
        <strong>{count === null ? '—' : count.toLocaleString()}</strong> GitHub stars
      </p>
      <a className="cta small github-star-link" href={repoUrl} target="_blank" rel="noreferrer">
        Star Bloomail on GitHub
      </a>
      <p className="github-stars-status" role="status" aria-live="polite">{status}</p>
    </section>
  );
}
