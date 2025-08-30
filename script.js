let highestZ = 1;

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    document.addEventListener('mousemove', (e) => {
      if(!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }
        
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      if(e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
    });
    window.addEventListener('mouseup', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

(function(){
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('audioToggle');

  // start muted to increase chance of autoplay; unmute on user gesture
  audio.volume = 0.7;

  // Update button icon
  function refreshIcon(){
    // If paused or muted, show muted icon
    if (audio.paused || audio.muted) {
      btn.textContent = '🔇';
      btn.classList.add('muted');
    } else {
      btn.textContent = '🔊';
      btn.classList.remove('muted');
    }
  }

  async function tryAutoplay(){
    try {
      // Some browsers require muted autoplay
      audio.muted = true;
      await audio.play();
      // We'll unmute on the first user gesture below
      refreshIcon();
    } catch (e) {
      // Autoplay blocked — will start on first gesture
      refreshIcon();
    }
  }

  // Ensure playback on first user gesture (covers desktop + mobile)
  let armed = true;
  async function armPlay(){
    if (!armed) return;
    armed = false;
    try {
      if (audio.paused) await audio.play();
      // Unmute once we have a user gesture
      audio.muted = false;
    } catch (e) {
      // If still blocked, keep armed = true to retry on next gesture
      armed = true;
    }
    refreshIcon();
  }

  // Listeners to catch any interaction (drag/touch/click/keys)
  ['pointerdown','touchstart','click','keydown'].forEach(ev => {
    window.addEventListener(ev, armPlay, { once: false, passive: true });
  });

  // Toggle button click
  btn.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        audio.muted = false;
      } else {
        audio.pause();
      }
      refreshIcon();
    } catch(e){
      // If play still blocked, will start on the next user gesture
      refreshIcon();
    }
  });

  // Kick off polite autoplay attempt
  tryAutoplay();

  // Keep icon in sync if something else changes audio state
  audio.addEventListener('play', refreshIcon);
  audio.addEventListener('pause', refreshIcon);
  audio.addEventListener('volumechange', refreshIcon);
  refreshIcon();
})();
