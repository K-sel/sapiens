// src/economie-graph.js
import * as d3 from 'd3';

// Les données économiques pour le graphique
const economieData = {
  "titre": "économie mondiale en $",
  "xAxis": {
    "titre": "dates",
    "min": 1000,
    "max": 2025,
    "ticks": [1200, 1500, 1800, 2025]
  },
  "yAxis": {
    "titre": "",
    "min": 0,
    "max": 110000,
    "labels": ["250 Millions", "110 000 Milliards"]
  },
  "donnees": [
    {"date": 1000, "valeur": 150, "segment": "stagnante"},
    {"date": 1100, "valeur": 160, "segment": "stagnante"},
    {"date": 1200, "valeur": 170, "segment": "stagnante"},
    {"date": 1300, "valeur": 200, "segment": "stagnante"},
    {"date": 1400, "valeur": 210, "segment": "stagnante"},
    {"date": 1500, "valeur": 240, "segment": "stagnante"},
    {"date": 1600, "valeur": 250, "segment": "stagnante"},
    {"date": 1700, "valeur": 300, "segment": "stagnante"},
    {"date": 1750, "valeur": 350, "segment": "stagnante"},
    {"date": 1800, "valeur": 500, "segment": "croissante"},
    {"date": 1850, "valeur": 1200, "segment": "croissante"},
    {"date": 1900, "valeur": 3000, "segment": "croissante"},
    {"date": 1950, "valeur": 9000, "segment": "croissante"},
    {"date": 2000, "valeur": 40000, "segment": "croissante"},
    {"date": 2025, "valeur": 110000, "segment": "croissante"}
  ],
  "annotations": [
    {
      "id": "economie-stagnante",
      "texte": "Économie stagnante",
      "position": {
        "x": 1400,
        "y": 30
      },
      "alignement": "milieu-bas",
      "fleche": {
        "depart": {"x": 1400, "y": 50},
        "arrivee": {"x": 1400, "y": 130}
      }
    },
    {
      "id": "revolution-industrielle",
      "texte": "Révolution industrielle & Démocratisation du crédit",
      "position": {
        "x": 1680,
        "y": 1000
      },
      "alignement": "droite-milieu",
      "fleche": {
        "depart": {"x": 1690, "y": 1000},
        "arrivee": {"x": 1780, "y": 550}
      }
    },
    {
      "id": "economie-croissante",
      "texte": "Économie croissante",
      "position": {
        "x": 1950,
        "y": 30000
      },
      "alignement": "droite-milieu",
      "fleche": {
        "depart": {"x": 1900, "y": 20000},
        "arrivee": {"x": 1850, "y": 3700}
      }
    }
  ],
  "elements": [
    {
      "id": "ligne-verticale",
      "type": "ligne",
      "debut": {"x": 1800, "y": 0},
      "fin": {"x": 1800, "y": 110000},
      "style": {
        "stroke": "#FF0000",
        "strokeWidth": 2,
        "strokeDasharray": "5,5"
      }
    },
    {
      "id": "cercle-transition",
      "type": "cercle",
      "centre": {"x": 1800, "y": 500},
      "rayon": 70,
      "style": {
        "stroke": "#FF0000",
        "strokeWidth": 3,
        "fill": "none"
      }
    }
  ],
  "style": {
    "courbeCouleurs": {
      "stagnante": "#666666",
      "croissante": "#000000"
    },
    "arrierePlan": "#FFFAEB",
    "axesCouleur": "#000000",
    "textesCouleur": "#333333",
    "annotationsCouleur": "#333333",
    "fontFamily": "Garamond, serif"
  }
};

// Fonction principale pour initialiser le graphique
export function initEconomieGraph() {
  console.log("Initialisation du graphique économique...");
  
  // Supprimer le graphique existant s'il existe déjà
  d3.select("#economie-graph-container").select("svg").remove();

  // Vérifier si le conteneur existe
  const container = document.getElementById('economie-graph-container');
  if (!container) {
    console.error("Conteneur du graphique introuvable");
    return;
  }

  console.log("Dimensions du conteneur:", container.clientWidth, container.clientHeight);
  
  // Si le conteneur existe mais n'a pas de hauteur, lui en donner une par défaut
  if (container.clientHeight < 100) {
    container.style.height = "600px";
    console.log("Hauteur du conteneur ajustée à 500px");
  }

  // Créer un élément pour les info-bulles s'il n'existe pas
  if (!document.getElementById('graph-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'graph-tooltip';
    document.body.appendChild(tooltip);
  }

  // Ajouter des styles CSS pour le tooltip si nécessaire
  if (!document.getElementById('graph-tooltip-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'graph-tooltip-styles';
    styleElement.textContent = `
      #graph-tooltip {
        position: absolute;
        background-color: rgba(255, 250, 235, 0.95);
        border: 1px solid #333;
        border-radius: 4px;
        padding: 8px;
        font-size: 0.9rem;
        font-family: "EB Garamond", serif;
        max-width: 200px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Configuration de base
  const margin = {top: 60, right: 100, bottom: 100, left: 100};
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  console.log("Dimensions du graphique:", width, height);

  // Créer un conteneur SVG
  const svg = d3.select("#economie-graph-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    .attr("style", `max-width: 100%; height: auto; background-color: ${economieData.style.arrierePlan};`)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Créer les échelles
  const x = d3.scaleLinear()
    .domain([economieData.xAxis.min, economieData.xAxis.max])
    .range([0, width]);

  // Pour mieux visualiser la croissance exponentielle, utilisons une échelle logarithmique pour y
  // Ou pour reproduire exactement l'image, une échelle personnalisée avec des points spécifiques
  const y = d3.scaleLog()
    .domain([1, economieData.yAxis.max])
    .range([height, 0])
    .nice();

  // Créer les axes
  const xAxis = d3.axisBottom(x)
    .tickValues(economieData.xAxis.ticks)
    .tickFormat(d => d);

  const yAxis = d3.axisLeft(y)
    .tickValues([250, 110000])
    .tickFormat((d, i) => economieData.yAxis.labels[i]);

  // Ajouter les axes au graphique
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .style("font-family", economieData.style.fontFamily)
    .style("color", economieData.style.axesCouleur);

  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .style("font-family", economieData.style.fontFamily)
    .style("color", economieData.style.axesCouleur);

  // Ajouter les titres des axes
  svg.append("text")
    .attr("class", "x-axis-title")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .style("font-family", economieData.style.fontFamily)
    .style("font-style", "italic")
    .style("font-size", "18px")
    .style("fill", economieData.style.textesCouleur)
    .text(economieData.xAxis.titre);

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", 0)
    .attr("y", -30)
    .attr("text-anchor", "start")
    .style("font-family", economieData.style.fontFamily)
    .style("font-style", "italic")
    .style("font-size", "22px")
    .style("fill", economieData.style.textesCouleur)
    .text(economieData.titre);

  // Séparer les données par segment
  const segmentedData = {
    stagnante: economieData.donnees.filter(d => d.segment === "stagnante"),
    croissante: economieData.donnees.filter(d => d.segment === "croissante")
  };

  const stagnanteContinue = [...segmentedData.stagnante];
  if (segmentedData.croissante.length > 0) {
    stagnanteContinue.push(segmentedData.croissante[0]);
  }

  // Définir les générateurs de ligne
  const lineGenerator = d3.line()
    .x(d => x(d.date))
    .y(d => y(Math.max(1, d.valeur))) // Assurons-nous que toutes les valeurs sont >= 1 pour l'échelle log
    .curve(d3.curveCatmullRom);

  console.log("Construction des lignes du graphique");

  // Ajouter les lignes au graphique (avec animation)
  // Ligne stagnante
  const pathStagnante = svg.append("path")
  .datum(stagnanteContinue)
  .attr("fill", "none")
  .attr("stroke", economieData.style.courbeCouleurs.stagnante)
  .attr("stroke-width", 3)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("d", lineGenerator)
  .attr("opacity", 0);

  // Animation de la ligne stagnante
  pathStagnante.transition()
    .duration(2000)
    .attr("opacity", 1)
    .attrTween("stroke-dasharray", function() {
      const length = this.getTotalLength();
      return function(t) { 
        return `${length * t},${length}`; 
      };
    });

  // Ligne croissante
  const pathCroissante = svg.append("path")
    .datum(segmentedData.croissante)
    .attr("fill", "none")
    .attr("stroke", economieData.style.courbeCouleurs.croissante)
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", lineGenerator)
    .attr("opacity", 0);

  // Animation de la ligne croissante (avec délai)
  pathCroissante.transition()
    .delay(2000)
    .duration(2000)
    .attr("opacity", 1)
    .attrTween("stroke-dasharray", function() {
      const length = this.getTotalLength();
      return function(t) { 
        return `${length * t},${length}`; 
      };
    });

  // Ajouter les éléments supplémentaires (ligne verticale et cercle)
  const elementsGroup = svg.append("g").attr("class", "elements");

  // Ligne verticale
  const ligneVerticale = economieData.elements.find(e => e.id === "ligne-verticale");
  if (ligneVerticale) {
    elementsGroup.append("line")
      .attr("x1", x(ligneVerticale.debut.x))
      .attr("y1", y(Math.max(1, ligneVerticale.debut.y)))
      .attr("x2", x(ligneVerticale.fin.x))
      .attr("y2", y(Math.max(1, ligneVerticale.fin.y)))
      .attr("stroke", ligneVerticale.style.stroke)
      .attr("stroke-width", ligneVerticale.style.strokeWidth)
      .attr("stroke-dasharray", ligneVerticale.style.strokeDasharray)
      .attr("opacity", 0)
      .transition()
      .delay(4000)
      .duration(1000)
      .attr("opacity", 1);
  }

  // Cercle de transition
  const cercleTransition = economieData.elements.find(e => e.id === "cercle-transition");
  if (cercleTransition) {
    elementsGroup.append("circle")
      .attr("cx", x(cercleTransition.centre.x))
      .attr("cy", y(Math.max(1, cercleTransition.centre.y)))
      .attr("r", cercleTransition.rayon)
      .attr("stroke", cercleTransition.style.stroke)
      .attr("stroke-width", cercleTransition.style.strokeWidth)
      .attr("fill", cercleTransition.style.fill)
      .attr("opacity", 0)
      .transition()
      .delay(5000)
      .duration(1000)
      .attr("opacity", 1);
  }

  // Ajouter les annotations
  const annotationsGroup = svg.append("g").attr("class", "annotations");

  economieData.annotations.forEach((annotation, i) => {
    const group = annotationsGroup.append("g")
      .attr("class", `annotation annotation-${annotation.id}`)
      .attr("opacity", 0);

    // Texte de l'annotation
    group.append("text")
      .attr("x", x(annotation.position.x))
      .attr("y", y(Math.max(1, annotation.position.y)))
      .attr("text-anchor", annotation.alignement.includes("droit") ? "end" : 
                           annotation.alignement.includes("milieu") ? "middle" : "start")
      .style("font-family", economieData.style.fontFamily)
      .style("font-style", "italic")
      .style("font-size", "16px")
      .style("fill", economieData.style.annotationsCouleur)
      .text(annotation.texte);

    // Flèche de l'annotation (ligne)
    if (annotation.fleche) {
      group.append("line")
        .attr("x1", x(annotation.fleche.depart.x))
        .attr("y1", y(Math.max(1, annotation.fleche.depart.y)))
        .attr("x2", x(annotation.fleche.arrivee.x))
        .attr("y2", y(Math.max(1, annotation.fleche.arrivee.y)))
        .attr("stroke", "#000000")
        .attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrow)");
    }

    // Animation pour faire apparaître l'annotation
    group.transition()
      .delay(6000 + i * 500)
      .duration(1000)
      .attr("opacity", 1);
  });

  // Définir le marqueur de flèche pour les annotations
  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#000000");

  // Ajouter les points de données avec interactivité
  const pointsGroup = svg.append("g").attr("class", "data-points");

  // Fusionner les données des deux segments
  const allPoints = [...segmentedData.stagnante, ...segmentedData.croissante];

  // Animation séquentielle pour les points
  allPoints.forEach((point, i) => {
    const pointElement = pointsGroup.append("circle")
      .attr("class", `data-point point-${point.date}`)
      .attr("cx", x(point.date))
      .attr("cy", y(Math.max(1, point.valeur)))
      .attr("r", 0)
      .attr("fill", economieData.style.courbeCouleurs[point.segment])
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event) {
        // Agrandir le point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8);

        // Afficher le tooltip
        const tooltip = d3.select("#graph-tooltip");
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
          
        tooltip.html(`
          <strong>Année: ${point.date}</strong><br>
          Économie mondiale: ${formatValue(point.valeur)}<br>
          Période: ${point.segment === "stagnante" ? "Économie stagnante" : "Économie croissante"}
        `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function() {
        // Réduire le point
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5);

        // Cacher le tooltip
        d3.select("#graph-tooltip")
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Animation pour faire apparaître le point
    const delay = point.segment === "stagnante" ? 2000 + i * 100 : 4000 + (i - segmentedData.stagnante.length) * 100;
    
    pointElement.transition()
      .delay(delay)
      .duration(300)
      .attr("r", 5);
  });

  // Fonction pour formater les valeurs selon leur magnitude
  function formatValue(value) {
    if (value < 1000) {
      return `${value} millions $`;
    } else {
      return `${value / 1000} milliards $`;
    }
  }

  console.log("Graphique économique initialisé avec succès");
}

// Ajouter un gestionnaire pour redimensionner le graphique si la fenêtre change de taille
window.addEventListener('resize', function() {
  // Redimensionner le graphique seulement s'il est déjà initialisé et visible
  const economieSection = document.getElementById('economie-section');
  if (d3.select("#economie-graph-container svg").size() > 0 && 
      economieSection && economieSection.classList.contains('is-active')) {
    initEconomieGraph();
  }
});

// Exécuter une fois au chargement pour déboguer
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM chargé, vérification de la section économie");
  const economieSection = document.getElementById('economie-section');
  console.log("Section économie trouvée:", !!economieSection);
  
  if (economieSection) {
    const container = document.getElementById('economie-graph-container');
    console.log("Conteneur du graphique trouvé:", !!container);
    
    // Si par hasard on est déjà sur cette section
    if (economieSection.classList.contains('is-active')) {
      console.log("Section économie active, initialisation du graphique");
      setTimeout(() => {
        if (document.getElementById('economie-graph-container')) {
          initEconomieGraph();
        }
      }, 500);
    }
  }
});