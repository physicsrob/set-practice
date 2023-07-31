// Constants for shapes, colors and fills
const SHAPES = ['squiggle', 'oval', 'diamond'];
const COLORS = ['red', 'green', 'blue'];
const FILLS = ['empty', 'filled', 'hatched'];

let promptCards = document.getElementById('prompt-cards');
let answerCards = document.getElementById('answer-cards');
let gameOver = document.getElementById("game-over");
let startButton = document.getElementById('startButton');
let scoreElement = document.getElementById('score');
let timeElement = document.getElementById("time-left");

function createCard(count, shape, fill, color) {
    return { count, shape, fill, color };
}

function generateCards(numCards) {
    const cards = new Set();
    while (cards.size < numCards) {
        const count = Math.floor(Math.random() * 3) + 1;
        const shape = SHAPES[Math.floor(Math.random() * 3)];
        const fill = FILLS[Math.floor(Math.random() * 3)];
        const color = COLORS[Math.floor(Math.random() * 3)];
        const card = createCard(count, shape, fill, color);
        // Use JSON string to make a unique representation of the card
        cards.add(JSON.stringify(card));
    }
    return Array.from(cards, JSON.parse); // convert back to card objects
}

function renderCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    for(let i = 0; i < card.count; i++) {
        const svgContainer = document.createElement('div');
        if(card.count == 2) {
            svgContainer.style.margin = '5px';
        }
        svgContainer.style.display = 'flex';
        svgContainer.style.alignItems = 'center';
        if((i==0) && (card.count>1)) {
            svgContainer.style.justifyContent = 'right';
        } else if((i==(card.count-1)) && (i>0)) {
            svgContainer.style.justifyContent = 'left';
        } else {
            svgContainer.style.justifyContent = 'center';
        }
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('shape');
        svg.setAttribute('viewBox', '0 0 200 400');
        const fillAttr = getFillAttribute(card.fill, card.color);
        const strokeAttr = `stroke="${card.color}" stroke-width="18" fill="none"`;
        svg.innerHTML = `<use href="#${card.shape}" ${fillAttr}></use>
                         <use href="#${card.shape}" ${strokeAttr}></use>`;
        svgContainer.appendChild(svg);

        cardElement.appendChild(svgContainer);
    }
    return cardElement;
}

function getFillAttribute(fill, color) {
    switch (fill) {
        case 'empty':
            return 'fill="none"';
        case 'filled':
            return `fill="${color}"`;
        case 'hatched':
            return `fill="${color}" mask="url(#mask-stripe)"`;
        default:
            return '';
    }
}



function renderPromptCards(cards) {
    cards.forEach(card => {
        cardElement = renderCard(card);
        promptCards.appendChild(cardElement);
    });

}

function renderOptionCards(answerCard, dist1, dist2) {
    let options = shuffleArray([answerCard, dist1, dist2]);

    options.forEach(option => {
        cardElement = renderCard(option);
        
        // Add data-answer attribute
        if (areCardsEqual(option, answer)) {
            cardElement.setAttribute('data-answer', 'true');
        } else {
            cardElement.setAttribute('data-answer', 'false');
        }
        
        // Add event listener
        cardElement.addEventListener('click', handleCardClick);
        answerCards.appendChild(cardElement);
        
    });

}

function handleCardClick(event) {
    const card = event.currentTarget;
    const isAnswer = card.getAttribute('data-answer') === 'true';
    
    if (isAnswer) {
        score++;
        // Change background to green
        document.body.style.backgroundColor = 'green';

        // Wait for 500ms, then start the next turn
        setTimeout(startTurn, 500);
    } else {
        score--;
        // Change background to red
        document.body.style.backgroundColor = 'red';
    }
    
    // Update score display
    scoreElement.textContent = ` ${score}`;
    
}


function getAnswer(card1, card2) {
    const result = {};
    const attributes = ['count', 'shape', 'fill', 'color'];

    for(let attribute of attributes) {
        if(card1[attribute] === card2[attribute]) {
            result[attribute] = card1[attribute];
        }
        else {
            // Get all possible options for this attribute
            const allOptions = attribute === 'count' ? [1, 2, 3] : attribute === 'shape' ? SHAPES : attribute === 'fill' ? FILLS : COLORS;
            
            // Find the one not present in card1 or card2
            result[attribute] = allOptions.filter(option => option !== card1[attribute] && option !== card2[attribute])[0];
        }
    }
    
    return result;
}

function getRandomDistractor(answerCard) {
    // Make a copy of the answerCard
    let distractor = {...answerCard};
    
    // Choose a random attribute to change
    const attributes = ['shape', 'fill', 'color'];
    const attributeToChange = attributes[Math.floor(Math.random() * attributes.length)];

    // Generate a new value for the attribute
    let newValue;
    do {
        if(attributeToChange === 'count') {
            newValue = Math.floor(Math.random() * 3) + 1;
        } 
        else if(attributeToChange === 'shape') {
            newValue = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        } 
        else if(attributeToChange === 'fill') {
            newValue = FILLS[Math.floor(Math.random() * FILLS.length)];
        } 
        else if(attributeToChange === 'color') {
            newValue = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
    } while(newValue === distractor[attributeToChange]) // Ensure the new value is not the same as the original one

    // Set the new value
    distractor[attributeToChange] = newValue;
    
    return distractor;
}


function areCardsEqual(card1, card2) {
    return JSON.stringify(card1) === JSON.stringify(card2);
}

function shuffleArray(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


let timer;
let score = 0;
let timeLeft;

function startGame() {
    gameOver.style.display = "none";
    startButton.style.display = "none";
    promptCards.style.display = "block";
    answerCards.style.display = "block";

    scoreElement.innerHTML = "0"
    timeElement.innerHTML = ""

        
    // Initialize the timer to 60 seconds
    timeLeft = 60;

    // Initialize the score to 0
    score = 0;

    // Start the first turn
    startTurn();

    // Start the countdown
    timer = setInterval(function() {
        timeLeft--;
        // Update time display
        timeElement.innerText = "" + timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    // Stop the timer
    clearInterval(timer);

    // Display "Game Over" message
    gameOver.style.display = "block";
    startButton.style.display = "block";
    promptCards.style.display = "none";
    answerCards.style.display = "none";
}

function startTurn() {
    promptCards.innerHTML = "";
    answerCards.innerHTML = "";
    document.body.style.backgroundColor = '';
    // Your current code to start a turn goes here
    // Generate cards and render
    [card1, card2] = generateCards(2);
    renderPromptCards([card1, card2]);
    answer = getAnswer(card1, card2);
    dist1 = getRandomDistractor(answer);
    dist2 = getRandomDistractor(answer);
    while (areCardsEqual(dist1, dist2)) {
        dist2 = getRandomDistractor(answer);
    }
    renderOptionCards(answer, dist1, dist2);
}

window.onload = startGame;
startButton.addEventListener('click', startGame);
