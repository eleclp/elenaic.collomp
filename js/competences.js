// ── CONFIGURATION DES COULEURS ──
const skillColors = {
  Développer: "#1A5F7A",
  Concevoir: "#8162ac",
  Exprimer: "#C85C2E",
  Comprendre: "#0a2914",
  Entreprendre: "#A55E7A",
};

// ── ÉTAT DES FILTRES ──
const activeFilters = {
  skills: [],
  poles: [],
  years: [],
};

let allProjects = [];
let competenceGroups = {};

// ── RÉCUPÉRATION DES DONNÉES ──
fetch("projects.json")
  .then((res) => res.json())
  .then((data) => {
    allProjects = data;
    buildCompetenceGroups(data);
    initDropdownFilters(data);
    renderCompetences();
  });

// ── GROUPEMENT PAR COMPÉTENCE + ANNÉE ──
function buildCompetenceGroups(projects) {
  competenceGroups = {};
  projects.forEach((project) => {
    project.skills.forEach((skill) => {
      if (!competenceGroups[skill]) competenceGroups[skill] = {};
      const year = project.year || "BUT MMI";
      if (!competenceGroups[skill][year]) competenceGroups[skill][year] = [];
      competenceGroups[skill][year].push(project);
    });
  });
}

// ── UTILS ──
function getUnique(arr, key) {
  const values = arr.flatMap((item) =>
    Array.isArray(item[key]) ? item[key] : [item[key]],
  );
  return [...new Set(values)].sort();
}

// ── INIT DROPDOWNS ──
function initDropdownFilters(projects) {
  createFilterOptions(
    "skills-filters",
    getUnique(projects, "skills"),
    "skills",
  );
  createFilterOptions("poles-filters", getUnique(projects, "pole"), "poles");
  createFilterOptions("years-filters", getUnique(projects, "year"), "years");

  // Toggle dropdowns
  document.querySelectorAll(".filter-dropdown").forEach((drop) => {
    const btn = drop.querySelector(".dropdown-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = drop.classList.contains("open");
      document
        .querySelectorAll(".filter-dropdown")
        .forEach((d) => d.classList.remove("open"));
      if (!isOpen) drop.classList.add("open");
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-dropdown")
      .forEach((d) => d.classList.remove("open"));
  });

  // Reset
  document.querySelector(".reset-btn").addEventListener("click", () => {
    activeFilters.skills = [];
    activeFilters.poles = [];
    activeFilters.years = [];
    document
      .querySelectorAll(".filter-option.active")
      .forEach((b) => b.classList.remove("active"));
    renderCompetences();
  });
}

function createFilterOptions(containerId, items, filterKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item;
    btn.className = "filter-option";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");
      if (btn.classList.contains("active")) {
        activeFilters[filterKey].push(item);
      } else {
        activeFilters[filterKey] = activeFilters[filterKey].filter(
          (v) => v !== item,
        );
      }
      renderCompetences();
    });
    container.appendChild(btn);
  });
}

// ── FILTRAGE ──
function getFilteredProjects() {
  return allProjects.filter((proj) => {
    const skillMatch =
      activeFilters.skills.length === 0 ||
      proj.skills.some((s) => activeFilters.skills.includes(s));
    const projPoles = Array.isArray(proj.pole) ? proj.pole : [proj.pole];
    const poleMatch =
      activeFilters.poles.length === 0 ||
      projPoles.some((p) => activeFilters.poles.includes(p));
    const yearMatch =
      activeFilters.years.length === 0 ||
      activeFilters.years.includes(proj.year);
    return skillMatch && poleMatch && yearMatch;
  });
}

// ── RENDER ──
function renderCompetences() {
  const filteredProjects = getFilteredProjects();
  const container = document.getElementById("competences-container");
  const countEl = document.querySelector(".results-count");

  // Recalcul des groupes sur les projets filtrés
  const filteredGroups = {};
  filteredProjects.forEach((project) => {
    project.skills.forEach((skill) => {
      // Si un filtre de compétence est actif, on n'affiche que celles sélectionnées
      if (
        activeFilters.skills.length > 0 &&
        !activeFilters.skills.includes(skill)
      )
        return;
      if (!filteredGroups[skill]) filteredGroups[skill] = {};
      const year = project.year || "BUT MMI";
      if (!filteredGroups[skill][year]) filteredGroups[skill][year] = [];
      filteredGroups[skill][year].push(project);
    });
  });

  container.innerHTML = "";
  const skillKeys = Object.keys(filteredGroups);

  if (skillKeys.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:#888;font-style:italic;">aucun projet trouvé.</div>`;
    countEl.textContent = "0 projets trouvés";
    return;
  }

  skillKeys.forEach((skill) => {
    container.appendChild(createCompetenceCard(skill, filteredGroups[skill]));
  });

  countEl.textContent = `${filteredProjects.length} projet${filteredProjects.length > 1 ? "s" : ""} trouvé${filteredProjects.length > 1 ? "s" : ""}`;
}

// ── CRÉATION CARD COMPÉTENCE ──
function createCompetenceCard(skill, yearsGroup) {
  const card = document.createElement("div");
  card.className = "competence-card";
  const color = skillColors[skill] || "#ccc";

  const title = document.createElement("h2");
  title.textContent = skill;
  title.style.color = color;
  title.style.fontFamily = "Handwriting Ernie";
  title.style.fontSize = "2.5rem";
  title.style.marginBottom = "30px";
  card.appendChild(title);

  const timeline = document.createElement("div");
  timeline.className = "competence-timeline";
  timeline.style.setProperty("--skill-color", color);

  const sortedYears = Object.keys(yearsGroup).sort();

  sortedYears.forEach((year) => {
    const yearHeader = document.createElement("h3");
    yearHeader.className = "timeline-year-title";
    yearHeader.textContent = year;
    yearHeader.style.color = color;
    yearHeader.style.borderColor = color;
    timeline.appendChild(yearHeader);

    yearsGroup[year].forEach((project) => {
      const item = document.createElement("div");
      item.className = "project-item";
      item.style.setProperty("--skill-color", color);
      item.innerHTML = `
        <a href="travail.html?slug=${project.slug}" class="project-card">
          <img src="assets/images/${Array.isArray(project.image) ? project.image[0] : project.image}" class="project-image">
          <div class="project-content">
            <h3 class="project-title" style="color:${color}">${project.titre}</h3>
            <div class="project-meta"><span class="meta-tag" style="color:${color}; border-color:${color}; background:${color}15">${Array.isArray(project.pole) ? project.pole.join(' · ') : project.pole}</span></div>
          </div>
        </a>`;
      timeline.appendChild(item);
    });

    const lastProject = yearsGroup[year][yearsGroup[year].length - 1];
    const projectsCount = yearsGroup[year].length;
    const acCount = yearsGroup[year].reduce(
      (acc, p) => acc + (p.ac ? p.ac.split("|").length : 0),
      0,
    );
    const bilanText =
      lastProject.bilan_annee ||
      `Bilan de l'année pour la compétence ${skill}.`;

    const bilanLink = document.createElement("a");
    bilanLink.href = `travail.html?slug=${lastProject.slug}&type=bilan&skill=${skill}`;
    bilanLink.className = "bilan-separator-block clickable-bilan";
    bilanLink.style.display = "block";
    bilanLink.style.textDecoration = "none";
    bilanLink.innerHTML = `
      <div class="bilan-card" style="border-left-color: ${color}">
        <div class="bilan-header" style="color: ${color}">BILAN ${year} — ${skill} <span style="font-size: 0.8rem; float: right; color: #888;">Détails →</span></div>
        <div class="bilan-stats">
          <div class="stat-item"><strong>${projectsCount}</strong><span>Projets ${skill}</span></div>
          <div class="stat-item"><strong>${acCount}</strong><span>AC liées</span></div>
        </div>
        <div class="bilan-body" style="color: #444;">${bilanText}</div>
      </div>`;
    timeline.appendChild(bilanLink);
  });

  card.appendChild(timeline);
  return card;
}
