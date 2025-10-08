// client.mjs

// state
const allButtons = [];
let moveCounter = 0;
let cheesesFound = 0;
let noOfCheeses = 0;
let gameHour = 0;

// Use SAME-ORIGIN so you don't have to hardcode your azure URL
// If you really want absolute: const base = 'https://YOUR-APP.azurewebsites.net/';
const base = '/';

const startUrl = base + 'getstart.json';
const getStyleUrl = base + 'getstyle.json';

function getFromServer(url, handler) {
  fetch(url, { cache: 'no-store' })
    .then(r => r.text())
    .then(handler)
    .catch(err => alert('Fetch error: ' + err));
}

function showCounters() {
  const counterPar = document.getElementById('counterPar');
  const cheesesLeft = noOfCheeses - cheesesFound;
  counterPar.textContent = 'Cheeses left: ' + cheesesLeft + '  Tries: ' + moveCounter;
}

function fillGrid(buttons) {
  for (const button of buttons) {
    if (button.className === 'empty') setButtonStyle(button);
  }
}

function setButtonStyle(button) {
  const x = button.getAttribute('x');
  const y = button.getAttribute('y');
  const checkUrl = `${getStyleUrl}?x=${x}&y=${y}`;
  getFromServer(checkUrl, result => {
    const checkDetails = JSON.parse(result);

    // Hour rollover protection
    if (checkDetails.hour != gameHour) {
      alert('The game in this hour has ended.');
      location.reload();
      return;
    }

    button.className = checkDetails.style;

    if (button.className === 'cheese') {
      cheesesFound++;
      if (cheesesFound === noOfCheeses) fillGrid(allButtons);
      showCounters();
    }
  });
}

function buttonClickedHandler(e) {
  const button = e.target;
  if (button.className !== 'empty') return;
  setButtonStyle(button);
  moveCounter++;
  showCounters();
}

function setupGame(gameDetailsJSON) {
  const gameDetails = JSON.parse(gameDetailsJSON);
  noOfCheeses = gameDetails.noOfCheeses;
  gameHour = gameDetails.hour;

  const container = document.getElementById('buttonPar');
  container.innerHTML = '';           // reset grid if replaying
  allButtons.length = 0;              // clear old refs

  for (let y = 0; y < gameDetails.height; y++) {
    for (let x = 0; x < gameDetails.width; x++) {
      const newButton = document.createElement('button');
      newButton.className = 'empty';
      newButton.setAttribute('x', x);
      newButton.setAttribute('y', y);
      newButton.textContent = 'X';
      newButton.addEventListener('click', buttonClickedHandler);
      container.appendChild(newButton);
      allButtons.push(newButton);
    }
    container.appendChild(document.createElement('br'));
  }

  showCounters();
}

function doPlayGame() {
  moveCounter = 0;
  cheesesFound = 0;
  getFromServer(startUrl, setupGame);
}

export { doPlayGame };
