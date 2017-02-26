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
    for (let i = row-1; i <= row+1; i++) {
        if (i < 0 || i >= world.length) continue;
        for(let j = col-1; j <= col+1; j++) {
            if (j < 0 || j >= world[0].length) continue;
            incrementField(world, i, j);
        }
    }
}

function incrementField(world, row, col) {
    let field =world[row][col];
    if (!field || field === 'x') return;
    world[row][col] = field === ' ' ? 1 : field+1;
}
function showWorld(world) {
    world.map( (row)=> console.log(row.join(' ')));
}
function makeHtml(width, height) {
    let row = '<div class="row">'+new Array(width).fill('<div></div>').join('')+'</div>';
    return Array(height).fill(row).join('');
}

function fill(world, row, col) {
    if (row<0 || row>=world.length || col<0 || col>=world[0].length) return;
    let val = reveal(row, col);
    console.log('reveal', val);
    if (val === ' ') {
        fill(world, row+1, col);
        fill(world, row-1, col);
        fill(world, row, col+1);
        fill(world, row, col-1);
    }
}

let world = makeWorld(8, 8, 1/10);
let playingField = document.getElementById('playingField');
playingField.innerHTML = makeHtml(8, 8);
playingField.addEventListener('mousedown', (e) => {
    let rowElement = e.target.parentElement;
    let col = Array.from(rowElement.children).indexOf(e.target);
    let row = Array.from(rowElement.parentElement.children).indexOf(rowElement);
    if (e.button === 2) return e.target.classList.add('flag');
    fill(world, row, col);
});

function reveal(row, col) {
    let el = document.getElementById('playingField').children[row].children[col];
    let val = world[row][col];
    if (el.classList.contains('revealed')) return 'r';
    el.classList.add('revealed');
    if (val === 'x') {
        el.classList.add('bomb');
        document.getElementById('explosion').play();
        return console.log('boom');
    }
    el.innerHTML = val;
    return val;
}

document.body.addEventListener('contextmenu', (e) => e.preventDefault(), false);
