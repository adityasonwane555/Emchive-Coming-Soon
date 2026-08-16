/* ==========================================================================
   EMCHIVE.COM — INTERACTIVE SCRIPTS & BEHAVIOR
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFormHandler();
  initCopyLink();
  initParallaxCards();
  initScrollAnimations();
});

/* ==========================================================================
   SUPABASE CONFIGURATION
   Replace these placeholders with your Supabase Project URL and Anon Public Key
   ========================================================================== */
const SUPABASE_CONFIG = {
  url: 'https://vufysejldaaagwwkpzym.supabase.co',
  anonKey: 'sb_publishable_oqLYFAXPrKFbHEqRbG3Lpw_LFwOiScq'
};

/**
 * Handle Launch Notification Interest Form
 */
function initFormHandler() {
  const form = document.getElementById('notify-form');
  const input = document.getElementById('notify-email');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !validateEmail(email)) {
      showToast('⚠️ Please enter a valid email address.');
      input.focus();
      return;
    }

    // Check if configuration has been supplied
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('YOUR_SUPABASE_PROJECT_URL')) {
      showToast('⚙️ Supabase credentials pending setup. Check script.js');
      return;
    }

    // Set UI loading state
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Notify Me';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      const endpoint = `${SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/waitlist`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (response.status === 201 || response.ok) {
        showToast(`✨ You're on the list! We'll notify ${email} at launch.`);
        input.value = '';
      } else {
        const errorData = await response.json().catch(() => null);
        
        // Supabase error code 23505 is unique violation (already registered)
        if (errorData && (errorData.code === '23505' || (errorData.message && errorData.message.includes('duplicate')))) {
          showToast(`✨ You're already on the waitlist with ${email}!`);
          input.value = '';
        } else {
          console.error('Supabase error:', errorData);
          showToast('⚠️ Could not save email. Please try again in a moment.');
        }
      }
    } catch (err) {
      console.error('Network submission error:', err);
      showToast('⚠️ Network connection error. Please check your internet.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Copy Domain Link to Clipboard
 */
function initCopyLink() {
  const copyBtn = document.getElementById('btn-copy-link');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const domainText = 'https://emchive.com';
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(domainText).then(() => {
        showToast('📋 Copied emchive.com to clipboard!');
      }).catch(() => {
        fallbackCopyText(domainText);
      });
    } else {
      fallbackCopyText(domainText);
    }
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('📋 Copied emchive.com to clipboard!');
  } catch (err) {
    showToast('emchive.com');
  }
  document.body.removeChild(textArea);
}

/**
 * Interactive Toast Notification
 */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('feedback-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'feedback-toast';
    toast.className = 'feedback-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/**
 * Desktop Mouse Move Micro-Parallax for Collage Cards
 */
function initParallaxCards() {
  const collage = document.querySelector('.collage-wrapper');
  const cards = document.querySelectorAll('.memory-card');

  if (!collage || !cards.length || window.innerWidth < 992) return;

  collage.addEventListener('mousemove', (e) => {
    const rect = collage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    cards.forEach((card, index) => {
      const factor = (index % 3 + 1) * 0.015;
      const rotateBase = parseFloat(card.dataset.rotation || '0');
      const moveX = x * factor;
      const moveY = y * factor;
      
      card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotateBase}deg)`;
    });
  });

  collage.addEventListener('mouseleave', () => {
    cards.forEach((card) => {
      const rotateBase = parseFloat(card.dataset.rotation || '0');
      card.style.transform = `rotate(${rotateBase}deg)`;
    });
  });
}

/**
 * Smooth Entrance Reveal on Scroll
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.hero-content, .collage-wrapper, .essence-box, .launch-card');

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}
