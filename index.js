function makeWorld(width, height, bombDensity) {
    let fields = width * height;
    let bombs = Math.floor(fields * bombDensity);
    let world = Array(height).fill(undefined).map(() => {
        return Array(width).fill(' ');
    });

    markBombPositions(world, bombs);
    return world;
}

function markBombPositions(world, bombs) {
    do {
       let y = Math.floor(Math.random()*world.length);
       let x = Math.floor(Math.random()*world[0].length);
       if (world[y][x] !== 'x') {
           world[y][x] = 'x';
           bombs--;
           markSurrounding(world, y, x);
       }
    } while(bombs);

}

function markSurrounding(world, row, col) {
    function incrementField(world, row, col) {
        let field =world[row][col];
        if (!field || field === 'x') return;
        world[row][col] = field === ' ' ? 1 : field+1;
    }
    runAround(world, row, col, incrementField);
}

function makeHtml(width, height) {
    let row = '<div class="row">'+new Array(width).fill('<div></div>').join('')+'</div>';
    return Array(height).fill(row).join('');
}

function visitWorld(world, visit) {
    for (let i = 0; i < world.length; i++) {
        for(let j = 0; j < world[0].length; j++) {
            visit(world, i, j);
        }
    }
}

function checkIfWon(world)  {
    let correctFlags = 0;
    let bombs = 0;
    let fail = false;
    visitWorld(world, (world, row, col) => {
        let hasFlag = elementAt(row, col).classList.contains('flag');
        if (world[row][col] == 'x') {
            bombs++;
            if (hasFlag) correctFlags++;
        } else {
            if (hasFlag) fail = true;
        }
    });
    if (fail) return false;
    if (correctFlags == bombs) return true;
    return false;
}

function runAround(world, row, col, visit) {
    for (let i = row-1; i <= row+1; i++) {
        if (i < 0 || i >= world.length) continue;
        for(let j = col-1; j <= col+1; j++) {
            if (j < 0 || j >= world[0].length) continue;
            visit(world, i, j);
        }
    }
}

function elementAt(row, col) {
    return document.getElementById('playingField').children[row].children[col];
}

function click(world, e) {
    let rowElement = e.target.parentElement;
    let col = Array.from(rowElement.children).indexOf(e.target);
    let row = Array.from(rowElement.parentElement.children).indexOf(rowElement);
    if (e.button === 2) return e.target.classList.add('flag');
    if (world[row][col] == ' ') {
        return fill(world, row, col);
    }
    let val = reveal(world, row, col);
    if (val=='r') {
        // user clicked on a revealed number
        let flags = 0;
        runAround(world, row, col, (world, row, col)=> {
            if (elementAt(row, col).classList.contains('flag')) flags++;
        });
        if (flags !== world[row][col]) return;
        runAround(world, row, col, fill);
    }
}


function fill(world, row, col) {
    if (row<0 || row>=world.length || col<0 || col>=world[0].length) return;
    let val = reveal(world, row, col);
    if (val === ' ') {
        runAround(world, row, col, fill);
    }
}

function endGame(world, won) {
    if (won) revealRemaining(world);
    const button = document.getElementById('play');
    button.innerHTML = 'Play again';
    button.style.display = 'block';
    let clip = won ? 'audio#fireworks' : 'audio#explosion';
    document.querySelector(clip).play();
}

function reveal(world, row, col) {
    let el = elementAt(row, col);
    let val = world[row][col];
    if (el.classList.contains('revealed')) return 'r';
    if (el.classList.contains('flag')) return 'f';
    el.classList.add('revealed');
    if (val === 'x') {
        el.classList.add('bomb');
        return endGame(world, false);
    }
    el.innerHTML = val;
    return val;
}

function revealRemaining(world) {
   visitWorld(world, (world, row, col) => elementAt(row, col).classList.add('revealed'));
}

function startClock() {
    let startTime = Date.now();
    let clock = document.getElementById('clock');
    let clockId = setInterval( ()=>{
        let seconds = Math.floor((Date.now() - startTime) / 1000);
        clock.innerHTML = `${seconds}s`;
    }, 1000);
    return clockId;
}

function startGame(width, height, bombDensity, playingField) {
    let world = makeWorld(width, height, bombDensity);
    playingField.innerHTML = makeHtml(width, height);
    document.getElementById('clock').innerHTML = "0s";
    let clockId;
    function performClick(e) {
        click(world, e);
        if (checkIfWon(world)) {
            endGame(world, true);
        }
    }
    //TODO removing these listeners doesn't work because we make a new
    //function every time startGame is called.
    playingField.removeEventListener('mousedown', performClick, false);
    playingField.addEventListener('mousedown', performClick, false);
    playingField.addEventListener('mousedown', () => clockId = startClock(), {once: true});
    function stopClock() {
        clearInterval(clockId);
    }
    Array.from(document.getElementsByTagName('audio'))
        .forEach(el => {
            el.removeEventListener('play', stopClock);
            el.addEventListener('play', stopClock);
        });
}

function init(width, height, bombDensity) {
    let playingField = document.getElementById('playingField');
    document.getElementById('play').addEventListener('click', (e) => {
        e.target.style.display = 'none';
        startGame(width, height, bombDensity, playingField);
    });
    document.body.addEventListener('contextmenu', (e) => e.preventDefault(), false);
}

init(8, 4, 1/10);

