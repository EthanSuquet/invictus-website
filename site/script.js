// INVICTUS Training Center: mobile menu, coach switcher, review arrows, and a
// notice for links whose destination has not been supplied yet.
// Everything degrades: without JS the menu wraps, every coach and FAQ is readable.

(() => {
  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Coaches: one open at a time. The open coach reads as a heading and bio; the
  // rest are the boxed buttons from the design.
  document.querySelectorAll("[data-coaches]").forEach((list) => {
    const coaches = [...list.querySelectorAll(".coach")];
    coaches.forEach((coach) => {
      coach.querySelector("button").addEventListener("click", () => {
        coaches.forEach((c) => {
          const open = c === coach;
          c.classList.toggle("is-open", open);
          c.querySelector("button").setAttribute("aria-expanded", String(open));
          c.querySelector(".coach__bio").hidden = !open;
        });
      });
    });
  });

  // Review wheel: the arrows step one card and wrap around at either end, and
  // it turns on its own every 6s while on screen. It stops for good once
  // someone uses the arrows or swipes, pauses while hovered or focused, and
  // never moves for people who ask for reduced motion.
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.querySelector(".carousel__arrow--prev");
    const next = carousel.querySelector(".carousel__arrow--next");
    const step = () => {
      const card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 0;
    };
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth;
      if (dir > 0 && track.scrollLeft >= max - 2) track.scrollTo({ left: 0, behavior: "smooth" });
      else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max, behavior: "smooth" });
      else track.scrollBy({ left: dir * step(), behavior: "smooth" });
    };

    let stopped = false, hovered = false, focused = false, inView = false;
    const stop = () => { stopped = true; };
    prev.addEventListener("click", () => { stop(); go(-1); });
    next.addEventListener("click", () => { stop(); go(1); });
    track.addEventListener("pointerdown", stop);
    track.addEventListener("wheel", stop, { passive: true });
    carousel.addEventListener("mouseenter", () => { hovered = true; });
    carousel.addEventListener("mouseleave", () => { hovered = false; });
    carousel.addEventListener("focusin", () => { focused = true; });
    carousel.addEventListener("focusout", () => { focused = false; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.5 }).observe(track);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setInterval(() => {
      if (!stopped && !hovered && !focused && inView && !reduce.matches && !document.hidden) go(1);
    }, 6000);
  });

  // Reviews: "Read more" appears only on cards whose text is clamped.
  document.querySelectorAll(".review").forEach((card) => {
    const text = card.querySelector(".review__text");
    const more = card.querySelector(".review__more");
    if (!text || !more) return;
    const check = () => {
      if (!card.classList.contains("is-expanded")) more.hidden = text.scrollHeight <= text.clientHeight + 2;
    };
    more.addEventListener("click", () => {
      const open = card.classList.toggle("is-expanded");
      more.textContent = open ? "Show less" : "Read more";
      more.setAttribute("aria-expanded", String(open));
    });
    check();
    window.addEventListener("resize", check);
    if (document.fonts) document.fonts.ready.then(check);
  });

  // Hotlinked Google avatars: if one fails, fall back to the initial beneath it.
  document.querySelectorAll(".review__avatar img").forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop);
  });

  // Pinned Get Started: show it once most of the hero has scrolled away.
  const cta = document.querySelector(".sticky-cta");
  const hero = document.querySelector(".hero");
  if (cta && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      cta.classList.toggle("is-visible", entry.intersectionRatio < 0.4);
    }, { threshold: [0, 0.4, 1] }).observe(hero);
  } else if (cta) {
    cta.classList.add("is-visible");
  }

  // Links with no destination yet (Get Started, Schedule, socials) say so
  // rather than jumping to the top of the page.
  let toast, timer;
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-todo]");
    if (!link) return;
    e.preventDefault();
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.append(toast);
    }
    toast.textContent = `${link.dataset.todo}: link coming soon`;
    toast.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });
})();
