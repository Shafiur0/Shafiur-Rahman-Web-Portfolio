import { useEffect, useRef, useState } from "react";

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  triggerOnce = true,
} = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
}

export default function ScrollReveal({
  children,
  className = "",
  animation = "fade-in-up",
  duration = "0.8s",
  delay = "0s",
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
}) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`${className} scroll-reveal-${animation}`}
      style={{
        animationPlayState: isVisible ? "running" : "paused",
        animationDuration: duration,
        animationDelay: delay,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
