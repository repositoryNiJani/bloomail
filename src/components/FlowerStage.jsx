import React from 'react';

export default function FlowerStage() {
  return (
    <main className="stage" id="stage">
      <canvas id="gl" aria-label="3D flower. Drag to rotate."></canvas>
      <div className="notes" id="notes"></div>
      <div className="nowp" id="nowp">
        <span className="ic" data-i="music"></span>
        <span id="nowpName"></span>
        <span className="eq"><i></i><i></i><i></i></span>
      </div>

      <nav className="nav" aria-label="Steps">
        <button type="button" data-tab="design" className="on">
          <span className="ic" data-i="sparkle"></span>
          Design
        </button>
        <button type="button" data-tab="write">
          <span className="ic" data-i="pen"></span>
          Write
        </button>
        <button type="button" data-tab="send">
          <span className="ic" data-i="send"></span>
          Send
        </button>
      </nav>

      <button className="chip back" id="backEdit" type="button">
        <span className="ic" data-i="back"></span>
        Back to editing
      </button>
      <div className="tag" id="tag"></div>
      <div className="hint">Drag to spin. Tap the flower for petals.</div>

      <div className="dock">
        <button className="chip" id="replay" type="button">
          <span className="ic" data-i="replay"></span>
          Replay bloom
        </button>
        <button className="cta" id="sendBtn" type="button">
          Send this flower
          <span className="ic" data-i="send"></span>
        </button>
      </div>

      <div className="envelope-wrap" id="envWrap">
        <div className="env-title">
          <div id="envFor"></div>
          <small>tap the envelope to open it</small>
        </div>
        <button className="env" id="env" type="button" aria-label="Open your envelope">
          <span className="bk"></span>
          <span className="front"></span>
          <span className="flap"></span>
          <span className="seal"><span className="ic" data-i="heart"></span></span>
        </button>
      </div>

      <div className="letter" id="letter">
        <button
          className="letter-toggle"
          id="letterToggle"
          type="button"
          aria-label="Open your letter"
          aria-expanded="false"
        >
          <span className="letter-envelope-icon" aria-hidden="true"></span>
          <span>Read letter</span>
          <span className="letter-hint" aria-hidden="true">Open this</span>
        </button>
        <div className="letter-content" id="letterContent">
          <button className="letter-collapse" id="letterCollapse" type="button" aria-label="Close your letter">
            <span className="ic" data-i="x"></span>
          </button>
          <div className="l-occ" id="lOcc"></div>
          <div className="l-to" id="lTo"></div>
          <p className="l-msg" id="lMsg"></p>
          <div className="l-from" id="lFrom"></div>
          <div id="lEmbed"></div>
          <div className="l-actions">
            <button className="chip" id="rxBooth" type="button">
              <span className="ic" data-i="camera"></span>
              Photobooth
            </button>
            <button className="chip" id="rxSound" type="button" aria-label="Toggle sound"></button>
            <button className="chip" id="rxNew" type="button">
              <span className="ic" data-i="send"></span>
              Send one back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
