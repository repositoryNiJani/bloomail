import React from 'react';
import GitHubStarsCard from './GitHubStarsCard.jsx';

export default function DesignSidebar() {
  return (
    <aside className="panel panel-design" id="pDesign">
      <div className="brand">
        <div className="logo">
          <img src="/bloomail-logo.png" alt="" />
        </div>
        <div>
          <b>bloomail</b>
          <small>send a flower, say it softer</small>
        </div>
      </div>

      <section>
        <h2><i>1</i> Pick your flower</h2>
        <div className="tiles" id="tiles"></div>
      </section>

      <section>
        <h2><i>2</i> Display style</h2>
        <div className="seg" id="seg"></div>
      </section>

      <section id="arrangementSection" hidden>
        <h2><span id="arrangementHeading">Arrangement</span></h2>
        <div className="arrangement-grid" id="arrangements"></div>
      </section>

      <section>
        <h2><i>3</i> Flower color</h2>
        <div className="swatches" id="sw"></div>
        <button className="chip duo" id="duo" type="button"></button>
        <div id="grpC2">
          <div className="lbl">Second color</div>
          <div className="swatches" id="sw2"></div>
          <p className="fine second-color-note">Flowers alternate between your two colors.</p>
        </div>
      </section>

      <section id="secWrap">
        <h2><i>4</i> Wrap &amp; ribbon</h2>
        <div id="grpWrapper">
          <div className="lbl">Wrapping paper</div>
          <div className="swatches" id="swWrap"></div>
        </div>
        <div className="lbl">Ribbon style</div>
        <div className="seg" id="segRib"></div>
        <div id="grpRibColor">
          <div className="lbl">Ribbon color</div>
          <div className="swatches" id="swRib"></div>
        </div>
      </section>

      <section>
        <h2>Extras</h2>
        <div className="chips" id="extras"></div>
        <div className="butterfly-colors" id="butterflyColors" hidden>
          <div className="lbl">Butterfly colors</div>
          <div id="butterflyColorInputs"></div>
        </div>
      </section>

      <button className="surprise" id="surprise" type="button">
        <span className="ic" data-i="dice"></span>
        Surprise me
      </button>

      <GitHubStarsCard />
    </aside>
  );
}
