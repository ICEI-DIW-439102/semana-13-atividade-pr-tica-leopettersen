// =============================================
//  Catálogo de Filmes — TMDB Fetch API
// =============================================

const API_KEY = "245fd21d958d1f6f6971fa8fa17aef42";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Mapeamento de endpoint pelo filtro ativo
const ENDPOINTS = {
  popular:    "/movie/popular",
  top_rated:  "/movie/top_rated",
  now_playing: "/movie/now_playing",
  upcoming:   "/movie/upcoming",
  search:     "/search/movie",
};

// Estado da aplicação
let currentEndpoint = "popular";
let currentQuery = "";

// =============================================
//  Referências ao DOM
// =============================================
const movieList  = document.getElementById("movie-list");
const messageEl  = document.getElementById("message");
const searchInput = document.getElementById("search");
const btnSearch  = document.getElementById("btnSearch");
const filterBtns = document.querySelectorAll(".filter-btn");

// =============================================
//  1. fetchMovies — requisição à API
// =============================================
async function fetchMovies(endpoint = "popular", query = "") {
  const path = query ? ENDPOINTS.search : ENDPOINTS[endpoint];
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "pt-BR",
    page: 1,
  });
  if (query) params.set("query", query);

  const url = `${BASE_URL}${path}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results; // array de filmes
}

// =============================================
//  2. createMovieCard — monta um card no DOM
// =============================================
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");

  // Poster
  if (movie.poster_path) {
    const img = document.createElement("img");
    img.classList.add("card-poster");
    img.src = `${IMG_BASE}${movie.poster_path}`;
    img.alt = `Poster de ${movie.title}`;
    img.loading = "lazy";
    card.appendChild(img);
  } else {
    const noPoster = document.createElement("div");
    noPoster.classList.add("card-no-poster");
    noPoster.textContent = "🎞️";
    card.appendChild(noPoster);
  }

  // Body
  const body = document.createElement("div");
  body.classList.add("card-body");

  // Título
  const title = document.createElement("h2");
  title.classList.add("card-title");
  title.textContent = movie.title || "Sem título";
  body.appendChild(title);

  // Meta (ano + nota)
  const meta = document.createElement("div");
  meta.classList.add("card-meta");

  const year = document.createElement("span");
  year.classList.add("card-year");
  year.textContent = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "—";
  meta.appendChild(year);

  const rating = document.createElement("span");
  rating.classList.add("card-rating");
  rating.textContent = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";
  meta.appendChild(rating);

  body.appendChild(meta);

  // Sinopse
  if (movie.overview) {
    const overview = document.createElement("p");
    overview.classList.add("card-overview");
    overview.textContent = movie.overview;
    body.appendChild(overview);
  }

  // Botão "Ver detalhes" → navega para details.html?id=<tmdb_id>
  const btnDetails = document.createElement("a");
  btnDetails.classList.add("btn-details");
  btnDetails.href = `details.html?id=${movie.id}`;
  btnDetails.textContent = "Ver detalhes";
  body.appendChild(btnDetails);

  card.appendChild(body);

  // Clique no card (exceto no botão) abre o modal
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".btn-details")) openModal(movie.id);
  });

  return card;
}

// =============================================
//  3. renderMovies — limpa e popula o container
// =============================================
function renderMovies(movies) {
  movieList.innerHTML = "";

  if (!movies || movies.length === 0) {
    showMessage("Nenhum filme encontrado.");
    return;
  }

  showMessage("");

  const fragment = document.createDocumentFragment();
  movies.forEach(movie => {
    fragment.appendChild(createMovieCard(movie));
  });
  movieList.appendChild(fragment);
}

// =============================================
//  4. showSkeletons — feedback visual de carregamento
// =============================================
function showSkeletons(count = 10) {
  movieList.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.classList.add("skeleton");
    sk.innerHTML = `
      <div class="skel-poster"></div>
      <div class="skel-body">
        <div class="skel-line"></div>
        <div class="skel-line short"></div>
        <div class="skel-line"></div>
        <div class="skel-line short"></div>
      </div>
    `;
    movieList.appendChild(sk);
  }
}

// =============================================
//  5. showMessage — exibe mensagens ao usuário
// =============================================
function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle("error", isError);
}

// =============================================
//  6. loadMovies — orquestra busca + renderização
// =============================================
async function loadMovies() {
  showSkeletons();
  showMessage("Carregando...");

  try {
    const movies = await fetchMovies(currentEndpoint, currentQuery);
    renderMovies(movies);
  } catch (err) {
    movieList.innerHTML = "";
    showMessage(`Falha ao carregar filmes. Verifique sua API Key e tente novamente. (${err.message})`, true);
    console.error(err);
  }
}

// =============================================
//  7. Eventos — busca e filtros
// =============================================

// Botão "Buscar"
btnSearch.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  currentEndpoint = "popular"; // endpoint padrão quando busca
  deselectFilterBtns();
  loadMovies();
});

// Enter no input de busca
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnSearch.click();
});

// Limpar busca ao apagar tudo no input
searchInput.addEventListener("input", () => {
  if (searchInput.value === "" && currentQuery !== "") {
    currentQuery = "";
    selectFilterBtn("popular");
    currentEndpoint = "popular";
    loadMovies();
  }
});

// Botões de filtro
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const endpoint = btn.dataset.endpoint;
    currentEndpoint = endpoint;
    currentQuery = "";
    searchInput.value = "";
    selectFilterBtn(endpoint);
    loadMovies();
  });
});

// =============================================
//  Helpers para estado dos botões de filtro
// =============================================
function deselectFilterBtns() {
  filterBtns.forEach(b => b.classList.remove("active"));
}

function selectFilterBtn(endpoint) {
  filterBtns.forEach(b => {
    b.classList.toggle("active", b.dataset.endpoint === endpoint);
  });
}

// =============================================
//  8. init — carregamento inicial da página
// =============================================
function init() {
  loadMovies();
}

init();