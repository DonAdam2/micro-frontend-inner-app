import { useEffect, useRef, useState } from 'react';
//components
import Slide from './Slide';

// Matches the 0.5s slide transition in the stylesheet.
const SLIDE_TRANSITION_MS = 500;

const Carousel = ({ slides, isPageBackground }) => {
  const [slideIndex, setSlideIndex] = useState(0),
    sectionRef = useRef(null);

  // A mouse click releases the button's focus; otherwise the next keyboard arrow press
  // counts as keyboard use and the browser draws the focus ring around it.
  // `detail` is 0 for Enter/Space, so a keyboard user's focus stays put.
  const releaseMouseFocus = (e) => {
    if (e.detail > 0) {
      e.currentTarget.blur();
    }
  };

  const handlePrevSlide = (e) => {
    releaseMouseFocus(e);
    setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    releaseMouseFocus(e);
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  // ← / → step through the slides, Home / End jump to the first / last one.
  // The keys are handled only while the carousel is on screen, so they don't take over the arrows of the
  // rest of the page (e.g. the host app) once the user scrolls away from it.
  useEffect(() => {
    let lastStepAt = 0,
      isVisible = false;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const handleKeyDown = (e) => {
      if (!isVisible || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      // leave the arrows alone while the user is typing somewhere
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      const count = slides.length;
      const keyActions = {
        ArrowLeft: (prev) => (prev === 0 ? count - 1 : prev - 1),
        ArrowRight: (prev) => (prev + 1) % count,
        Home: () => 0,
        End: () => count - 1,
      };
      const action = keyActions[e.key];
      if (!action) {
        return;
      }

      e.preventDefault();
      // a held key repeats ~30 times a second; take one step per slide animation instead
      const now = performance.now();
      if (e.repeat && now - lastStepAt < SLIDE_TRANSITION_MS) {
        return;
      }
      lastStepAt = now;
      setSlideIndex(action);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length]);

  return (
    <section ref={sectionRef} className="slidesWrapper" aria-roledescription="carousel">
      <div className="slides">
        <button
          type="button"
          className="prevSlideBtn"
          aria-label="Previous slide"
          onClick={handlePrevSlide}
        >
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>

        {[...slides, ...slides, ...slides].map((slide, i) => {
          // Positive offset sits to the right, so "next" brings the right-hand slide in.
          const offset = i - (slides.length + slideIndex),
            data = typeof slide === 'string' ? { image: slide } : slide;

          return (
            <Slide
              key={i}
              image={data.image}
              title={data.title}
              subtitle={data.subtitle}
              description={data.description}
              offset={offset}
              isPageBackground={isPageBackground}
            />
          );
        })}

        <button
          type="button"
          className="nextSlideBtn"
          aria-label="Next slide"
          onClick={handleNextSlide}
        >
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default Carousel;
