const list = document.querySelector("#project-list");
const count = document.querySelector("#project-count");
const error = document.querySelector("#load-error");
let projects = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function link(text, url, className) {
  const href = safeLink(url);
  if (!href) return element("span", className, text);
  const node = element("a", className, text);
  node.href = href;
  node.rel = "noreferrer";
  return node;
}
function card(project) {
  const article = element("article", "project-card");
  article.id = project.id;
  const visual = element("div", "project-visual");
  const top = element("div", "visual-top");
  top.append(element("span", "project-symbol", project.id === "nexus" ? "◇" : "☂"), element("span", "project-status", project.status));
  const bottom = element("div", "visual-bottom");
  bottom.append(element("span", "", "YOUR SPACE. YOUR RHYTHM."), element("p", "", project.tagline));
  visual.append(top, bottom);
  const details = element("div", "project-details");
  const meta = element("div", "project-meta", "DESKTOP APPLICATION");
  meta.append(element("span", "version", `v${project.version}`));
  const tags = element("div", "feature-tags");
  for (const feature of project.features || []) tags.append(element("span", "", feature));
  details.append(meta, element("h3", "", project.name), element("p", "project-description", project.description), tags, element("p", "download-label", "CHOOSE YOUR PLATFORM"));
  const platforms = element("div", "platforms");
  for (const item of project.downloads || []) {
    const platform = element("div", "platform");
    platform.append(element("span", "platform-name", item.platform), element("span", "platform-detail", item.detail));
    const href = safeLink(item.url);
    if (href) platform.append(link("Download ↓", href, "download"));
    else platform.append(element("p", "download-unavailable", item.status));
    platforms.append(platform);
  }
  const links = element("div", "project-links");
  if (safeLink(project.repository)) links.append(link("Source code ↗", project.repository));
  if (safeLink(project.releases)) links.append(link("All releases ↗", project.releases));
  if (safeLink(project.source)) links.append(link("Source ZIP ↓", project.source));
  if (!links.childElementCount) links.append(element("span", "", "Source publication pending"));
  details.append(element("p", "project-notice", project.id === "nexus"
    ? "Works with RainCode. Bring a reviewed code report into Nexus as an AI task draft."
    : "Works with Nexus. Export code-review findings as a handoff packet."));
  details.append(platforms, element("p", "project-notice", project.notice), links);
  article.append(visual, details);
  return article;
}
function render(filter = "all") {
  const visible = projects.filter(project => filter === "all" || project.category === filter || project.stage === filter);
  list.replaceChildren(...visible.map(card));
  if (!visible.length) list.append(element("p", "empty-state", "No projects in this category yet."));
  count.textContent = `${String(visible.length).padStart(2, "0")} ${visible.length === 1 ? "project" : "projects"}`;
}
for (const button of document.querySelectorAll("[data-filter]")) {
  button.addEventListener("click", () => {
    for (const other of document.querySelectorAll("[data-filter]")) {
      const selected = button === other;
      other.classList.toggle("selected", selected);
      other.setAttribute("aria-pressed", String(selected));
    }
    render(button.dataset.filter);
  });
}
fetch("projects.json", { credentials: "omit" })
  .then(response => { if (!response.ok) throw Error("Catalog unavailable"); return response.json(); })
  .then(data => {
    if (!Array.isArray(data.projects) || data.projects.length > 100) throw Error("Invalid catalog");
    projects = data.projects;
    render();
  })
  .catch(() => { error.hidden = false; count.textContent = "Catalog unavailable"; });
