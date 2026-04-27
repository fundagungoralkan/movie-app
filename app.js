const API_KEY = "6bd0e62ed5b8a4300f5736ee8ff79a25";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const positions = [
  { h: 560, z: 200, rY: 40, clip: "polygon(0 0, 100% 8%, 100% 92%, 0 100%)" },
  { h: 500, z: 140, rY: 25, clip: "polygon(0 0, 100% 6%, 100% 94%, 0 100%)" },
  { h: 440, z: 80, rY: 12, clip: "polygon(0 0, 100% 4%, 100% 96%, 0 100%)" },
  { h: 360, z: 0, rY: 0, clip: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }, // Center
  { h: 440, z: 80, rY: -12, clip: "polygon(0 4%, 100% 0, 100% 100%, 0 96%)" },
  { h: 500, z: 140, rY: -25, clip: "polygon(0 6%, 100% 0, 100% 100%, 0 94%)" },
  { h: 560, z: 200, rY: -40, clip: "polygon(0 8%, 100% 0, 100% 100%, 0 92%)" },
];

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const closeBtn = document.getElementById("closeBtn");

// İlk yükleme (Popüler filmler)
getMovies(
  `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`,
);

async function getMovies(url) {
  const res = await fetch(url);
  const data = await res.json();
  renderSlider(data.results.slice(0, 7));
}

function renderSlider(movies) {
  main.innerHTML = "";
  main.classList.remove("blurred");
  closeBtn.classList.remove("visible");

  movies.forEach((movie, i) => {
    if (!positions[i]) return;
    const pos = positions[i];
    const card = document.createElement("div");
    card.classList.add("movie");

    gsap.set(card, {
      height: pos.h,
      clipPath: pos.clip,
      transform: `translateZ(${pos.z}px) rotateY(${pos.rY}deg)`,
      zIndex: 1,
      x: 0,
    });

    card.innerHTML = `
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
            <div class="card-info-box">
                <h2>${movie.title}</h2>
                <p>${movie.overview ? movie.overview.substring(0, 80) + "..." : "Premium content."}</p>
            </div>
        `;

    card.onclick = () => expandCard(card);
    main.appendChild(card);
  });
}

function expandCard(card) {
  if (card.classList.contains("expanded")) return;

  main.classList.add("blurred");
  card.classList.add("expanded");
  closeBtn.classList.add("visible");

  // MERKEZLEME HESABI
  const cardRect = card.getBoundingClientRect();
  const screenCenter = window.innerWidth / 2;
  const cardCenter = cardRect.left + cardRect.width / 2;
  const offset = screenCenter - cardCenter;

  gsap.to(card, {
    x: offset,
    width: 400,
    height: 550,
    z: 600,
    rotateY: 0,
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    duration: 0.2,
    ease: "power2.out",
    zIndex: 1000,
  });
}

// SEARCH AKTİVASYONU
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm && searchTerm !== "") {
    getMovies(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}`,
    );
    search.value = "";
  } else {
    window.location.reload();
  }
});

closeBtn.onclick = () => {
  // Mevcut görünümü sıfırla (yeniden render etmeden)
  renderSlider(currentMoviesStoredLocally);
  // Not: Arama sonuçlarını korumak için global bir değişkende tutabilirsin.
  // Şimdilik en hızlı çözüm:
  getMovies(
    `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`,
  );
};

// Sadece kapatma butonu için basit tetikleyici
closeBtn.addEventListener("click", () => {
  location.reload(); // En güvenli slider resetleme
});
