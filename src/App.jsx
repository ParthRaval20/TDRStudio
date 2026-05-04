import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Mail, Globe, ArrowDown, ExternalLink, ChevronRight, Menu, X } from 'lucide-react';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const hasRoared = useRef(false);
  const lenisRef = useRef(null);
  const horizontalRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // One-time reset on mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (lenisRef.current) {
      if (hasEntered) {
        lenisRef.current.start();
      } else {
        lenisRef.current.stop();
      }
    }
  }, [hasEntered]);

  useEffect(() => {
    // Initialize Lenis for premium smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initial setup for Audio
    audioRef.current = new Audio('/mixkit-big-wild-lion-growl-95.wav');
    audioRef.current.volume = 0.5;

    // GSAP Context for safety
    const ctx = gsap.context(() => {

      // ── HERO: Pin the sticky hero, run expansion, then immediately exit ──
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-scene",
          start: "top top",
          end: "bottom top",   // ends as soon as the scene bottom hits viewport top
          scrub: 0.6,          // tight scrub: feels responsive, not floaty
          pin: ".hero-sticky", // pin the visual layer, not the whole scene
        }
      });

      // 1. T → "he" expands
      heroTl.to(".t-sub", { width: "auto", opacity: 1, duration: 1, ease: "power3.out" }, 0);
      // 2. D → "ivine" expands
      heroTl.to(".d-sub", { width: "auto", opacity: 1, duration: 1, ease: "power3.out" }, 0.6);
      // 3. R → "oar" expands
      heroTl.to(".r-sub", { width: "auto", opacity: 1, duration: 1, ease: "power3.out" }, 1.2);

      // 4. "STUDIO" fades in right after Roar
      heroTl.to(".studio-reveal", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "expo.out",
        onStart: () => {
          if (!hasRoared.current && audioRef.current) {
            audioRef.current.play().catch(() => {});
            hasRoared.current = true;
          }
        }
      }, 1.8);

      // 5. Immediately after full name is revealed → fade the whole hero out
      //    No hold state — content follows right away
      heroTl.to(".hero-sticky", {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.inOut"
      }, 2.4);

      // ── HORIZONTAL SCROLL: Projects ──
      if (horizontalRef.current) {
        const getScrollAmount = () => {
          return horizontalRef.current.scrollWidth - window.innerWidth;
        };

        gsap.to(horizontalRef.current, {
          x: () => -(horizontalRef.current.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: ".projects-section",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + horizontalRef.current.scrollWidth,
            invalidateOnRefresh: true,
          }
        });
      }

      // ── NAV: slide in on page load ──
      gsap.fromTo("nav",
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", delay: 0.3 }
      );

      // ── REFRESH: Ensure all triggers are calibrated after layout stabilizes ──
      // Increase delay to ensure wide project cards and images are fully measured
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000);

    }, containerRef);

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const handleEnter = () => {
    window.scrollTo(0, 0);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    if (audioRef.current) {
      // Unlock audio context silently to prevent double roar on mobile
      const prevVolume = audioRef.current.volume;
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = prevVolume;
      }).catch(() => {});
    }
    setHasEntered(true);
  };

  return (
    <div className="main-wrapper" ref={containerRef}>
      {!hasEntered && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: '#050505', zIndex: 999999, 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="splash-title" style={{ color: '#d4af37', fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '2rem', fontWeight: 400 }}>
            The Divine Roar
          </div>
          <button 
             onClick={handleEnter}
             style={{
               padding: '1.2rem 3rem', background: 'transparent',
               border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37',
               cursor: 'pointer', letterSpacing: '0.3em', textTransform: 'uppercase',
               fontFamily: 'var(--font-heading)', borderRadius: '100px',
               transition: '0.4s'
             }}
             onMouseOver={(e) => {
               e.target.style.background = 'rgba(212,175,55,0.05)';
               e.target.style.borderColor = 'rgba(212,175,55,0.6)';
             }}
             onMouseOut={(e) => {
               e.target.style.background = 'transparent';
               e.target.style.borderColor = 'rgba(212,175,55,0.3)';
             }}
          >
             Enter Experience
          </button>
          <p style={{ color: '#555', fontSize: '0.7rem', marginTop: '2rem', letterSpacing: '0.2em' }}>BEST EXPERIENCED WITH SOUND</p>
        </div>
      )}

      <div className="grain-overlay"></div>
      <div className="aurora"></div>
      
      <header>
        <nav className={isMenuOpen ? 'nav-open' : ''}>
          <div className="logo-text">TDR <span className="logo-studio">STUDIO</span></div>
          <button 
            className="nav-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>Studio</a>
            <a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>Forge</a>
            <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Connect</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-scene">
          <div className="hero-sticky">
            <img 
              src="/hero_lion.png" 
              alt="Majestic Lion representation of The Divine Roar Studio" 
              className="hero-visual-bg"
              fetchpriority="high"
              decoding="async"
            />
            <div className="tdr-container">
              <h1 className="sr-only">The Divine Roar Studio</h1>
              <div className="char-group" aria-hidden="true">
                <span className="main-char">T</span>
                <span className="sub-text t-sub">he</span>
              </div>
              <div className="char-group" aria-hidden="true">
                <span className="main-char">D</span>
                <span className="sub-text d-sub">ivine</span>
              </div>
              <div className="char-group" aria-hidden="true">
                <span className="main-char">R</span>
                <span className="sub-text r-sub">oar</span>
              </div>
            </div>
            <div className="studio-reveal">STUDIO</div>
            <div className="scroll-hint">
              <span>Scroll</span>
              <ArrowDown size={14} />
            </div>
          </div>
        </section>

      <section id="about">
        <div className="premium-card about-grid">
          <div>
            <div className="section-label">AURORA // 01</div>
            <h2 className="section-title">We don't build projects.<br />We forge digital empires.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px' }}>
              The Divine Roar is a bespoke creative forge dedicated to high-performance AI development, 
              cinematic mobile apps, and elite web architectures. 
              Our code is as sharp as a lion's claw, and our designs command attention.
            </p>
            <div className="stat-chips">
              <div className="chip">AI Development</div>
              <div className="chip">Mobile Apps</div>
              <div className="chip">Elite Web</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10rem', fontFamily: 'var(--font-heading)', fontWeight: 800, opacity: 0.05, lineHeight: 1 }}>01</div>
            <p style={{ color: '#d4af37', letterSpacing: '0.5em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Established 2026</p>
          </div>
        </div>
      </section>

      {/* 'Selected Works' header scrolls in normally BEFORE the pinned section */}
      <div className="forge-header">
        <div className="section-label">THE FORGE // 02</div>
        <h2 className="section-title">Selected Works</h2>
      </div>

        <section id="projects" className="projects-section">
          <div className="horizontal-scroll-container" ref={horizontalRef}>
            <div className="project-card">
              <img 
                src="/project_steel.png" 
                alt="Gayatri Steel industrial management interface" 
                className="project-bg-visual" 
                loading="lazy"
                decoding="async"
              />
              <div className="project-overlay"></div>
              <div className="project-info">
                <span className="project-tag">Industrial Cloud</span>
                <h3>Gayatri Steel</h3>
                <p>Multi-company management suite for high-precision weight calculations and digital challan management.</p>
                <div className="chip" style={{ padding: '0.5rem 1.2rem', fontSize: '0.6rem' }}>View Case Study</div>
              </div>
            </div>

            <a 
              href="https://yojana-ai-seven.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-card" 
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <img 
                src="/project_ai.png" 
                alt="Yojna.ai conversational AI interface" 
                className="project-bg-visual" 
                loading="lazy"
                decoding="async"
              />
              <div className="project-overlay"></div>
              <div className="project-info">
                <span className="project-tag">AI Intelligence</span>
                <h3>Yojna.ai</h3>
                <p>Conversational AI concierge for Government Schemes, bridging the gap between citizens and eligibility.</p>
                <div className="chip" style={{ padding: '0.5rem 1.2rem', fontSize: '0.6rem' }}>Launch Experience</div>
              </div>
            </a>

            <a 
              href="https://gayatri-steel.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-card" 
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <img 
                src="/project_steel_web.png" 
                alt="Gayatri Steel official website" 
                className="project-bg-visual" 
                loading="lazy"
                decoding="async"
              />
              <div className="project-overlay"></div>
              <div className="project-info">
                <span className="project-tag">Corporate Identity</span>
                <h3>Gayatri Steel Web</h3>
                <p>A premium digital presence for a leading industrial steel manufacturer, showcasing their global reach and quality standards.</p>
                <div className="chip" style={{ padding: '0.5rem 1.2rem', fontSize: '0.6rem' }}>Launch Site</div>
              </div>
            </a>

            <div className="project-card" style={{ background: 'rgba(212, 175, 55, 0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Vision Next</h3>
                <p>We are currently accepting new commissions for 2026.</p>
                <a href="#contact" className="chip" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '2rem' }}>Start a Project</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="contact-section">
        <div className="section-label">INITIATE // 03</div>
        <h2 className="section-title">Ready to roar?</h2>
        <a href="mailto:thedivineroarstudio@gmail.com" className="contact-email">
          thedivineroarstudio@gmail.com
        </a>
        
        <div className="kinetic-footer">
          <div>&copy; 2026 THE DIVINE ROAR STUDIO</div>
          <div className="footer-links" style={{ display: 'flex', gap: '2rem' }}>
            {/* Social links removed until accounts are active */}
          </div>
          <div style={{ color: '#d4af37', fontWeight: 800 }}>STRICTLY PREMIUM</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
