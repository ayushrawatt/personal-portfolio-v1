// About Me Application Plugin
export default function(container, win) {
  container.innerHTML = `
    <div class="about-container">
      <div class="about-banner">> AYUSH RAWAT v2.0
  _  _   _ _  _ ____ _  _ 
 /_\\  \\_/  |  | [__  |__| 
/   \\  |   |__| ___] |  | 

____ ____ _  _ ____ ___ 
|__/ |__| |  | |__|  |  
|  \\ |  | |/\\| |  |  |  
      </div>
      
      <div class="about-section">
        <div class="about-title">👤 PROFILE INFO</div>
        <div><strong>Name:</strong> Ayush Rawat</div>
        <div><strong>Title:</strong> Full Stack Software Engineer</div>
        <div><strong>Location:</strong> Chandigarh, India</div>
        <div><strong>Status:</strong> Active (Available for hiring/contracts)</div>
      </div>

      <div class="about-section">
        <div class="about-title">📖 BIOGRAPHY</div>
        <div style="text-align: justify; font-size:12px;">
          I am a passionate software developer who loves creating interactive, high-performance web experiences. 
          I specialize in building modular JavaScript apps, Astro sites, custom design systems, and robust backend systems. 
          When I'm not coding, I'm researching terminal themes, retro gaming consoles, or artificial intelligence systems.
        </div>
      </div>

      <div class="about-section">
        <div class="about-title">🏆 AWARDS & CERTIFICATIONS</div>
        <div style="font-size:12px;">
          • 🥇 Winner - National Hackathon 2024 (Best UI/UX)<br>
          • 💻 Certified AWS Cloud Developer Associate<br>
          • 🛡️ Advanced CyberSecurity Specialist Certification (2025)
        </div>
      </div>

      <div class="about-section">
        <div class="about-title">📞 TRANSMIT / CONTACT</div>
        <div class="about-link-container">
          <a href="https://github.com/ayushrawatt" target="_blank" class="about-btn">📁 GitHub</a>
          <a href="https://linkedin.com" target="_blank" class="about-btn">💼 LinkedIn</a>
          <button id="about-copy-email" class="about-btn">📧 Copy Email</button>
        </div>
      </div>
    </div>
  `;

  // Email copy event
  const copyBtn = container.querySelector('#about-copy-email');
  copyBtn.addEventListener('click', () => {
    const email = 'ayush.rawat@example.com';
    navigator.clipboard.writeText(email).then(() => {
      if (window.OS && typeof window.OS.windows.terminal !== 'undefined') {
        window.OS.windows.terminal.querySelector('.terminal-history').innerHTML += `\n[System] Email address copied to clipboard: ${email}\n`;
      }
      alert('Email copied to clipboard: ' + email);
    });
  });

  return {
    destroy: () => {
      // Clean up event listeners if any
    }
  };
}
