// Web Audio API Procedural Chiptune Synthesizer Plugin

const TRACKS = [
  {
    name: 'Cyber Grid Runner',
    tempo: 140,
    type: 'square',
    notes: [
      { f: 220, d: 1 }, { f: 220, d: 1 }, { f: 330, d: 1 }, { f: 330, d: 1 },
      { f: 293, d: 1 }, { f: 293, d: 1 }, { f: 440, d: 2 },
      { f: 220, d: 1 }, { f: 220, d: 1 }, { f: 330, d: 1 }, { f: 330, d: 1 },
      { f: 392, d: 1 }, { f: 349, d: 1 }, { f: 330, d: 2 }
    ]
  },
  {
    name: 'Deep Space Ambient',
    tempo: 90,
    type: 'triangle',
    notes: [
      { f: 147, d: 2 }, { f: 220, d: 2 }, { f: 261, d: 2 }, { f: 329, d: 4 },
      { f: 196, d: 2 }, { f: 293, d: 2 }, { f: 349, d: 2 }, { f: 440, d: 4 }
    ]
  }
];

export default function(container, win) {
  container.innerHTML = `
    <div class="music-container">
      <div class="music-track-info" id="music-title">Procedural Synth - Paused</div>
      <div class="music-visualizer" id="m-visuals">
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
        <div class="visualizer-bar" style="height: 10%"></div>
      </div>
      <div class="music-controls">
        <button class="game-btn" id="synth-play-btn">▶ Play</button>
        <button class="game-btn" id="synth-track-btn">🔀 Next Track</button>
      </div>
      <div style="font-size:10px; color:#5f74a0; text-align:center;">
        Generated procedurally via Web Audio API oscillators.
      </div>
    </div>
  `;

  const playBtn = container.querySelector('#synth-play-btn');
  const trackBtn = container.querySelector('#synth-track-btn');
  const trackTitle = container.querySelector('#music-title');
  const bars = container.querySelectorAll('.visualizer-bar');

  let audioCtx = null;
  let isPlaying = false;
  let currentTrackIdx = 0;
  let noteIdx = 0;
  let playTimeout = null;
  let visualInterval = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playNote(freq, duration, type = 'square') {
    if (!audioCtx) return;
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // ADSR Envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration - 0.05); // Decay/Sustain

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playLoop() {
    if (!isPlaying) return;

    const track = TRACKS[currentTrackIdx];
    const note = track.notes[noteIdx];
    
    const stepDuration = (60 / track.tempo) * note.d;
    playNote(note.f, stepDuration, track.type);

    noteIdx = (noteIdx + 1) % track.notes.length;
    playTimeout = setTimeout(playLoop, stepDuration * 1000);
  }

  function togglePlay() {
    initAudio();
    
    if (isPlaying) {
      // Pause
      isPlaying = false;
      playBtn.textContent = '▶ Play';
      trackTitle.textContent = 'Procedural Synth - Paused';
      clearTimeout(playTimeout);
      clearInterval(visualInterval);
      
      // Reset visualizer bars
      bars.forEach(b => b.style.height = '10%');
    } else {
      // Play
      isPlaying = true;
      playBtn.textContent = '⏸ Pause';
      const track = TRACKS[currentTrackIdx];
      trackTitle.textContent = track.name;
      
      playLoop();
      startVisualizer();
    }
  }

  function nextTrack() {
    noteIdx = 0;
    currentTrackIdx = (currentTrackIdx + 1) % TRACKS.length;
    
    if (isPlaying) {
      clearTimeout(playTimeout);
      const track = TRACKS[currentTrackIdx];
      trackTitle.textContent = track.name;
      playLoop();
    } else {
      trackTitle.textContent = `Next up: ${TRACKS[currentTrackIdx].name}`;
    }
  }

  function startVisualizer() {
    visualInterval = setInterval(() => {
      bars.forEach(b => {
        // Generate a random height when playing
        const height = isPlaying ? Math.floor(Math.random() * 85) + 15 : 10;
        b.style.height = `${height}%`;
      });
    }, 100);
  }

  // Click listeners
  playBtn.addEventListener('click', togglePlay);
  trackBtn.addEventListener('click', nextTrack);

  return {
    destroy: () => {
      isPlaying = false;
      clearTimeout(playTimeout);
      clearInterval(visualInterval);
      if (audioCtx) {
        audioCtx.close();
      }
    }
  };
}
