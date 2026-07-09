import{C as d}from"./index-DwJTt_ie.js";class o{static show(i){const c=document.getElementById("ui-overlay");c.innerHTML=`
      <div class="menu-container">
        <div class="menu-title">
          <h1 class="game-title">TECHNOROUGE</h1>
          <p class="game-subtitle">JACK INTO THE SYSTEM</p>
        </div>
        <div class="class-select">
          <h2 class="select-title">SELECT ARCHETYPE</h2>
          <div class="class-grid" id="class-grid"></div>
        </div>
        <div class="menu-footer">[1-4] to select | WASD to explore | Mouse to aim</div>
      </div>
    `;const n=document.getElementById("class-grid");d.forEach((e,s)=>{const a=document.createElement("div");a.className="class-card",a.style.setProperty("--class-color",e.color),a.dataset.index=String(s),a.innerHTML=`
        <div class="class-number">${s+1}</div>
        <div class="class-name">${e.name.toUpperCase()}</div>
        <div class="class-hp">HP ${e.maxHp}</div>
        <div class="class-energy">ENERGY ${e.maxEnergy}</div>
        <div class="class-desc">${e.description}</div>
        <div class="class-deck-preview">${e.starterDeck.length} cards</div>
      `,a.addEventListener("click",()=>i(e.id)),n.appendChild(a)});const t=e=>{const s=parseInt(e.key);s>=1&&s<=d.length&&(i(d[s-1].id),window.removeEventListener("keydown",t))};window.addEventListener("keydown",t)}}export{o as MenuScene};
