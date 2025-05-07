import * as d3 from 'd3';
import scrollama from 'scrollama';
import { illustrations } from './assets/illustrations';
import initSnapScroll from './snapscroll.js';

const scrolly = d3.select("#scrolly");
const article = scrolly.select("article");
const step = article.selectAll(".step");
const scroller = scrollama();
let isScrolling = false;
const scrollCooldown = 4000;
let accumulatedDelta = 0;
const deltaThreshold = 50;

function handleResize() {
  const stepHeight = window.innerHeight;
  step.style("height", stepHeight + "px");
  scroller.resize();
}

function handleStepEnter(response) {
  console.log(response);
  illustrationDisplay(response);
  displayText(response);

  step.classed("is-active", function (d, i) {
    return i === response.index;
  });

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

function handleWheelEvent(e) {
  const footer = document.querySelector('footer');
  const isInFooter = footer.contains(e.target) || footer === e.target ||
    document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 10;

  if (isInFooter) {
    return;
  }

  e.preventDefault();

  if (isScrolling) return;

  accumulatedDelta += e.deltaY;

  const header = document.querySelector('header');
  const headerContainsTarget = header.contains(e.target) || header === e.target ||
    document.documentElement.scrollTop < window.innerHeight;

  if (headerContainsTarget && accumulatedDelta > deltaThreshold) {
    const firstSection = document.querySelector('.step');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      accumulatedDelta = 0;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    }
    return;
  }

  const sections = Array.from(document.querySelectorAll('.step'));
  const activeSection = document.querySelector('.step.is-active');

  if (!activeSection && !headerContainsTarget) {
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
  const isLastSection = currentIndex === sections.length - 1;

  if (accumulatedDelta > deltaThreshold) {
    if (isLastSection) {
      footer.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      accumulatedDelta = 0;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    } else {
      scrollToSection(currentIndex + 1);
      accumulatedDelta = 0;
    }
  }
  else if (accumulatedDelta < -deltaThreshold) {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    } else {
      header.scrollIntoView({ behavior: 'smooth' });
      isScrolling = true;
      setTimeout(() => { isScrolling = false; }, scrollCooldown);
    }
    accumulatedDelta = 0;
  }
}

function handleFooterScroll(e) {
  const footer = document.querySelector('footer');
  const isInFooter = footer.contains(e.target) || footer === e.target ||
    document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight - 100;

  if (isInFooter && e.deltaY < 0 && !isScrolling) {
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

function resetAccumulatedDelta() {
  let wheelTimeout;

  window.addEventListener('wheel', () => {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      accumulatedDelta = 0;
    }, 200);
  }, { passive: true });
}

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

function init() {
  handleResize();

  scroller
    .setup({
      step: "#scrolly .step",
      offset: 0.5,
      debug: false
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener('wheel', handleWheelEvent, { passive: false });
  window.addEventListener('wheel', handleFooterScroll, { passive: false });
  resetAccumulatedDelta();
  window.addEventListener('resize', handleResize);
}

init();
initSnapScroll();

window.scrollamaControls = {
  disable: function () {
    window.removeEventListener('wheel', handleWheelEvent, { passive: false });
    window.removeEventListener('wheel', handleFooterScroll, { passive: false });
    if (scroller && typeof scroller.disable === 'function') {
      scroller.disable();
    }
  },
  enable: function () {
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    window.addEventListener('wheel', handleFooterScroll, { passive: false });
    if (scroller && typeof scroller.enable === 'function') {
      scroller.enable();
    }
  }
};