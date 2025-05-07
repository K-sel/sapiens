// src/expension-map.js
import * as d3 from 'd3';

export function createExpansionMap() {
    // Supprimer la carte existante si elle existe déjà
    d3.select("#expansion-map-container").select("svg").remove();

    // Configuration de base
    const width = d3.select("#expension-illustration").node().clientWidth;
    const height = d3.select("#expension-illustration").node().clientHeight;
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
                nom: "Moyen-Orient et Asie",
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
                    latitude: 35.861,
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
            {
                id: "amerique",
                nom: "Amérique",
                periode: "14 000 ans",
                description: "Traversée du détroit de Béring gelé",
                coordonnees: {
                    latitude: 64.801,
                    longitude: -171.091
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
        trajets: [
            {
                id: "afrique-moyen-orient",
                depart: "afrique",
                arrivee: "moyen-orient-asie",
                pointsIntermedaires: [
                    { lat: 15.322, lng: 39.666 },
                    { lat: 23.885, lng: 45.079 }
                ]
            },
            {
                id: "moyen-orient-europe",
                depart: "moyen-orient-asie",
                arrivee: "europe",
                pointsIntermedaires: [
                    { lat: 37.964, lng: 29.061 },
                    { lat: 40.189, lng: 18.166 }
                ]
            },
            {
                id: "moyen-orient-asie-est",
                depart: "moyen-orient-asie",
                arrivee: "asie-est",
                pointsIntermedaires: [
                    { lat: 30.132, lng: 70.744 },
                    { lat: 27.514, lng: 90.433 }
                ]
            },
            {
                id: "asie-est-australie",
                depart: "asie-est",
                arrivee: "australie",
                pointsIntermedaires: [
                    { lat: 12.879, lng: 121.774 },
                    { lat: 0.789, lng: 113.921 },
                    { lat: -9.189, lng: 124.889 }
                ]
            },
            {
                id: "asie-est-amerique",
                depart: "asie-est",
                arrivee: "amerique",
                pointsIntermedaires: [
                    { lat: 55.133, lng: 142.442 },
                    { lat: 66.0, lng: 169.0 },
                    { lat: 65.5, lng: -168.0 }
                ]
            },
            {
                id: "amerique-nord-sud",
                depart: "amerique",
                arrivee: "terre-de-feu",
                pointsIntermedaires: [
                    { lat: 43.651, lng: -102.532 },
                    { lat: 19.432, lng: -99.133 },
                    { lat: 4.711, lng: -74.072 },
                    { lat: -12.046, lng: -77.043 },
                    { lat: -33.447, lng: -70.673 }
                ]
            }
        ]
    };

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

    // Charger le monde (topoJSON)
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(world => {
            // Convertir TopoJSON en GeoJSON
            const countries = topojson.feature(world, world.objects.countries);

            // Dessiner les pays
            svg.append("g")
                .selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#222222")
                .attr("stroke", "#444444")
                .attr("stroke-width", 0.5);

            // Dessiner les points de migration
            const pointsG = svg.append("g").attr("class", "migration-points");
            const pointsData = mapData.migrations;

            // Fonction pour obtenir les coordonnées d'un lieu à partir de son ID
            function getCoordinates(id) {
                const lieu = pointsData.find(d => d.id === id);
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
                    .attr("stroke", "#ff3333")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5")
                    .attr("opacity", 0)
                    .attr("class", `path-${trajet.id}`);

                // Animer les chemins avec un délai progressif
                pathElement.transition()
                    .delay(i * 1000 + 500)
                    .duration(1500)
                    .attr("opacity", 0.8)
                    .attrTween("stroke-dashoffset", function () {
                        const l = this.getTotalLength();
                        return function (t) { return l * (1 - t); };
                    });
            });

            // Ajouter les points de migration avec animations séquentielles
            pointsG.selectAll(".migration-point")
                .data(pointsData)
                .enter()
                .append("circle")
                .attr("class", d => `migration-point point-${d.id}`)
                .attr("cx", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[0])
                .attr("cy", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[1])
                .attr("r", 0)
                .attr("fill", "#ff3333")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1)
                .attr("opacity", 0.9)
                .transition()
                .delay(d => (d.etape - 1) * 1000)
                .duration(500)
                .attr("r", 6);

            // Ajouter les étiquettes
            const labels = svg.append("g").attr("class", "migration-labels");

            labels.selectAll(".migration-label")
                .data(pointsData)
                .enter()
                .append("text")
                .attr("class", d => `migration-label label-${d.id}`)
                .attr("x", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[0] + 15)
                .attr("y", d => projection([d.coordonnees.longitude, d.coordonnees.latitude])[1] - 5)
                .text(d => `${d.nom} (${d.periode})`)
                .attr("font-size", "12px")
                .attr("fill", "#000000")
                .attr("opacity", 0)
                .transition()
                .delay(d => (d.etape - 1) * 1000 + 300)
                .duration(500)
                .attr("opacity", 1);

            // Ajouter des interactions
            pointsG.selectAll(".migration-point")
                .on("mouseover", function (event, d) {
                    // Agrandir le point
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 9);

                    // Afficher l'info-bulle
                    const tooltip = d3.select("#map-tooltip");
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tooltip.html(`<strong>${d.nom}</strong><br>${d.periode}<br>${d.description}`)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mouseout", function () {
                    // Réduire le point
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 6);

                    // Cacher l'info-bulle
                    d3.select("#map-tooltip")
                        .transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
}