import { useEffect, useRef } from 'react';

// Phones follow a touch with emulated mouse events; ignore those for this long.
const EMULATED_MOUSE_WINDOW_MS = 800;

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Tracks the pointer or finger and marks the card with `data-tilting` while it is on it.
// The stylesheet tilts on that attribute rather than `:hover`, which phones only apply
// after the finger lifts. The tilt's timing lives in the stylesheet, so a card that
// slides away from under a resting pointer keeps the normal slide transition.
const UseTilt = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let rect;
    let frame = 0;
    let pending;
    let lastTouchAt = -Infinity;

    const isEmulatedMouse = () => performance.now() - lastTouchAt < EMULATED_MOUSE_WINDOW_MS;

    // one style write per frame, however many move events arrive
    const flush = () => {
      frame = 0;
      if (!pending || !rect) {
        return;
      }
      const px = clamp01((pending.clientX - rect.left) / rect.width);
      const py = clamp01((pending.clientY - rect.top) / rect.height);
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };

    const track = (point) => {
      pending = point;
      if (!frame) {
        frame = requestAnimationFrame(flush);
      }
    };

    const start = () => {
      // measured on every start, so a scroll or resize never leaves it stale
      rect = el.getBoundingClientRect();
      el.setAttribute('data-tilting', '');
    };

    const end = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pending = undefined;
      rect = undefined;
      el.removeAttribute('data-tilting');
      el.style.setProperty('--px', '0.5');
      el.style.setProperty('--py', '0.5');
    };

    const handleMouseEnter = () => {
      if (!isEmulatedMouse()) {
        start();
      }
    };

    const handleMouseMove = (e) => {
      if (isEmulatedMouse()) {
        return;
      }
      if (!rect) {
        start();
      }
      track(e);
    };

    const handleMouseLeave = () => {
      if (!isEmulatedMouse()) {
        end();
      }
    };

    const handleTouchStart = (e) => {
      lastTouchAt = performance.now();
      start();
      track(e.touches[0]);
    };

    const handleTouchMove = (e) => {
      lastTouchAt = performance.now();
      // Only the centre card tilts, so only its drag is kept from scrolling the page.
      // Backs up `touch-action: none` for browsers that ignore it.
      if (e.cancelable && el.closest('.slide')?.hasAttribute('data-active')) {
        e.preventDefault();
      }
      track(e.touches[0]);
    };

    const handleTouchEnd = () => {
      lastTouchAt = performance.now();
      end();
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    // not passive: the handler may cancel the scroll
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return ref;
};

export default UseTilt;
