'use strict';

var
  COLS = 26,
  ROWS = 26,
  EMPTY = 0,
  SNAKE = 1,
  FRUIT = 2,

  DIRECTION = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3
  },

  KEY_LEFT = 37,
  KEY_UP = 38,
  KEY_RIGHT = 39,
  KEY_DOWN = 40,

  GAME = {
    canvas: createCanvas(),
    ctx: null,
    keystate: {},
    frames: 0,
    score: 0,

    attachEvents: function(){
      document.addEventListener('keydown', function(event) {
        this.keystate[event.keyCode] = true;
      }.bind(this));

      document.addEventListener('keyup', function(event) {
        delete this.keystate[event.keyCode];
      }.bind(this));
    }
  },

  grid = {
    width: null,
    height: null,
    _grid: null,

    // TODO: WTF is var d?
    init: function(d, colums, rows){
      this.width = colums;
      this.height = rows;
      this._grid = [];

      for (var x = 0; x < colums; x++) {
        this._grid.push([]);

        for (var y = 0; y < rows; y++) {
          this._grid[x].push(d);
        }
      }
    },

    set: function(val, x, y){
      this._grid[x][y] = val;
    },

    get: function(x, y){
      return this._grid[x][y];
    }
  },

  snake = {
    direction: null,
    _queue: null,

    init: function(direction, x, y){
      this.direction = direction;
      this._queue = [];
      this.insert(x, y);
    },

    insert: function(x, y){
      this._queue.unshift({
        x: x,
        y: y
      });

      this.last = this._queue[0];
    },

    remove: function(){
      return this._queue.pop();
    }
  };

function setFood () {
  var
    empty = [],
    randomPosition;

  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      if (grid.get(x, y) === EMPTY) {
        empty.push({
          x: x,
          y: y
        });
      }
    }
  }

  randomPosition = empty[Math.floor(Math.random() * empty.length)];
  grid.set(FRUIT, randomPosition.x, randomPosition.y);
}

function createCanvas () {
  var canvas = document.createElement('canvas');

  canvas.width = COLS * 20;
  canvas.height = ROWS * 20;
  document.body.appendChild(canvas);

  return canvas;
}

function createContext () {
  var ctx = GAME.canvas.getContext('2d');

  ctx.font = '12px Helvetica';

  return ctx;
}

function main () {
  GAME.ctx = createContext();
  GAME.attachEvents();

  init();
  loop();
}

function init () {
  var startPoint = {
    x: Math.floor(COLS / 2),
    y: ROWS - 1
  };

  grid.init(EMPTY, COLS, ROWS);
  snake.init(DIRECTION.UP, startPoint.x, startPoint.y);
  grid.set(SNAKE, startPoint.x, startPoint.y);

  setFood();
}

function loop () {
  update();
  draw();

  window.requestAnimationFrame(loop, GAME.canvas);
}

function update () {
  var
    nx,
    ny,
    tail;

  GAME.frames++;

  if (GAME.keystate[KEY_LEFT] && (snake.direction !== DIRECTION.RIGHT)) {
    snake.direction = DIRECTION.LEFT;
  }

  if (GAME.keystate[KEY_UP] && (snake.direction !== DIRECTION.DOWN)) {
    snake.direction = DIRECTION.UP;
  }

  if (GAME.keystate[KEY_RIGHT] && (snake.direction !== DIRECTION.LEFT)) {
    snake.direction = DIRECTION.RIGHT;
  }

  if (GAME.keystate[KEY_DOWN] && (snake.direction !== DIRECTION.UP)) {
    snake.direction = DIRECTION.DOWN;
  }

  if (GAME.frames % 5 === 0) {
    nx = snake.last.x;
    ny = snake.last.y;

    switch (snake.direction) {
      case DIRECTION.LEFT:
        nx--;
        break;
      case DIRECTION.UP:
        ny--;
        break;
      case DIRECTION.RIGHT:
        nx++;
        break;
      case DIRECTION.DOWN:
        ny++;
        break;
    }

    if (0 > nx || nx > grid.width - 1 ||
      0 > ny || ny > grid.height - 1 ||
      grid.get(nx, ny) === SNAKE
    ) {
      return init();
    }

    if (grid.get(nx, ny) === FRUIT) {
      tail = {
        x: nx,
        y: ny
      };

      GAME.score += 1;
      setFood();
    }

    else {
      tail = snake.remove();
      grid.set(EMPTY, tail.x, tail.y);
      tail.x = nx;
      tail.y = ny;
    }

    grid.set(SNAKE, tail.x, tail.y);
    snake.insert(tail.x, tail.y);
  }
}

function draw () {
  var
    tw = GAME.canvas.width / grid.width,
    th = GAME.canvas.height / grid.height;

  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      switch (grid.get(x, y)) {
        case EMPTY:
          GAME.ctx.fillStyle = '#fff';
          break;
        case SNAKE:
          GAME.ctx.fillStyle = '#0ff';
          break;
        case FRUIT:
          GAME.ctx.fillStyle = '#f00';
          break;
      }

      GAME.ctx.fillRect(x * tw, y * th, tw, th);
    }
  }

  GAME.ctx.fillStyle = '#000';
  GAME.ctx.fillText('SCORE: ' + GAME.score, 10, GAME.canvas.height - 10);
}

main();
