import { useEffect, useRef } from 'react';

interface UseSectionSnapScrollOptions {
  enabled: boolean;
  sectionCount: number;
  currentSection: number;
}

const SCROLL_LOCK_MS = 900;

export const useSectionSnapScroll = ({
  enabled,
  sectionCount,
  currentSection
}: UseSectionSnapScrollOptions) => {
  const isAnimatingRef = useRef(false);
  const currentSectionRef = useRef(currentSection);
  const sectionCountRef = useRef(sectionCount);
  const targetSectionRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  useEffect(() => {
    sectionCountRef.current = sectionCount;
  }, [sectionCount]);

  useEffect(() => {
    if (!enabled || sectionCountRef.current <= 0) return undefined;

    const clearLock = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isAnimatingRef.current = false;
      targetSectionRef.current = null;
    };

    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.scroll-section'));

    const scrollToSection = (index: number) => {
      const sections = getSections();
      const targetElement = sections[index];
      const fallbackTop = index * window.innerHeight;
      const targetTop = targetElement ? targetElement.offsetTop : fallbackTop;

      targetSectionRef.current = index;
      isAnimatingRef.current = true;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(clearLock, SCROLL_LOCK_MS);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 5) return;
      event.preventDefault();
      if (isAnimatingRef.current) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextSection = Math.min(
        Math.max(currentSectionRef.current + direction, 0),
        sectionCountRef.current - 1
      );

      if (nextSection === currentSectionRef.current) return;
      scrollToSection(nextSection);
    };

    const handleScroll = () => {
      if (targetSectionRef.current === null) return;
      const sections = getSections();
      const targetElement = sections[targetSectionRef.current];
      const fallbackTop = targetSectionRef.current * window.innerHeight;
      const targetTop = targetElement ? targetElement.offsetTop : fallbackTop;

      if (Math.abs(window.scrollY - targetTop) < 2) {
        clearLock();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      clearLock();
    };
  }, [enabled]);
};
