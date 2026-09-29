// INVICTUS Training Center: scroll motion, modelled on the Teeej site's curtain.js.
//
// 1. Curtain (home, every screen that can hold the hero): the hero pins while its photo slowly zooms and its
//    copy fades up and away, then the white programs section rises over it like
//    a theatre curtain. Reverses on scroll-up. Needs GSAP + ScrollTrigger.
// 2. Fade-in: headings, copy and a few whole blocks rise 22px into place as they
//    scroll into view, and replay each time they come back.
// 3. Side-in: two-column rows (coaches photo + panel, the About panel + photo)
//    slide in from their own edge.
// 4. FAQ: answers slide open and shut instead of snapping.
//
// Everything bails under reduced motion, and none of it hides content unless
// the script is running: the classes that start things at opacity 0 are only
// ever added from here.

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const SCRUB = 0.4; // seconds the scrubbed timeline takes to catch up (Teeej's value)

  // One observer for fade-in and side-in. Toggling (not just adding) .is-visible
  // makes each reveal replay every time, as on Teeej.
  const observe = (els, rootMargin) => {
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("is-visible", e.isIntersecting));
    }, { rootMargin, threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  };

  // ---- side-in: desktop only; below 1001px the columns stack ----
  const SIDES = ".coaches__photo, .coaches__panel, .about-hero__bg, .about-panel";
  const sides = window.matchMedia("(min-width: 1001px)").matches;
  if (sides) {
    const cols = [...document.querySelectorAll(SIDES)];
    const midX = window.innerWidth / 2;
    cols.forEach((col) => {
      const r = col.getBoundingClientRect();
      col.classList.add(r.left + r.width / 2 < midX ? "side-in-left" : "side-in-right");
    });
    observe(cols, "0px 0px -12% 0px");
  }

  // ---- fade-in ----
  // Whole blocks fade as one, so nothing inside them animates twice. Side-in
  // columns are skipped only where they slide; on phones their copy fades.
  const UNITS = ".program, .carousel, .faq-item, .location__map";
  const SKIP = [".hero", ".site-header", ".sticky-cta", sides && SIDES].filter(Boolean).join(", ");
  const fades = [...document.querySelectorAll(`.h2, .h3, p, .rule, ${UNITS}`)].filter(
    (el) => !el.closest(SKIP) && !(el.parentElement && el.parentElement.closest(UNITS))
  );
  fades.forEach((el) => el.classList.add("fade-in"));
  observe(fades, "0px 0px -10% 0px");

  // ---- FAQ: animate the <details> open and shut ----
  document.querySelectorAll(".faq-item").forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq-item__answer");
    if (!summary || !answer || !answer.animate) return;
    let anim = null;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      const closing = item.open && !item.classList.contains("is-closing");
      const from = item.open ? answer.getBoundingClientRect().height : 0;
      if (anim) anim.cancel();
      item.classList.toggle("is-closing", closing);
      item.open = true;
      const pad = getComputedStyle(answer).paddingBottom;
      const full = answer.getBoundingClientRect().height;
      const frames = closing
        ? [{ height: `${from}px`, paddingBottom: pad }, { height: "0px", paddingBottom: "0px" }]
        : [{ height: `${from}px`, paddingBottom: from ? pad : "0px" }, { height: `${full}px`, paddingBottom: pad }];
      answer.style.overflow = "hidden";
      const run = answer.animate(frames, { duration: 260, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
      anim = run;
      // A cancelled run (clicked again mid-way) rejects, and the new run takes over.
      run.finished.then(() => {
        if (anim !== run) return;
        anim = null;
        answer.style.overflow = "";
        if (closing) { item.open = false; item.classList.remove("is-closing"); }
      }, () => {});
    });
  });

  // ---- curtain: home hero, desktop and phones ----
  const hero = document.querySelector(".hero");
  const cover = document.querySelector(".programs");
  if (!hero || !cover || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // A phone's address bar grows and shrinks the viewport as you scroll. Don't
  // re-measure the pin for that, or it jumps mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Landscape phones are too short for it.
  gsap.matchMedia().add("(min-height: 480px)", () => {
    document.documentElement.classList.add("is-curtain");
    // The hero has to be exactly one screen tall to pin cleanly, and its copy
    // sits at the bottom, so if this screen can't hold all of it (a small phone,
    // a short window), keep the plain scroll.
    if (hero.offsetHeight > window.innerHeight + 1) {
      document.documentElement.classList.remove("is-curtain");
      return;
    }
    // Pull the cover up one screen so it rides over the pinned hero through
    // normal flow (the pin adds 170% of spacing below the hero).
    cover.style.marginTop = "-100svh";

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=170%",
        pin: true,
        scrub: SCRUB,
        anticipatePin: 1,
      },
    });
    tl.fromTo(hero.querySelectorAll(".hero__bg img, .hero__video"), { scale: 1 }, { scale: 1.16, ease: "none", duration: 1 }, 0);
    tl.to(hero.querySelector(".hero__content"), { opacity: 0, y: -42, ease: "none", duration: 0.5 }, 0);

    ScrollTrigger.refresh();
    return () => {
      document.documentElement.classList.remove("is-curtain");
      cover.style.marginTop = "";
    };
  });
})();
