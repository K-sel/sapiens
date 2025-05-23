// src/homo-interaction.js - Version finale
// Données des espèces Homo (fallback si le JSON n'est pas accessible)
const homoSpeciesData = [
    {
        nom: "Homo rudolfensis",
        periode: "2,5 millions d'années",
        description: "Premiers traits du genre Homo, ayant probablement cohabité avec Australopithecus."
    },
    {
        nom: "Homo erectus",
        periode: "2 millions d'années",
        description: "Record de longévité du genre Homo avec une présence de près de 2 millions d'années en Asie orientale. Donnera à l'humanité la maîtrise du feu."
    },
    {
        nom: "Homo soloensis et floresiensis",
        periode: "800 000 Av. J-C",
        description: "Espèces insulaires d'Indonésie, avec Homo floresiensis (environ 25 kg), adapté à un environnement aux ressources limitées."
    },
    {
        nom: "Homo neanderthalensis",
        periode: "400 000 Av. J-C",
        description: "Présent en Europe et Asie occidentale, il est l'humain ayant eu le cerveau le plus gros de l'histoire avec 1 600 cm³."
    },
    {
        nom: "Homo sapiens",
        periode: "150 000 Av. J-C",
        description: "Dernière espèce du genre Homo, originaire du berceau africain et seul survivant actuel. Être vivant le plus développé de tous les temps."
    }
];

// État global
let selectedHomo = null;

// Fonction principale d'initialisation
export function initHomoInteractions() {
    console.log("🦴 Initialisation des interactions homo...");

    // Petite attente pour s'assurer que le DOM est prêt
    setTimeout(() => {
        setupHomoClickHandlers();
        console.log("✅ Interactions homo configurées");
    }, 200);
}

// Configuration des gestionnaires de clic
function setupHomoClickHandlers() {
    // Sélectionner uniquement les images homo (homo1, homo2, etc.)
    const homoImages = [];
    for (let i = 1; i <= 5; i++) {
        const homoElement = document.getElementById(`homo${i}`);
        if (homoElement) {
            homoImages.push(homoElement);
        }
    }

    console.log(`📍 ${homoImages.length} éléments homo trouvés`);

    homoImages.forEach((element, index) => {
        // Ajouter les styles de base
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.3s ease';

        // Effets hover
        element.addEventListener('mouseenter', () => {
            if (selectedHomo !== element.id) {
                element.style.transform = 'scale(1.05)';
                element.style.filter = 'brightness(1.1)';
            }
        });

        element.addEventListener('mouseleave', () => {
            if (selectedHomo !== element.id) {
                element.style.transform = 'scale(1)';
                element.style.filter = 'none';
            }
        });

        // Gestionnaire de clic principal
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🖱️ Clic sur ${element.id}`);
            handleHomoClick(element.id, index);
        });
    });
}

// Gestionnaire du clic sur un homo
function handleHomoClick(homoId, index) {
    // Si c'est le même homo, désélectionner
    if (selectedHomo === homoId) {
        deselectAllHomo();
        return;
    }

    // Sélectionner le nouveau homo
    selectedHomo = homoId;
    applyVisualEffects(homoId);
    showHomoDescription(index);
}

// Appliquer les effets visuels (grisé/normal)
function applyVisualEffects(selectedId) {
    for (let i = 1; i <= 5; i++) {
        const homoElement = document.getElementById(`homo${i}`);
        if (homoElement) {
            if (homoElement.id === selectedId) {
                // Homo sélectionné : surbrillance
                homoElement.style.opacity = '1';
                homoElement.style.transform = 'scale(1.1)';
                homoElement.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(255,51,51,0.5))';
                homoElement.style.zIndex = '10';
            } else {
                // Autres homos : grisés
                homoElement.style.opacity = '0.3';
                homoElement.style.transform = 'scale(0.95)';
                homoElement.style.filter = 'grayscale(100%) brightness(0.7)';
                homoElement.style.zIndex = '1';
            }
        }
    }
}

// Afficher la description de l'espèce
function showHomoDescription(index) {
    // Supprimer la description existante
    hideHomoDescription();

    const speciesData = homoSpeciesData[index];
    if (!speciesData) {
        console.error("❌ Données manquantes pour l'index:", index);
        return;
    }

    // Trouver le conteneur
    const container = document.getElementById('homo-svg-container');
    if (!container) {
        console.error("❌ Conteneur homo-svg-container non trouvé");
        return;
    }

    // Créer la boîte d'information
    const infoBox = document.createElement('div');
    infoBox.id = 'homo-description-box';
    infoBox.innerHTML = `
    <div class="homo-description-content">
      <button class="homo-close-btn" onclick="window.homoInteraction?.deselectAll?.()">&times;</button>
      <h3 class="homo-title">${speciesData.nom}</h3>
      <div class="homo-period">📅 <strong>${speciesData.periode}</strong></div>
      <p class="homo-desc">${speciesData.description}</p>
    </div>
  `;

    // Styles inline pour garantir l'affichage
    infoBox.style.cssText = `
    position: absolute;
    bottom: -130px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(255, 250, 235, 0.98), rgba(255, 245, 220, 0.95));
    border-radius: 12px;
    padding: 20px;
    max-width: 420px;
    min-width: 320px;
    font-family: "EB Garamond", serif;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  `;

    // Positionner selon l'homo sélectionné
    const selectedElement = document.getElementById(`homo${index + 1}`);
    if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeLeft = rect.left - containerRect.left + (rect.width / 2);

        // Ajuster si trop près des bords
        const adjustedLeft = Math.max(160, Math.min(relativeLeft, containerRect.width - 160));
        infoBox.style.left = `${adjustedLeft}px`;
    }

    // Ajouter au conteneur
    container.style.position = 'relative';
    container.appendChild(infoBox);

    // Ajouter les styles pour les éléments internes
    addDescriptionStyles();

    // Animation d'apparition
    requestAnimationFrame(() => {
        infoBox.style.opacity = '1';
        infoBox.style.transform = 'translateX(-50%) translateY(0)';
    });

    console.log(`📖 Description affichée pour ${speciesData.nom}`);
}

// Ajouter les styles CSS pour la description
function addDescriptionStyles() {
    if (document.getElementById('homo-description-styles')) return;

    const style = document.createElement('style');
    style.id = 'homo-description-styles';
    style.textContent = `
    .homo-description-content {
      position: relative;
      text-align: left;
    }
    
    .homo-close-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      background: red;
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .homo-close-btn:hover {
      background: #ff0000;
      transform: scale(1.1);
    }
    
    .homo-title {
      margin: 0 0 12px 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      padding-bottom: 8px;
    }
    
    .homo-period {
      margin: 10px 0;
      font-size: 1.1rem;
      color: #7f8c8d;
      font-weight: 500;
    }
    
    .homo-desc {
      margin: 15px 0 0 0;
      font-size: 1rem;
      line-height: 1.6;
      color: #2c3e50;
      text-align: justify;
    }
    
    /* Animation au survol de la boîte */
    #homo-description-box:hover {
      transform: translateX(-50%) translateY(-3px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      #homo-description-box {
        max-width: 90vw !important;
        min-width: 280px !important;
        bottom: -150px !important;
        padding: 15px !important;
      }
      
      .homo-title {
        font-size: 1.2rem !important;
      }
      
      .homo-period {
        font-size: 1rem !important;
      }
      
      .homo-desc {
        font-size: 0.9rem !important;
      }
    }
  `;

    document.head.appendChild(style);
}

// Masquer la description
function hideHomoDescription() {
    const existingBox = document.getElementById('homo-description-box');
    if (existingBox) {
        existingBox.style.opacity = '0';
        existingBox.style.transform = 'translateX(-50%) translateY(20px)';

        setTimeout(() => {
            if (existingBox.parentNode) {
                existingBox.parentNode.removeChild(existingBox);
            }
        }, 400);
    }
}

// Désélectionner tous les homos
function deselectAllHomo() {
    console.log("🔄 Désélection de tous les homos");
    selectedHomo = null;

    // Remettre tous les homos à l'état normal
    for (let i = 1; i <= 5; i++) {
        const homoElement = document.getElementById(`homo${i}`);
        if (homoElement) {
            homoElement.style.opacity = '1';
            homoElement.style.transform = 'scale(1)';
            homoElement.style.filter = 'none';
            homoElement.style.zIndex = 'auto';
        }
    }

    // Masquer la description
    hideHomoDescription();
}

// Nettoyer les interactions
export function cleanupHomoInteractions() {
    console.log("🧹 Nettoyage des interactions homo");

    selectedHomo = null;
    hideHomoDescription();

    // Remettre les homos à l'état initial
    for (let i = 1; i <= 5; i++) {
        const homoElement = document.getElementById(`homo${i}`);
        if (homoElement) {
            // Réinitialiser les styles
            homoElement.style.cssText = homoElement.style.cssText
                .replace(/opacity[^;]*;?/g, '')
                .replace(/transform[^;]*;?/g, '')
                .replace(/filter[^;]*;?/g, '')
                .replace(/cursor[^;]*;?/g, '')
                .replace(/transition[^;]*;?/g, '')
                .replace(/z-index[^;]*;?/g, '');

            // Cloner l'élément pour supprimer tous les écouteurs
            const newElement = homoElement.cloneNode(true);
            homoElement.parentNode.replaceChild(newElement, homoElement);
        }
    }

    // Supprimer les styles ajoutés
    const styleElement = document.getElementById('homo-description-styles');
    if (styleElement) {
        styleElement.remove();
    }
}

// Exposer les fonctions globalement
window.homoInteraction = {
    deselectAll: deselectAllHomo,
    cleanup: cleanupHomoInteractions,
    init: initHomoInteractions
};

// Écouter les changements de section
document.addEventListener('sectionChanged', function (event) {
    const { id } = event.detail;

    if (id === 'homo-section') {
        console.log("🏠 Entrée dans la section homo");
        initHomoInteractions();
    } else if (selectedHomo) {
        console.log("🚪 Sortie de la section homo");
        cleanupHomoInteractions();
    }
});

// Auto-initialisation si déjà sur la section
document.addEventListener('DOMContentLoaded', function () {
    const homoSection = document.getElementById('homo-section');
    if (homoSection && homoSection.classList.contains('is-active')) {
        initHomoInteractions();
    }
});

console.log("🦕 Module homo-interaction chargé");