import React from 'react';

export default function WriteSidebar() {
  return (
    <aside className="panel panel-write" id="pWrite">
      <section>
        <h2><i>5</i> What's the occasion?</h2>
        <div className="chips" id="occ"></div>
        <label className="field occasion-field" id="grpOc">
          <span>Name your occasion</span>
          <input
            id="fOc"
            maxLength="30"
            placeholder="e.g. Graduation, Promotion, Get well soon"
            autoComplete="off"
          />
        </label>
      </section>

      <section>
        <h2><i>6</i> Your letter</h2>
        <label className="field">
          <span>To</span>
          <input id="fTo" maxLength="40" placeholder="Who's the lucky person?" autoComplete="off" />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea
            id="fMsg"
            maxLength="500"
            rows="5"
            placeholder="Write something sweet, or tap an occasion above for a head start."
          />
          <small className="count" id="cnt">0 / 500</small>
        </label>
        <label className="field">
          <span>From</span>
          <input id="fFr" maxLength="40" placeholder="Your name" autoComplete="off" />
        </label>
      </section>

      <section>
        <h2><i>7</i> Pick a tune</h2>
        <div className="chips" id="music"></div>
        <label className="field music-link-field">
          <span>Or paste a Spotify / YouTube link</span>
          <input id="fMl" placeholder="https://..." autoComplete="off" />
          <small id="mlHint"></small>
        </label>
      </section>
    </aside>
  );
}
