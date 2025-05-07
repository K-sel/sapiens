// src/expansion-map.js
import * as d3 from 'd3';

// Les données de migrations de Homo Sapiens
const mapData = {
  migrations: [
    {
      id: "afrique",
      nom: "Afrique",
      periode: "70 000 ans",
      description: "Berceau de l'humanité (Érythrée, Somalie, Éthiopie)",
      coordonnees: {
        latitude: 9.145,
        longitude: 40.489
      },
      etape: 1
    },
    {
      id: "moyen-orient-asie",
      nom: "Moyen-Orient",
      periode: "60 000 ans",
      description: "Première expansion hors d'Afrique",
      coordonnees: {
        latitude: 33.854,
        longitude: 45.079
      },
      etape: 2
    },
    {
      id: "asie-est",
      nom: "Asie de l'Est",
      periode: "50 000 ans",
      description: "Expansion vers l'Asie orientale",
      coordonnees: {
        latitude: 45.861,
        longitude: 104.195
      },
      etape: 2
    },
    {
      id: "europe",
      nom: "Europe",
      periode: "45 000 ans",
      description: "Arrivée en Europe, cohabitation avec Néandertal",
      coordonnees: {
        latitude: 46.227,
        longitude: 2.213
      },
      etape: 3
    },
    {
      id: "australie",
      nom: "Australie",
      periode: "45 000 ans",
      description: "Traversée maritime vers l'Australie",
      coordonnees: {
        latitude: -25.274,
        longitude: 133.775
      },
      etape: 3
    },
    // Nouveau point au détroit de Béring
    {
      id: "detroit-bering",
      nom: "Détroit de Béring",
      periode: "16 000 ans",
      description: "Passage entre l'Asie et l'Amérique via un pont terrestre formé durant la dernière période glaciaire",
      coordonnees: {
        latitude: 65.5,
        longitude: 170.0
      },
      etape: 4
    },
    {
      id: "amerique",
      nom: "Amérique",
      periode: "14 000 ans",
      description: "Traversée du détroit de Béring gelé",
      coordonnees: {
        latitude: 65.0,
        longitude: -140.0
      },
      etape: 4
    },
    {
      id: "terre-de-feu",
      nom: "Terre de Feu",
      periode: "11 000 ans",
      description: "Arrivée à l'extrême sud du Chili",
      coordonnees: {
        latitude: -54.801,
        longitude: -68.303
      },
      etape: 5
    }
  ],
  // Trajets mis à jour, suppression du lien direct Asie de l'Est → Amérique
  trajets: [
    {
      id: "afrique-moyen-orient",
      depart: "afrique",
      arrivee: "moyen-orient-asie",
      pointsIntermedaires: [
        {lat: 15.322, lng: 39.666},
        {lat: 23.885, lng: 45.079}
      ]
    },
    {
      id: "moyen-orient-europe",
      depart: "moyen-orient-asie",
      arrivee: "europe",
      pointsIntermedaires: [
        {lat: 37.964, lng: 29.061},
        {lat: 40.189, lng: 18.166}
      ]
    },
    {
      id: "moyen-orient",
      depart: "moyen-orient-asie",
      arrivee: "asie-est",
      pointsIntermedaires: [
        {lat: 35.0, lng: 75.0},
        {lat: 37.0, lng: 90.0}
      ]
    },
    {
      id: "asie-est-australie",
      depart: "asie-est",
      arrivee: "australie",
      pointsIntermedaires: [
        {lat: 20.0, lng: 110.0},
        {lat: 5.0, lng: 115.0},
        {lat: -9.189, lng: 124.889}
      ]
    },
    // Nouveau trajet Asie de l'Est → Détroit de Béring
    {
      id: "asie-est-detroit-bering",
      depart: "asie-est",
      arrivee: "detroit-bering",
      pointsIntermedaires: [
        {lat: 50.0, lng: 130.0},
        {lat: 60.0, lng: 155.0}
      ]
    },
    // Pas de trajet entre le détroit de Béring et l'Amérique dans la visualisation
    // mais gardons le trajet Amérique → Terre de Feu
    {
      id: "amerique-nord-sud",
      depart: "amerique",
      arrivee: "terre-de-feu",
      pointsIntermedaires: [
        {lat: 50.0, lng: -120.0},
        {lat: 40.0, lng: -100.0},
        {lat: 25.0, lng: -90.0},
        {lat: 10.0, lng: -80.0},
        {lat: 0.0, lng: -75.0},
        {lat: -10.0, lng: -70.0},
        {lat: -25.0, lng: -65.0},
        {lat: -40.0, lng: -70.0}
      ]
    }
  ]
};

// Fonction principale pour initialiser la carte
export function initExpansionMap() {
  console.log("Initialisation de la carte d'expansion...");
  
  // Supprimer la carte existante si elle existe déjà
  d3.select("#expansion-map-container").select("svg").remove();

  // Vérifier si le conteneur existe
  const container = document.getElementById('expansion-map-container');
  if (!container) {
    console.error("Conteneur de la carte introuvable");
    return;
  }

  // Créer un élément pour les info-bulles s'il n'existe pas
  if (!document.getElementById('map-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'map-tooltip';
    document.body.appendChild(tooltip);
  }

  // Créer un élément pour les info-bulles permanentes s'il n'existe pas
  if (!document.getElementById('map-permanent-tooltip')) {
    const permanentTooltip = document.createElement('div');
    permanentTooltip.id = 'map-permanent-tooltip';
    document.body.appendChild(permanentTooltip);
  }

  // Ajouter des styles CSS pour les tooltips si nécessaire
  if (!document.getElementById('map-tooltip-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'map-tooltip-styles';
    styleElement.textContent = `
      #map-tooltip {
        position: absolute;
        background-color: rgba(255, 250, 235, 0.9);
        border: 1px solid #333;
        border-radius: 4px;
        padding: 8px;
        font-size: 0.9rem;
        max-width: 200px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      #map-permanent-tooltip {
        position: absolute;
        background-color: rgba(255, 250, 235, 0.95);
        border: 1px solid #ff3333;
        border-radius: 4px;
        padding: 10px;
        font-size: 0.9rem;
        max-width: 250px;
        opacity: 0;
        z-index: 1001;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        transition: opacity 0.3s, transform 0.2s;
        pointer-events: none;
      }
      
      #map-permanent-tooltip.active {
        opacity: 1;
        pointer-events: auto;
      }
      
      #close-tooltip-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #ff3333;
        background: none;
        border: none;
        padding: 0;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
      }
      
      #close-tooltip-btn:hover {
        color: #ff0000;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Configuration de base
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // Créer un conteneur SVG
  const svg = d3.select("#expansion-map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Définir la projection (Mercator)
  const projection = d3.geoMercator()
    .scale(width / 2.5 / Math.PI)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  // Créer un générateur de chemins géographiques
  const path = d3.geoPath().projection(projection);

  // Variable pour suivre le point actif
  let activePoint = null;

  // Fonction pour afficher une tooltip permanente
  function showPermanentTooltip(event, d) {
    const permanentTooltip = d3.select("#map-permanent-tooltip");
    
    // Si on clique sur le même point, fermer la tooltip
    if (activePoint === d.id) {
      permanentTooltip
        .classed("active", false)
        .style("opacity", 0);
      activePoint = null;
      return;
    }
    
    // Sinon, mettre à jour et afficher la tooltip
    activePoint = d.id;
    
    permanentTooltip.html(`
      <button id="close-tooltip-btn">&times;</button>
      <strong>${d.nom}</strong><br>
      <em>${d.periode}</em><br><br>
      ${d.description}
    `)
    .style("left", (event.pageX + 20) + "px")
    .style("top", (event.pageY - 40) + "px")
    .classed("active", true)
    .style("opacity", 1);
    
    // Ajouter un gestionnaire d'événements pour le bouton de fermeture
    document.getElementById('close-tooltip-btn').addEventListener('click', function(e) {
      e.stopPropagation(); // Empêcher la propagation de l'événement
      permanentTooltip
        .classed("active", false)
        .style("opacity", 0);
      activePoint = null;
    });
  }
  
  // Fermer la tooltip permanente si on clique ailleurs
  document.addEventListener("click", function(event) {
    const permanentTooltip = document.getElementById("map-permanent-tooltip");
    
    if (permanentTooltip && 
        event.target.id !== "map-permanent-tooltip" && 
        !permanentTooltip.contains(event.target) &&
        !event.target.classList.contains("migration-point")) {
      
      d3.select("#map-permanent-tooltip")
        .classed("active", false)
        .style("opacity", 0);
      
      activePoint = null;
    }
  });

  // Charger le monde (topoJSON)
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(world => {
      // Vérifier si topojson est défini
      if (typeof topojson === 'undefined') {
        console.error("La bibliothèque TopoJSON n'est pas chargée");
        return;
      }

      // Convertir TopoJSON en GeoJSON
      const countries = topojson.feature(world, world.objects.countries);

      // Dessiner les pays
      svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#000000") // Couleur noire pour correspondre à l'image
        .attr("stroke", "#333333")
        .attr("stroke-width", 0.5);

      // Fonction pour obtenir les coordonnées d'un lieu à partir de son ID
      function getCoordinates(id) {
        const lieu = mapData.migrations.find(d => d.id === id);
        return lieu ? [lieu.coordonnees.longitude, lieu.coordonnees.latitude] : null;
      }

      // Créer les chemins de migration
      const pathsG = svg.append("g").attr("class", "migration-paths");

      mapData.trajets.forEach((trajet, i) => {
        // Points de départ et d'arrivée
        const depart = getCoordinates(trajet.depart);
        const arrivee = getCoordinates(trajet.arrivee);
        
        if (!depart || !arrivee) return;
        
        // Construire le chemin avec les points intermédiaires
        let points = [depart];
        
        trajet.pointsIntermedaires.forEach(point => {
          points.push([point.lng, point.lat]);
        });
        
        points.push(arrivee);
        
        // Créer une ligne courbe pour le trajet
        const lineGenerator = d3.line()
          .x(d => projection(d)[0])
          .y(d => projection(d)[1])
          .curve(d3.curveBasis);
        
        // Dessiner le chemin
        const pathElement = pathsG.append("path")
          .attr("d", lineGenerator(points))
          .attr("fill", "none")
          .attr("stroke", "#ff3333") // Rouge pour les trajets
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", "10,10") // Lignes en pointillés plus visibles
          .attr("opacity", 0)
          .attr("class", `path-${trajet.id}`);
        
        // Animer les chemins avec un délai progressif
        pathElement.transition()
          .delay(i * 1000 + 500)
          .duration(1500)
          .attr("opacity", 0.8)
          .attrTween("stroke-dashoffset", function() {
            const l = this.getTotalLength();
            return function(t) { return l * (1 - t); };
          });
      });

      // Ajouter les points de migration avec animations séquentielles
      const pointsG = svg.append("g").attr("class", "migration-points");
      
      pointsG.selectAll(".migration-point")
        .data(mapData.migrations)
        .enter()
        .append("circle")
        .attr("class", d => `migration-point point-${d.id}`)
        .attr("cx", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[0])
        .attr("cy", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[1])
        .attr("r", 0)
        .attr("fill", "#ff3333") // Rouge pour les points
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.9)
        .style("cursor", "pointer") // Ajouter un curseur pointeur pour indiquer l'interactivité
        .transition()
        .delay(d => (d.etape - 1) * 1000)
        .duration(500)
        .attr("r", 7); // Points un peu plus grands

      // Ajouter les étiquettes
      const labels = svg.append("g").attr("class", "migration-labels");
      
      labels.selectAll(".migration-label")
        .data(mapData.migrations)
        .enter()
        .append("text")
        .attr("class", d => `migration-label label-${d.id}`)
        .attr("x", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[0] + 15)
        .attr("y", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[1] - 5)
        .text(d => `${d.nom} (${d.periode})`)
        .attr("font-size", "12px")
        .attr("fill", "#ffffff") // Texte blanc pour contraste sur fond noir
        .attr("opacity", 0)
        .transition()
        .delay(d => (d.etape - 1) * 1000 + 300)
        .duration(500)
        .attr("opacity", 1);

      // Ajouter des interactions pour le tooltip au survol
      pointsG.selectAll(".migration-point")
        .on("mouseover", function(event, d) {
          // Agrandir le point
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 10);

          // Afficher l'info-bulle au survol
          const tooltip = d3.select("#map-tooltip");
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          
          tooltip.html(`<strong>${d.nom}</strong><br>${d.periode}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function(event, d) {
          // Ne pas réduire le point si c'est le point actif
          if (activePoint !== d.id) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 7);
          }

          // Cacher l'info-bulle de survol
          d3.select("#map-tooltip")
            .transition()
            .duration(500)
            .style("opacity", 0);
        })
        // Ajouter l'événement de clic pour afficher l'info-bulle permanente
        .on("click", function(event, d) {
          // Réinitialiser tous les points à leur taille normale
          pointsG.selectAll(".migration-point")
            .transition()
            .duration(200)
            .attr("r", 7);
          
          // Agrandir le point cliqué si ce n'est pas déjà le point actif
          if (activePoint !== d.id) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 10);
          }
            
          // Afficher la tooltip permanente
          showPermanentTooltip(event, d);
        });

      console.log("Carte d'expansion initialisée avec succès");
    })
    .catch(error => {
      console.error("Erreur lors du chargement des données cartographiques:", error);
      // Afficher un message d'erreur dans le conteneur
      d3.select("#expansion-map-container")
        .append("div")
        .attr("class", "map-error")
        .html(`
          <p>Impossible de charger la carte. Veuillez rafraîchir la page.</p>
          <p>Erreur: ${error.message}</p>
        `);
    });
}

// Ajouter un gestionnaire pour redimensionner la carte si la fenêtre change de taille
window.addEventListener('resize', function() {
  // Redimensionner la carte seulement si elle est déjà initialisée et visible
  const expansionSection = document.getElementById('expension-section');
  if (d3.select("#expansion-map-container svg").size() > 0 && 
      expansionSection && expansionSection.classList.contains('is-active')) {
    initExpansionMap();
  }
});