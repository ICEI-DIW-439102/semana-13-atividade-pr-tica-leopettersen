// =============================================
//  Página de Detalhes — TMDB via QueryString
// =============================================

const API_KEY  = "245fd21d958d1f6f6971fa8fa17aef42";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

const container = document.getElementById("details-container");
const messageEl = document.getElementById("message");

// =============================================
//  1. Lê o id da URL via URLSearchParams
// =============================================
function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// =============================================
//  2. Busca detalhes do filme no TMDB
// =============================================
async function fetchMovieDetails(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "pt-BR",
    append_to_response: "credits",
  });
  const response = await fetch(`${BASE_URL}/movie/${id}?${params}`);
  if (!response.ok) throw new Error(`Filme não encontrado (status ${response.status})`);
  return response.json();
}

// =============================================
//  3. Renderiza os detalhes na página
// =============================================
function renderDetails(m) {
  document.title = `${m.title} — Catálogo Filmes`;

  // Backdrop como fundo do hero
  const backdrop = m.backdrop_path
    ? `style="background-image: url('${IMG_BACKDROP}${m.backdrop_path}')"`
    : "";

  // Poster
  const poster = m.poster_path
    ? `<img class="details-poster" src="${IMG_BASE}${m.poster_path}" alt="Poster de ${m.title}">`
    : `<div class="details-no-poster">🎞️</div>`;

  // Gêneros como chips
  const genres = m.genres?.map(g =>
    `<span class="genre-tag">${g.name}</span>`
  ).join("") ?? "";

  // Tags extras
  const info = [
    m.release_date ? `📅 ${m.release_date.slice(0,4)}` : null,
    m.runtime      ? `🕐 ${m.runtime} min`             : null,
    m.original_language ? `🌐 ${m.original_language.toUpperCase()}` : null,
    m.vote_count   ? `🗳️ ${m.vote_count.toLocaleString()} votos`    : null,
  ].filter(Boolean).map(i => `<span>${i}</span>`).join("");

  // Elenco principal (até 6)
  const cast = m.credits?.cast?.slice(0, 6).map(p =>
    `<span class="cast-tag">${p.name}</span>`
  ).join("") ?? "";

  container.innerHTML = `
    <div class="details-hero" ${backdrop}>
      <div class="details-hero-overlay"></div>
      <div class="details-hero-inner">
        ${poster}
        <div class="details-info">
          <h2 class="details-title">${m.title}</h2>
          ${m.tagline ? `<p class="details-tagline">"${m.tagline}"</p>` : ""}
          <div class="details-meta">${info}</div>
          <div class="details-rating">
            <span class="rating-star">★</span>
            <span class="rating-value">${m.vote_average?.toFixed(1) ?? "N/A"}</span>
            <span class="rating-label">/ 10</span>
          </div>
          ${genres ? `<div class="modal-genres">${genres}</div>` : ""}
        </div>
      </div>
    </div>

    <div class="details-body">
      ${m.overview ? `
        <section class="details-section">
          <h3 class="section-title">Sinopse</h3>
          <p class="details-overview">${m.overview}</p>
        </section>` : ""}

      ${cast ? `
        <section class="details-section">
          <h3 class="section-title">Elenco Principal</h3>
          <div class="cast-list">${cast}</div>
        </section>` : ""}
    </div>
  `;
}

// =============================================
//  4. Exibe mensagem ao usuário
// =============================================
function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle("error", isError);
}

// =============================================
//  5. init — orquestra tudo
// =============================================
async function init() {
  const id = getIdFromURL();

  if (!id) {
    showMessage("Nenhum filme selecionado. Volte ao catálogo e clique em um filme.", true);
    return;
  }

  showMessage("Carregando...");

  try {
    const movie = await fetchMovieDetails(id);
    showMessage("");
    renderDetails(movie);
  } catch (err) {
    showMessage(`Não foi possível carregar o filme. Verifique sua API Key. (${err.message})`, true);
    console.error(err);
  }
}

init();