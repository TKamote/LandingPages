

  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Sticky Navigation
  window.addEventListener("scroll", () => {
    const nav = document.querySelector("nav");
    if (window.scrollY > 50) {
      nav.style.padding = "10px 0";
    } else {
      nav.style.padding = "20px 0";
    }
  });

  // Back to top button
  const backToTopButton = document.querySelector(".back-to-top");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("active");
    } else {
      backToTopButton.classList.remove("active");
    }
  });

  backToTopButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
        }
      }
    });
  });

  // Testimonial Slider
  const testimonialSlides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  function showSlide(index) {
    // Hide all slides
    testimonialSlides.forEach((slide) => {
      slide.classList.remove("active");
    });

    // Deactivate all dots
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    // Show the current slide
    testimonialSlides[index].classList.add("active");
    dots[index].classList.add("active");

    // Position the slides
    document.querySelector(
      ".testimonial-slides"
    ).style.transform = `translateX(-${index * 100}%)`;
  }

  // Initialize the first slide
  showSlide(0);

  // Set up dot click events
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Auto-advance slides
  setInterval(() => {
    currentSlide = (currentSlide + 1) % testimonialSlides.length;
    showSlide(currentSlide);
  }, 5000);

  // Animate elements on scroll
  function animateOnScroll() {
    // Feature cards animation
    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card, index) => {
      const cardPosition = card.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (cardPosition < screenPosition) {
        setTimeout(() => {
          card.style.opacity = 1;
          card.style.transform = "translateY(0)";
        }, index * 100);
      }
    });

    // Hero image animation
    const heroImage = document.querySelector(".hero-image");
    if (heroImage) {
      heroImage.style.opacity = 1;
    }

    // Testimonial slides animation
    testimonialSlides.forEach((slide) => {
      const slidePosition = slide.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;

      if (slidePosition < screenPosition) {
        slide.style.opacity = 1;
        slide.style.transform = "translateX(0)";
      }
    });
  }

  // Run animation on load
  window.addEventListener("load", animateOnScroll);

  // Run animation on scroll
  window.addEventListener("scroll", animateOnScroll);

