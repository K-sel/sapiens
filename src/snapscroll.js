// Variables globales
let isScrolling = false;
const scrollCooldown = 1000; // Temps minimum entre les défilements (en ms)
let accumulatedDelta = 0; // Pour suivre le défilement cumulé
const deltaThreshold = 5; // Seuil pour déclencher un changement de section

// Gestionnaire de défilement amélioré
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

// Fonction pour défiler vers une section spécifique
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

// Initialisation du snap scrolling
export function initSnapScroll() {
  // Ajouter l'écouteur d'événements pour le défilement
  window.addEventListener('wheel', handleWheelEvent, { passive: false });
  
  // Ajouter l'écouteur pour le défilement depuis le footer
  window.addEventListener('wheel', handleFooterScroll, { passive: false });
  
  // Configurer la réinitialisation du delta accumulé
  resetAccumulatedDelta();
}

export default initSnapScroll;