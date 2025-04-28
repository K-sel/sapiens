// src/scrollama.js - correction pour le problème de saut de section
import * as d3 from 'd3';
import scrollama from 'scrollama';
import { illustrations } from './assets/illustrations';
import initSnapScroll from './snapscroll.js';

// Variables globales
const scrolly = d3.select("#scrolly");
const article = scrolly.select("article");
const step = article.selectAll(".step");
const scroller = scrollama();
let isScrolling = false;
let lastScrollTime = 0;
const scrollCooldown = 1000; // Temps minimum entre les défilements (en ms)
let accumulatedDelta = 0; // Pour suivre le défilement cumulé
const deltaThreshold = 5; // Seuil pour déclencher un changement de section

// Fonction de redimensionnement
function handleResize() {
  const stepHeight = window.innerHeight;
  step.style("height", stepHeight + "px");
  scroller.resize();
}

// Gestionnaire d'entrée d'étape
function handleStepEnter(response) {
  console.log(response);
  // Afficher l'illustration et le texte pour cette étape
  illustrationDisplay(response);
  displayText(response);

  // Activer uniquement l'étape actuelle
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

  // Déclencher un événement personnalisé indiquant le changement de section
  const sectionEvent = new CustomEvent('sectionChanged', {
    detail: {
      index: response.index,
      id: response.element.id,
      direction: response.direction,
      element: response.element
    }
  });
  document.dispatchEvent(sectionEvent);
}

// Manipulation du défilement
function scrollToSection(index) {
  if (isScrolling) return;

  isScrolling = true;
  const sections = document.querySelectorAll('.step');

  if (index >= 0 && index < sections.length) {
    sections[index].scrollIntoView({ behavior: 'smooth' });
  }

  setTimeout(() => {
    isScrolling = false;
  }, scrollCooldown);
}

// Affichage des illustrations
function illustrationDisplay(response) {
  const illustrationIds = document.querySelectorAll('[id$="-illustration"]');
  const arrowIds = document.querySelectorAll('[id*="arrow"]');

  arrowIds.forEach((element) => {
    element.remove();
  });

  illustrationIds.forEach((element) => {
    element.remove();
  });

  response.element.insertAdjacentHTML("beforeend", illustrations[response.index + 1]);
}

// Affichage du texte
function displayText(response) {
  const activeText = document.querySelectorAll('.section-text');
  activeText.forEach((element) => {
    element.style.display = 'none';
  });

  const currentElement = response.element;
  const sectionText = currentElement.querySelector('.section-text');

  if (sectionText) {
    sectionText.style.display = 'block';
  }

  d3.select(currentElement).select('.section-text').style('display', '');
}

// Gestionnaire de défilement avec détection améliorée
function handleWheelEvent(e) {
  // Vérifier si nous sommes dans le footer
  const footer = document.querySelector('footer');
  const isInFooter = footer.contains(e.target) || footer === e.target ||
    document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 10;

  if (isInFooter) {
    // Permettre le défilement normal dans le footer
    return;
  }

  // Empêcher le défilement par défaut pour toutes les autres zones
  e.preventDefault();

  // Ignorer les défilements pendant une transition
  if (isScrolling) return;

  // Accumuler les deltas de défilement
  accumulatedDelta += e.deltaY;

  // Vérifier si nous sommes dans l'en-tête
  const header = document.querySelector('header');
  const headerContainsTarget = header.contains(e.target) || header === e.target ||
    document.documentElement.scrollTop < window.innerHeight;

  // Si dans l'en-tête et défilement vers le bas dépassant le seuil
  if (headerContainsTarget && accumulatedDelta > deltaThreshold) {
    const firstSection = document.querySelector('.step');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      accumulatedDelta = 0; // Réinitialiser l'accumulation
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    }
    return;
  }

  // Défilement entre les sections
  const sections = Array.from(document.querySelectorAll('.step'));
  const activeSection = document.querySelector('.step.is-active');

  if (!activeSection && !headerContainsTarget) {
    // Si aucune section n'est active et que nous ne sommes pas dans l'en-tête,
    // aller à la première section
    if (sections.length > 0) {
      sections[0].scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      accumulatedDelta = 0;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    }
    return;
  }

  if (!activeSection) return;

  const currentIndex = sections.indexOf(activeSection);

  // Vérifier si nous sommes sur la dernière section
  const isLastSection = currentIndex === sections.length - 1;

  // Défilement vers le bas au-delà du seuil
  if (accumulatedDelta > deltaThreshold) {
    if (isLastSection) {
      // Si nous sommes sur la dernière section, aller au footer
      footer.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      accumulatedDelta = 0;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    } else {
      // Sinon, aller à la section suivante
      scrollToSection(currentIndex + 1);
      accumulatedDelta = 0;
    }
  }
  // Défilement vers le haut au-delà du seuil négatif
  else if (accumulatedDelta < -deltaThreshold) {
    if (currentIndex > 0) {
      // Aller à la section précédente
      scrollToSection(currentIndex - 1);
    } else {
      // Remonter à l'en-tête depuis la première section
      header.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    }
    accumulatedDelta = 0;
  }
}

// Gestionnaire de défilement depuis le footer vers la dernière section
function handleFooterScroll(e) {
  const footer = document.querySelector('footer');
  const isInFooter = footer.contains(e.target) || footer === e.target ||
    document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 100;

  if (isInFooter && e.deltaY < 0 && !isScrolling) {
    // Si nous sommes dans le footer et scrollons vers le haut
    accumulatedDelta += e.deltaY;

    if (accumulatedDelta < -deltaThreshold) {
      e.preventDefault();

      const sections = Array.from(document.querySelectorAll('.step'));
      const lastSection = sections[sections.length - 1];

      if (lastSection) {
        lastSection.scrollIntoView({ behavior: 'smooth' });
        isScrolling = true;
        accumulatedDelta = 0;
        setTimeout(() => { isScrolling = false; }, scrollCooldown);
      }
    }
  }
}

// Réinitialiser l'accumulation de défilement après un délai d'inactivité
function resetAccumulatedDelta() {
  let wheelTimeout;

  window.addEventListener('wheel', () => {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      accumulatedDelta = 0;
    }, 200); // Réinitialiser après 200ms d'inactivité
  }, { passive: true });
}

// Fonction de débogage pour afficher la section active
function debugActiveSection() {
  setInterval(() => {
    const activeSection = document.querySelector('.step.is-active');
    if (activeSection) {
      console.log('Section active:', activeSection.id);
    } else {
      console.log('Aucune section active');
    }
  }, 2000);
}

// Initialisation
function init() {
  // Mettre en place les dimensions
  handleResize();

  // Configurer scrollama
  scroller
    .setup({
      step: "#scrolly .step",
      offset: 0.5,
      debug: false
    })
    .onStepEnter(handleStepEnter);

  // Ajouter l'écouteur d'événements pour le défilement
  window.addEventListener('wheel', handleWheelEvent, { passive: false });

  // Ajouter l'écouteur pour le défilement depuis le footer
  window.addEventListener('wheel', handleFooterScroll, { passive: false });

  // Configurer la réinitialisation du delta accumulé
  resetAccumulatedDelta();

  // Ajouter l'écouteur de redimensionnement
  window.addEventListener('resize', handleResize);

  // Débogage si nécessaire
  // debugActiveSection();
}

// Lancer l'initialisation
init();
initSnapScroll();

// À ajouter à la fin de scrollama.js
window.scrollamaControls = {
  disable: function() {
    window.removeEventListener('wheel', handleWheelEvent, { passive: false });
    window.removeEventListener('wheel', handleFooterScroll, { passive: false });
    if (scroller && typeof scroller.disable === 'function') {
      scroller.disable();
    }
  },
  enable: function() {
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    window.addEventListener('wheel', handleFooterScroll, { passive: false });
    if (scroller && typeof scroller.enable === 'function') {
      scroller.enable();
    }
  }
};