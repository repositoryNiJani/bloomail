import React from 'react';

export default function Photobooth() {
  return (
    <div className="booth" id="booth">
      <div className="booth-card">
        <div className="booth-head">
          <span className="ic" data-i="camera"></span>
          <b>Flower photobooth</b>
          <button className="x" id="boothX" type="button" aria-label="Close">
            <span className="ic" data-i="x"></span>
          </button>
        </div>

        <div className="view" id="bLive">
          <div className="viewport">
            <video id="bVideo" className="vhide" playsInline muted></video>
            <canvas id="bCanvas" width="960" height="720"></canvas>
            <div className="count-num" id="bCount"></div>
            <div className="flashfx" id="bFlash"></div>
            <div className="bmsg" id="bMsg" hidden></div>
          </div>
          <div className="thumbs" id="bThumbs"></div>
          <button className="cta" id="bSnap" type="button">
            <span className="ic" data-i="camera"></span>
            Snap 3 photos
          </button>
          <p className="fine">Photos stay on your device. Nothing is uploaded.</p>
        </div>

        <div className="view" id="bResult" hidden>
          <canvas id="bStrip"></canvas>
          <div className="row">
            <button className="cta" id="bDl" type="button">
              <span className="ic" data-i="down"></span>
              Download
            </button>
            <button className="chip" id="bRetake" type="button">
              <span className="ic" data-i="replay"></span>
              Retake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
