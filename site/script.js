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

  // Review carousel arrows: step one card, disable at either end.
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.querySelector(".carousel__arrow--prev");
    const next = carousel.querySelector(".carousel__arrow--next");
    const step = () => {
      const card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 0;
    };
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

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
