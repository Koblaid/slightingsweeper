

function Level(levelText){
    return {
        size: Math.sqrt(levelText.length),

        isMine: function(x, y){
            return levelText[this.size*y + x] === '1';
        },

        forEachAdjoiningCell: function(x, y, handler){
            for(var step_y=-1;step_y<=1;step_y++){
                var target_y = y + step_y;
                if(target_y < 0 || target_y >= this.size){
                    continue;
                }
                for(var step_x=-1;step_x<=1;step_x++){
                    var target_x = x + step_x;
                    if(target_x < 0 || target_x >= this.size){
                        continue;
                    }
                    handler(target_x, target_y);
                }
            }
        },
    };
}

EMPTY_CELL_CHAR = 'E';
FLAG_CHAR = '\u2690';
MINE_CHAR = '\u2620';

function Field(level){
    var field = Array(4);
    var isDead = false;
    for(var y=0;y<level.size;y++){
        var row = Array(4);
        for(var x=0;x<level.size;x++){
            row[x] = EMPTY_CELL_CHAR;
        }
        field[y] = row;
    }

    return {
        toText: function(){
            var text = ''
            for(var y=0;y<level.size;y++){
                text += '|';
                for(var x=0;x<level.size;x++){
                    text += field[y][x];
                }
                text += '|\n';
            }
            return text;
        },

        toTableBody: function(){
            var tbody = '';
            for(var y=0;y<level.size;y++){
                tbody += '<tr>';
                for(var x=0;x<level.size;x++){
                    var value = field[y][x];
                    var cls = value === EMPTY_CELL_CHAR || value === FLAG_CHAR ? 'bg-grey' : 'bg-white';
                    value = value === 0 || value === EMPTY_CELL_CHAR ? '' : value;
                    if (value === 1){
                        cls += ' fg-lightblue';
                    } else if (value === 2){
                        cls += ' fg-green';
                    } else if (value === 3){
                        cls += ' fg-red';
                    } else if (value === 4){
                        cls += ' fg-darkblue';
                    } else if (value === 5){
                        cls += ' fg-darkred';
                    }
                    if (value === MINE_CHAR){
                        cls += ' skull';
                    }
                    var fg = field[y][x] === EMPTY_CELL_CHAR ? 'silver' : 'white';
                    tbody += '<td class="'+cls+'" data-x="'+x+'" data-y="'+y+'">' + value + '</td>';
                }
                tbody += '</tr>';
            }
            return tbody;
        },

        uncover: function(x, y){
            if (field[y][x] === FLAG_CHAR || field[y][x] === MINE_CHAR){
                return;
            }

            var value;
            if(level.isMine(x, y)){
                value = MINE_CHAR;
            } else {
                value = 0;
                level.forEachAdjoiningCell(x, y, function(x1, y1){
                if (level.isMine(x1, y1)){
                    value += 1;
                }
            });
            }
            field[y][x] = value;
            return value;
        },

        uncoverAll: function(){
            for(var y=0;y<level.size;y++){
                for(var x=0;x<level.size;x++){
                    this.uncover(x, y);
                }
            }
        },

        uncoverAdjoiningZeros: function(x, y){
            var me = this;
            var zeros = [[x, y]];
            while(zeros.length > 0){
                var pos = zeros.pop();
                level.forEachAdjoiningCell(pos[0], pos[1], function(x1, y1){
                    if(field[y1][x1] !== EMPTY_CELL_CHAR){
                        return;
                    }
                    var count = me.uncover(x1, y1);
                    if (count === 0){
                        zeros.push([x1, y1]);
                    }
                });
            }
        },

        toggleFlag: function(x, y){
            if (field[y][x] === EMPTY_CELL_CHAR){
                field[y][x] = FLAG_CHAR;
                return true;
            } else if (field[y][x] === FLAG_CHAR){
                field[y][x] = EMPTY_CELL_CHAR;
                return false;
            }
        },

        hasWon: function(){
            for(var y=0;y<level.size;y++){
                for(var x=0;x<level.size;x++){
                    if(field[y][x]===EMPTY_CELL_CHAR && !level.isMine(x, y)){
                        return false;
                    }
                }
            }
            return true;
        }
    };
}

var isDead = false;
var hasWon = false;
function leftClickedCell(el, field){
    if (isDead || hasWon){
        return;
    }
    var x = parseInt(el.getAttribute('data-x'));
    var y = parseInt(el.getAttribute('data-y'));
    var value = field.uncover(x, y);
    if (value === MINE_CHAR){
        isDead = true;
        setMessage("You've lost, sucker!");
        document.getElementById("newgamebtn").style.display = 'inline';
    } else if (value === 0){
        setMessage("Yeehaa");
        field.uncoverAdjoiningZeros(x, y);
    } else {
        setMessage("Phew");
    }
    if(field.hasWon()){
        hasWon = true;
        setMessage("You've won, lucker!");
        document.getElementById("newgamebtn").style.display = 'inline';
    }
    drawTable(field);
}

function rightClickedCell(el, field){
    var x = parseInt(el.getAttribute('data-x'));
    var y = parseInt(el.getAttribute('data-y'));
    var wasEnabled = field.toggleFlag(x, y);
    if (wasEnabled){
        setMessage("And you're really sure?");
    } else {
        setMessage("What a coward...");
    }
    drawTable(field);
}

function drawTable(field){
    var table = document.getElementById("game");
    table.innerHTML = field.toTableBody();
    var cells = table.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', function(){leftClickedCell(this, field);}, false);
        cells[i].oncontextmenu = function(){
            rightClickedCell(this, field);
            return false;
        };
    }
}

function generateLevel(sideSize, mineCount){
    var levelArray = new Array(sideSize*sideSize);
    for(var i=0;i<mineCount;i++){
        var rand;
        do {
            rand = Math.floor(Math.random()*sideSize*sideSize);
        } while (levelArray[rand] === 1);
        levelArray[rand] = 1;
    }
    var levelText = '';
    for(var i=0; i<sideSize*sideSize;i++){
        levelText += levelArray[i] === 1 ? '1' : '0'
    }

    return Level(levelText);
}

function startGame(size, mineCount){
    var level = generateLevel(size, mineCount);
    var field = Field(level);
    //field.uncoverAll();
    document.getElementById("startgame").style.display = 'none';
    document.getElementById("playboard").style.display = 'inline';

    setMessage("Do you think you're ready for this?");
    drawTable(field);
    isDead = false;
    hasWon = false;
}

function setMessage(text){
    var p = document.getElementById("message");
    p.innerHTML = '"' + text + '"';
}

function switchToNewGame(){
    document.getElementById("startgame").style.display = 'inline';
    document.getElementById("playboard").style.display = 'none';
}
/*
 * TODO
 *  * show all when won
 */
