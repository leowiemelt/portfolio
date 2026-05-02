import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let query = '';

function setQuery(newQuery) {
  query = newQuery;
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // re-calculate slice generator, arc data, arcs
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  // clear existing paths and legend items
  let newSVG = d3.select('#projects-pie-plot');
  newSVG.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  // render new paths
  newArcs.forEach((arc, idx) => {
    newSVG
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  });

  // render new legend
  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// render on page load
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

// re-render on search
const searchInput = document.querySelector('input[type="search"]');
searchInput.addEventListener('change', (event) => {
  let filteredProjects = setQuery(event.target.value);
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

let selectedIndex = -1;

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  // render new paths
  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        // highlight selected wedge
        svg
          .selectAll('path')
          .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

        // highlight selected legend item
        legend
          .selectAll('li')
          .attr('class', (_, idx) =>
            idx === selectedIndex ? 'legend-item selected' : 'legend-item'
          );

        // filter projects by selected year
        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, 'h2');
        } else {
          let filteredProjects = projects.filter(
            (p) => p.year === newData[selectedIndex].label
          );
          renderProjects(filteredProjects, projectsContainer, 'h2');
        }
      });
  });

  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
