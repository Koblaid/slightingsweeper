function Level(levelText){
    return {
        size: Math.sqrt(levelText.length),
        
        isMine: function(x, y){
            return levelText[this.size*y + x] === '1';
        },
        
        getAdjoiningMinesCount: function(x, y){
            var count = 0;
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
                    if (this.isMine(target_x, target_y)){
                        count += 1;
                    }
                }
            }
            return count;
        },
    };
}

EMPTY_CELL_CHAR = '\u25A2';
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
                    tbody += '<td data-x="'+x+'" data-y="'+y+'">' + field[y][x] + '</td>';
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
                value = level.getAdjoiningMinesCount(x, y);                
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
        
        toggleFlag: function(x, y){
            if (field[y][x] === EMPTY_CELL_CHAR){
                field[y][x] = FLAG_CHAR;
            } else if (field[y][x] === FLAG_CHAR){
                field[y][x] = EMPTY_CELL_CHAR;
            }
        }
    };
}

var isDead = false;
function leftClickedCell(el, field){
    if (isDead){
        return;
    }
    var x = parseInt(el.getAttribute('data-x'));
    var y = parseInt(el.getAttribute('data-y'));
    var value = field.uncover(x, y);
    if (value === MINE_CHAR){
        isDead = true;
    }
    drawTable(field);
}

function rightClickedCell(el, field){
    var x = parseInt(el.getAttribute('data-x'));
    var y = parseInt(el.getAttribute('data-y'));
    field.toggleFlag(x, y);
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

function startGame(){
    var sideSize = 10;
    var mineCount = 10;
    var level = generateLevel(sideSize, mineCount);    
    var field = Field(level);
    drawTable(field);
    isDead = false;
}

startGame();


/*
 * TODO
 *  * winning
 *  * grey background for TDs
 *  * automatically uncover all zeroes
 *  * show all when dead
 */
