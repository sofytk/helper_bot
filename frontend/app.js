let current = 'home';
const app = document.getElementById('app');

document.getElementById('homeBtn').onclick = () => render('home');
document.getElementById('mapBtn').onclick = () => render('map');
document.getElementById('profileBtn').onclick = () => render('profile');

async function render(page) {
  current = page;
  if (page === 'home') renderHome();
  if (page === 'map') renderMap();
  if (page === 'profile') renderProfile();
}

function renderHome() {
  app.innerHTML = `
    <h2>🌿 Твое растение</h2>
    <img src="./assets/plant1.png" id="plantImg">
    <button id="collect">Собрать капли</button>
  `;
  document.getElementById('collect').onclick = async () => {
    await fetch("http://localhost:8000/users/1/add_water?amount=10", { method: "POST" });
    alert("Вы получили 10 капель воды!");
  };
}

function renderMap() {
  app.innerHTML = `<div id="map" style="width:100%;height:80vh;"></div>`;
  ymaps.ready(() => {
    const map = new ymaps.Map("map", { center: [55.75, 37.57], zoom: 10 });
  });
}

function renderProfile() {
  app.innerHTML = `
    <h3>Профиль пользователя</h3>
    <p>Миссии, достижения и уровни</p>
  `;
}

render('home');
