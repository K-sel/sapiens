document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('sectionChanged', handleSectionChanged);
});

function handleSectionChanged(event) {
    const { id, index } = event.detail;

    if (id === 'revolution-section') {
        initCognitiveInteractions();
    }
}

// Variables pour gérer l'état du défilement
let scrollPosition = 0;

function disableScroll() {
    scrollPosition = window.pageYOffset;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';

    if (window.scrollamaControls && typeof window.scrollamaControls.disable === 'function') {
        window.scrollamaControls.disable();
    }

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventScrollKeydown, { passive: false });
}

function enableScroll() {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    const revolutionSection = document.querySelector('#revolution-section');
    if (revolutionSection) {
        const sectionTop = revolutionSection.getBoundingClientRect().top + window.pageYOffset;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'auto'
        });
        
        const sections = Array.from(document.querySelectorAll('.step'));
        const revolutionIndex = sections.indexOf(revolutionSection);
        if (revolutionIndex !== -1 && window.scroller && typeof window.scroller.go === 'function') {
            window.scroller.go(revolutionIndex);
        } else {
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('is-active');
            });
            revolutionSection.classList.add('is-active');
        }
    }
    
    if (window.scrollamaControls && typeof window.scrollamaControls.enable === 'function') {
        window.scrollamaControls.enable();
    }
    
    if (window.scroller && typeof window.scroller.resize === 'function') {
        setTimeout(() => window.scroller.resize(), 10);
    }
    
    window.removeEventListener('wheel', preventScroll, { passive: false });
    window.removeEventListener('touchmove', preventScroll, { passive: false });
    window.removeEventListener('keydown', preventScrollKeydown, { passive: false });
    
    setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 50);
}

// Bloque tout événement de défilement
function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

// Bloque les touches de défilement
function preventScrollKeydown(e) {
    const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    if (keys.includes(e.keyCode)) {
        e.preventDefault();
        return false;
    }
}

function initCognitiveInteractions() {
    const revSection = document.querySelector("#revolution-section");
    const cognitiveIcon = document.querySelector("#icon-cognitive");

    if (!revSection || !cognitiveIcon) {
        console.error("Éléments requis non trouvés :",
            !revSection ? "#revolution-section manquant" : "",
            !cognitiveIcon ? "#icon-cognitive manquant" : "");
        return;
    }

    cognitiveIcon.addEventListener("click", function () {
        disableScroll();
        revSection.innerHTML = popupHtml;

        const backArrow = document.querySelector(".popup-arrow");
        if (backArrow) {
            backArrow.addEventListener("click", function () {
                revSection.innerHTML = defaultHTML;
                enableScroll();
                initCognitiveInteractions();
            });
        }
    });
}

const defaultHTML = `
      <div class="text">
              <div class="section-description">
                <h2 class="section-title">Les 3 grandes révolutions humaines</h2>
                <p class="section-text">
                  La trajectoire de l'humanité a été façonnée par trois moments
                  charnières qui ont redéfini notre existence et notre rapport au
                  monde. Ces révolutions fondamentales représentent des sauts
                  évolutifs spectaculaires dans notre histoire collective,
                  transformant radicalement notre manière de penser, de vivre et
                  d'interagir avec notre environnement. <br />De la naissance de notre
                  conscience moderne il y a 70 000 ans, en passant par la
                  domestication de la nature il y a 12 000 ans, jusqu'à l'émergence de
                  la méthode scientifique il y a cinq siècles, chaque révolution a
                  créé un nouvel horizon de possibilités et a fondamentalement altéré
                  le cours de notre destin. Comprendre ces trois grandes
                  transformations nous permet de saisir non seulement d'où nous
                  venons, mais aussi les forces profondes qui continuent de façonner
                  notre présent et notre futur.
                </p>
              </div>
            </div>
            <img
        src="/src/assets/images/click_arrow_left.svg"
        alt="Click here Arrow"
        id="revolution_click_arrow1"
      />
      <img
        src="/src/assets/images/click_arrow_right.svg"
        alt="Click here Arrow"
        id="revolution_click_arrow2"
      />
      <img
        src="/src/assets/images/click_arrow_right.svg"
        alt="Click here Arrow"
        id="revolution_click_arrow3"
      />
      <div id="revolution-illustration">
        <div id="revolution-svg-container">
          <div id="rev-left">
            <img
              src="/src/assets/images/ble.png"
              alt="Révolution agricole"
              id="icon-agricole"
            />
            <figcaption id="figcaption-agricole">
              <strong>La révolution agricole</strong> <br />
              Introduction de l'agriculture, marquant une transition vers la
              sédentarité et l'organisation en sociétés structurées.
            </figcaption>
          </div>
          <div id="rev-center">
            <img
              src="/src/assets/images/time_arrow_rev.svg"
              alt="Flèche du temps"
              id="time-arrow"
            />
          </div>
          <div id="rev-right">
            <img
              src="/src/assets/images/cerveau2.png"
              alt="Révolution cognitive"
              id="icon-cognitive"
            />
            <figcaption id="figcaption-cognitive">
              <strong>La révolution cognitive</strong> <br />
              Apparition de la pensée abstraite, de l'imagination ainsi que du
              langage complexe et de nouvelles formes de coopération entre
              humains.
            </figcaption>
  
            <img
              src="/src/assets/images/main.png"
              alt="Révolution scientifique"
              id="icon-scientifique"
            />
            <figcaption id="figcaption-scientifique">
              <strong>La révolution scientifique </strong> <br />
              Transformation de la compréhension du monde, apportant des
              avancées technologiques et sociales profondes.
            </figcaption>
          </div>
        </div>
      </div>`;

const popupHtml = `
          <section id="popup-cognitive">
        <div class="text">
          <div class="section-description">
            <h2 class="section-title">
              Les avantages de la révolution cognitive
            </h2>
            <p class="section-text">
              L'émergence des facultés mentales supérieures telles que
              l'imagination a catapulté l'être humain à la tête du règne animal,
              sa nouvelle aptitude à conceptualiser l'abstrait lui conférant une
              suprématie quasi mystique sur l'ensemble du monde vivant.
            </p>
            <img
              alt="Flèche pour revenir en arrière"
              src="/src/assets/images/popup_arrow.svg"
              class="popup-arrow"
            />
          </div>
        </div>
        <div id="cognitive-container">
          <img
            alt="Graphique illustrant la révolution cognitive"
            src="/src/assets/images/popup-cognitive.png"
            id="cognitive-image"
          />
        </div>
      </section>
      `;