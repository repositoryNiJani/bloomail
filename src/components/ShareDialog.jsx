import React from 'react';

export default function ShareDialog() {
  return (
    <div className="sheet" id="sheet">
      <div className="sheet-card">
        <button className="x" id="sheetX" type="button" aria-label="Close">
          <span className="ic" data-i="x"></span>
        </button>
        <h3>Your flower is ready</h3>
        <p className="sub">Share this link. They'll open an envelope and watch it bloom. No account needed.</p>
        <div className="linkrow">
          <input id="linkOut" readOnly aria-label="Share link" />
          <button className="cta small" id="copyBtn" type="button">
            <span className="ic" data-i="copy"></span>
            Copy
          </button>
        </div>
        <div className="share-grid">
          <button id="shareBtn" type="button">
            <span className="ic" data-i="share"></span>
            Share
          </button>
          <button id="mailBtn" type="button">
            <span className="ic" data-i="mail"></span>
            Email it
          </button>
          <button id="prevBtn" type="button">
            <span className="ic" data-i="eye"></span>
            Preview
          </button>
          <button id="boothBtn" type="button">
            <span className="ic" data-i="camera"></span>
            Try photobooth
          </button>
        </div>
        <p className="fine" id="lenWarn"></p>
      </div>
    </div>
  );
}
