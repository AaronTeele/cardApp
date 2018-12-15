let state = {
    game: false,
    shuffle: {},
    draw: {},
};

class Storage {
    constructor(key) {
        this.key = key;
    }
    getStorage() {
        const data = window.localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        return data;
    }
    save(data) {
        window.localStorage.setItem(this.key, JSON.stringify(data))
    }
}

const storage = new Storage('cards');
const drawCard = document.querySelector('.js-draw-card');
const newDeck = document.querySelector('.js-new-deck');
const deckID = document.querySelector('.js-deck-ID');
const cardsLeft = document.querySelector('.js-cards-left');
const p1 = document.querySelector('.js-p1');
const p2 = document.querySelector('.js-p2');
const container = document.querySelector('.container');
const playArea = document.querySelector('.js-play-area');
const shuffleURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';

const render = state => {
    //if game is started, remove hidden class
    if (state.game === true) {
        drawCard.classList.remove('hidden');
        p1.classList.remove('hidden');
        p2.classList.remove('hidden');
    };

    //set deck ID and cards remaining
    deckID.innerHTML = state.shuffle.deckID;
    cardsLeft.innerText = state.draw.remaining;
    output = '';

    //loop through cards
    for (let i = state.draw.cards.length - 1; i >= 0; i--) {
        //determine whether text is to appear on top or bottom of card
        if (state.draw.cards[i].topText === false) {
            output += `<div class="col-sm-6 col-md-4 col-lg-3">
                        <p class="cardText js-above hidden">${state.draw.cards[i].value} OF ${state.draw.cards[i].suit}</p>
                        <img src=${state.draw.cards[i].image} data-index=${i}>
                        <p class="cardText js-below">${state.draw.cards[i].value} OF ${state.draw.cards[i].suit}</p>
                   </div>`
        } else {
            output += `<div class="col-sm-6 col-md-4 col-lg-3">
                        <p class="cardText js-above">${state.draw.cards[i].value} OF ${state.draw.cards[i].suit}</p>
                        <img src=${state.draw.cards[i].image} data-index=${i}>
                        <p class="cardText js-below hidden">${state.draw.cards[i].value} OF ${state.draw.cards[i].suit}</p>
                       </div>`
        };
    };
    
    playArea.innerHTML = output;

};

//----------API's

const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);
        cb(data);
    });
    request.send();
};

//----------Event Listeners

newDeck.addEventListener('click', e => {
    //start new game with empty board
    state.game = true;
    state.draw.cards = [];
    //shuffle: get new deck, set deck ID
    GETRequest(shuffleURL, data => {
        state.shuffle.deckID = data.deck_id;
        state.draw.remaining = data.remaining;
        storage.save(state);
        render(state);
    });
});

drawCard.addEventListener('click', e => {
    const drawCardURL = `https://deckofcardsapi.com/api/deck/${state.shuffle.deckID}/draw/?count=1`;
    //if deck is empty, display alert and prevent API call
    if (state.draw.remaining === 0) {
        return alert('No m\xE1s tarjetas');
    };

    //draw card
    GETRequest(drawCardURL, data => {
        //set text on top to false, add card to state, update remaining cards
        data.cards[0].topText = false;
        state.draw.cards.push(data.cards[0]);
        state.draw.remaining = data.remaining;
        storage.save(state);
        render(state);
    });
});

//toggle text to top or bottom of card when card is clicked
container.addEventListener('click', e => {
    if (e.target.matches('img')) {
        //grab the data-index of the card
        const index = e.target.getAttribute('data-index');
        //Toggle the hidden class on top/bottom <p>
        state.draw.cards[index].topText = !state.draw.cards[index].topText;
        storage.save(state);
        render(state);
    };
    return;
});

// Checking if there is anything in the local storage
const stored_state = storage.getStorage();
if (stored_state) {
  // If there is then apply that to my state in Memory
  state = stored_state;
}

render(state);