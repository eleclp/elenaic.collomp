// ── FORMATER LA DESCRIPTION (titres gras, tirets en liste) ──
function formatDescription(text) {
  if (!text) return "";

  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("– ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${trimmed.slice(2)}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      if (trimmed === "") {
        html += "<br>";
      } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        const content = trimmed.slice(2, -2);
        html += `<strong>${content}</strong>`;
      } else {
        html += `<p>${trimmed}</p>`;
      }
    }
  }
  if (inList) html += "</ul>";
  return html;
}

// ── RÉCUPÉRER LES PARAMÈTRES DEPUIS L'URL ──
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const isBilan = params.get("type") === "bilan";
const forcedSkill = params.get("skill");

const container = document.getElementById("project-detail");

const skillColorHex = {
  Développer: "#1A5F7A",
  Concevoir: "#8162ac",
  Exprimer: "#C85C2E",
  Comprendre: "#0a2914",
  Entreprendre: "#A55E7A",
};

fetch("projects.json")
  .then((res) => res.json())
  .then((data) => {
    const currentIndex = data.findIndex((p) => p.slug === slug);
    const projet = data[currentIndex];

    if (!projet) {
      container.innerHTML =
        "<div class='error-msg'><h2>Projet introuvable</h2></div>";
      return;
    }

    const currentSkill = forcedSkill || projet.skills[0];
    const color = skillColorHex[currentSkill] || "#ffee09";

    // ── CAS 1 : AFFICHAGE DU BILAN ──
    if (isBilan) {
      document.title = `Bilan ${currentSkill} - ${projet.year}`;
      container.style.setProperty("--skill-color", color);

      const filteredProjects = data.filter(
        (p) => p.year === projet.year && p.skills.includes(currentSkill),
      );
      const totalAC = filteredProjects.reduce(
        (acc, p) => acc + (p.ac ? p.ac.split("|").length : 0),
        0,
      );

      const lastProjOfBilan = filteredProjects[filteredProjects.length - 1];
      const globalIdx = data.findIndex((p) => p.slug === lastProjOfBilan.slug);
      const nextProj = data[globalIdx + 1] || data[0];

      container.innerHTML = `
        <div class="bilan-display-container">
          <h1 class="bilan-title" style="color:${color}">bilan ${currentSkill.toLowerCase()}</h1>
          <h2 class="bilan-year-tag" style="background: ${color}; color: white;">${projet.year}</h2>
          
          <div class="bilan-stats-grid">
            <div class="bilan-stat-card">
              <span class="stat-number" style="color:${color} !important">${filteredProjects.length}</span>
              <span class="stat-label">projets réalisés</span>
            </div>
            <div class="bilan-stat-card">
              <span class="stat-number" style="color:${color} !important">${totalAC}</span>
              <span class="stat-label">ac validées</span>
            </div>
          </div>

          <div class="bilan-content-box" style="border-top: 5px solid ${color}">
            <h3>rétrospective de la compétence</h3>
            <p>${projet.bilan_annee || "Analyse des acquis."}</p>
          </div>
          
          <div class="project-navigation">
             <a href="travail.html?slug=${lastProjOfBilan.slug}" class="nav-project-link">
              <span class="nav-arrow">←</span>
              <div class="nav-details"><span class="nav-label">Retour au projet</span><span class="nav-title">${lastProjOfBilan.titre}</span></div>
            </a>
            <a href="travail.html?slug=${nextProj.slug}" class="nav-project-link next">
              <div class="nav-details"><span class="nav-label">Projet Suivant</span><span class="nav-title">${nextProj.titre}</span></div>
              <span class="nav-arrow">→</span>
            </a>
          </div>

          <div class="navigation-footer">
            <a href="projets.html" class="back-link">← retour aux compétences</a>
          </div>
        </div>
      `;
      return;
    }

    // ── CAS 2 : AFFICHAGE PROJET STANDARD ──
    document.title = projet.titre;
    container.style.setProperty("--skill-color", color);

    const skillFamily = data.filter((p) => p.skills.includes(currentSkill));
    const posInFamily = skillFamily.findIndex((p) => p.slug === projet.slug);

    let nextLink = "";
    const isLastOfYear =
      posInFamily === skillFamily.length - 1 ||
      skillFamily[posInFamily + 1].year !== projet.year;

    if (isLastOfYear && projet.bilan_annee) {
      nextLink = `travail.html?slug=${projet.slug}&type=bilan&skill=${currentSkill}`;
    } else {
      const nextProj = data[currentIndex + 1] || data[0];
      nextLink = `travail.html?slug=${nextProj.slug}`;
    }

    const prevProj = data[currentIndex - 1] || data[data.length - 1];

    const images = Array.isArray(projet.image) ? projet.image : [projet.image];
    const imagesHTML = images
      .map((img) => `<img src="assets/images/${img}" alt="${projet.titre}">`)
      .join("");
    const acHTML = projet.ac
      ? projet.ac
          .split("|")
          .map((item) => `<div class="ac-badge-item">${item.trim()}</div>`)
          .join("")
      : "";

    container.innerHTML = `
      <h1 style="color:${color}">${projet.titre}</h1>
      <div class="project-info">
        <span class="info-button">${projet.year}</span>
        <span class="info-button">${projet.pole || "MMI"}</span> <div class="skills-container">
          ${projet.skills.map((s) => `<span class="skill-button" style="background:${skillColorHex[s] || color}">${s.toLowerCase()}</span>`).join("")}
        </div>
      </div>

      <div class="slider-wrapper">
        <button class="slider-arrow arrow-left" onclick="scrollSlider(-1)">‹</button>
        <div class="project-slider" id="slider">${imagesHTML}</div>
        <button class="slider-arrow arrow-right" onclick="scrollSlider(1)">›</button>
      </div>

      <div class="ac-section">
        <h3>apprentissages critiques</h3>
        <div class="ac-grid">${acHTML}</div>
      </div>

      <div class="project-description-full">
        <h3>le projet</h3>
        <div class="description-text">${formatDescription(projet.description)}</div>
      </div>

      <div class="project-eval">
        <h4>mon regard</h4>
        <div class="stars" style="color:${color}">
          ${"★".repeat(projet.rating || 0)}${"☆".repeat(5 - (projet.rating || 0))}
        </div>
        <p class="eval-text">${projet.evaluation || ""}</p>
      </div>

      <div class="project-navigation">
        <a href="travail.html?slug=${prevProj.slug}" class="nav-project-link">
          <span class="nav-arrow">←</span>
          <div class="nav-details"><span class="nav-label">Précédent</span><span class="nav-title">${prevProj.titre}</span></div>
        </a>
        <a href="${nextLink}" class="nav-project-link next">
          <div class="nav-details">
            <span class="nav-label">${nextLink.includes("type=bilan") ? "Voir le Bilan" : "Suivant"}</span>
            <span class="nav-title">${nextLink.includes("type=bilan") ? "Fin de cycle " + projet.year : data[data.findIndex((p) => p.slug === (data[currentIndex + 1]?.slug || data[0].slug))].titre}</span>
          </div>
          <span class="nav-arrow">→</span>
        </a>
      </div>

      <div class="navigation-footer">
        <a href="projets.html" class="back-link">← retour aux compétences</a>
      </div>
    `;
  });

function scrollSlider(direction) {
  const slider = document.getElementById("slider");
  if (slider) {
    const scrollAmount = slider.clientWidth;
    slider.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  }
}

// Bouton Scroll To Top
const scrollBtn = document.getElementById("scrollToTop");
if (scrollBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) scrollBtn.classList.add("show");
    else scrollBtn.classList.remove("show");
  });
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
