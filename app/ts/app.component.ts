import {AfterViewInit, Component, ElementRef, ViewChild} from 'angular2/core';
import {Graph} from './graph';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    styleUrls: ['app/app.component.css']

})

export class AppComponent implements AfterViewInit {
    @ViewChild('canvasEl') canvasEl: ElementRef;

    private static context: CanvasRenderingContext2D;
    static MAX_DEPTH=4;
    static NODE_COLOR = 'green';
    static graph;
    static ROCK_ICON = new Image();
    static SELECTED_INDEX = -1;
    static SELECTED_P1;
    static SELECTED_P2;

    constructor() {
        AppComponent.graph = new Graph(700,700);
        AppComponent.ROCK_ICON.src = "https://logicrush.com/app/img/stone.png";
        AppComponent.SELECTED_P1 = AppComponent.SELECTED_P2 = -1;
    }

    ngAfterViewInit() {
        AppComponent.context = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext('2d');
        AppComponent.context.canvas.addEventListener('click', function(event) {
            var x = event.clientX-AppComponent.context.canvas.getBoundingClientRect().left,y = event.clientY-AppComponent.context.canvas.getBoundingClientRect().top;

                if(AppComponent.graph.getCurrentTurn() == 0) {
                    for (var i = 0; i < AppComponent.graph.node_array.length; ++i) {
                        var distanceToCircle = AppComponent.distance(x, y, AppComponent.graph.node_array[i].centerX, AppComponent.graph.node_array[i].centerY);
                        if (distanceToCircle <= AppComponent.graph.node_array[i].radius) {
                            if (AppComponent.SELECTED_INDEX != -1) {

                                if (AppComponent.graph.isThereEdge(AppComponent.SELECTED_INDEX, i)) {
                                    if (AppComponent.graph.getCurrentTurn() == 0) {
                                        setTimeout(() => {
                                            AppComponent.playNextMove();
                                        }, 2000);
                                    }
                                    AppComponent.graph.moveRock(AppComponent.SELECTED_INDEX, i);
                                    AppComponent.SELECTED_INDEX = -1;
                                } else if (AppComponent.SELECTED_INDEX == i) {
                                    AppComponent.SELECTED_INDEX = -1;
                                }
                            } else {
                                if (AppComponent.graph.node_array[i].depth == AppComponent.MAX_DEPTH - 1) {
                                    // TODO you can't select leaf
                                } else if (AppComponent.graph.node_array[i].rocks == 0) {
                                    // TODO push error you can't select empty node
                                } else {
                                    AppComponent.SELECTED_INDEX = i;
                                }
                            }
                        }
                    }


                    AppComponent.draw();
                }}, false);
        setTimeout(() => {
            AppComponent.draw();
        }, 1000);


    }


    private static draw() {
        var gameState = AppComponent.graph.getGameState();
        AppComponent.context.clearRect(0, 0, AppComponent.context.canvas.width, AppComponent.context.canvas.height);
        if(gameState != 0){
            AppComponent.context.fillStyle = "black";
            AppComponent.context.font = "50px Arial";
            AppComponent.context.fillText("You " +(gameState==-1?"Lose":"Win") + "!!",AppComponent.context.canvas.width/2,AppComponent.context.canvas.height/2);
        }else {
            AppComponent.context.fillStyle = "black";
            AppComponent.context.font = "20px Arial";
            AppComponent.context.fillText("Current Turn: " + (AppComponent.graph.getCurrentTurn()==0?"You":"Computer"),AppComponent.context.canvas.width/2-30,50);
            AppComponent.drawGraph();
        }
    }
    private static drawLine(x1,y1,x2,y2,color,lineWidth){
        AppComponent.context.beginPath();
        AppComponent.context.fillStyle = color;
        AppComponent.context.lineWidth = lineWidth;
        AppComponent.context.moveTo(x1,y1);
        AppComponent.context.lineTo(x2,y2);
        AppComponent.context.stroke();
    }
    private static drawCircle(x,y,radius,color,stokeColor,lineWidth){

        AppComponent.context.beginPath();
        AppComponent.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        AppComponent.context.fillStyle = color;
        AppComponent.context.strokeStyle = stokeColor;
        AppComponent.context.lineWidth = lineWidth;
        AppComponent.context.fill();
        AppComponent.context.stroke();
    }
    private static drawGraph(){
        for(var i = 0 ; i < AppComponent.graph.edges_array.length;++i){
            AppComponent.drawEdge( AppComponent.graph.node_array[AppComponent.graph.edges_array[i][0]],
                AppComponent.graph.node_array[AppComponent.graph.edges_array[i][1]]);
        }
        for(var i=0;i<AppComponent.graph.node_array.length;i++) {
            AppComponent.drawNode(AppComponent.graph.node_array[i]);
        }
    }


    private static distance(x1,y1,x2,y2){
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
    private static drawEdge(u,v){
        var dist = AppComponent.distance(u.centerX,u.centerY,v.centerX,v.centerY);
        var d2 = dist - v.radius;
        var ratio = d2/dist;
        var dx = (v.centerX-u.centerX)*ratio;
        var dy = (v.centerY-u.centerY)*ratio;

        this.drawArrow(u.centerX,u.centerY,u.centerX+dx,u.centerY+dy);

    }
    private static  drawArrow(fromx, fromy, tox, toy){
        var headlen = 10;

        var angle = Math.atan2(toy-fromy,tox-fromx);

        //starting path of the arrow from the start square to the end square and drawing the stroke
        AppComponent.context.beginPath();
        AppComponent.context.moveTo(fromx, fromy);
        AppComponent.context.lineTo(tox, toy);
        AppComponent.context.strokeStyle = "black";
        AppComponent.context.lineWidth = 2;
        AppComponent.context.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        AppComponent.context.beginPath();
        AppComponent.context.moveTo(tox, toy);
        AppComponent.context.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

        //path from the side point of the arrow, to the other side point
        AppComponent.context.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        AppComponent.context.lineTo(tox, toy);
        AppComponent.context.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

        //draws the paths created above
        AppComponent.context.strokeStyle = "#cc0000";
        AppComponent.context.lineWidth = 2;
        AppComponent.context.stroke();
        AppComponent.context.fillStyle = "#cc0000";
        AppComponent.context.fill();
    }



    public static playNextMove() {
        var xor = AppComponent.graph.getCurrentXor();
        for (var i = 0; i < AppComponent.graph.node_array.length; i++) {
            if (AppComponent.graph.node_array[i].depth == 3) continue;
            var need = xor ^ AppComponent.graph.grundy[i];
            if (need <= AppComponent.graph.grundy[i] && AppComponent.graph.node_array[i].rocks > 0) {
                for (var j = 0; j < AppComponent.graph.node_array.length; j++) {
                    if (AppComponent.graph.isThereEdge(i, j) && AppComponent.graph.grundy[j] == need) {
                        AppComponent.SELECTED_P1 = i;
                        AppComponent.SELECTED_P2 = j;
                      setTimeout( () => {
                            AppComponent.SELECTED_P1 = AppComponent.SELECTED_P2 = -1;
                            AppComponent.graph.moveRock(i,j);
                            AppComponent.draw();

                        }, 2000 );
                        AppComponent.draw();
                        return;
                    }
                }
            }
        }
        for (var i = 0; i < AppComponent.graph.node_array.length; i++) {
            if (AppComponent.graph.node_array[i].depth == 3 || AppComponent.graph.node_array[i].rocks == 0) continue;
            for (var j = 0; j < AppComponent.graph.node_array.length; j++) {
                if (AppComponent.graph.isThereEdge(i, j)) {
                    AppComponent.SELECTED_P1 = i;
                    AppComponent.SELECTED_P2 = j;
                    setTimeout( () => {
                        AppComponent.SELECTED_P1 = AppComponent.SELECTED_P2 = -1;
                        AppComponent.graph.moveRock(i,j);
                        AppComponent.draw();
                    }, 2000 );

                    AppComponent.draw();
                    return;
                }
            }
        }
    }

    private static drawNode(v){
        var color = 'green';
        if(v.id == AppComponent.SELECTED_P1 || v.id == AppComponent.SELECTED_P2 || v.id == AppComponent.SELECTED_INDEX){
            color = 'blue';
        }else if(AppComponent.graph.isThereEdge(this.SELECTED_INDEX,v.id)){
            color = '#003300';
        }else if(v.depth == this.MAX_DEPTH-1){
            color = "purple";
        }
        this.drawCircle(v.centerX,v.centerY,v.radius,color,'black',2);
        AppComponent.context.fillStyle = "white";
        AppComponent.context.font = "14px Arial";
        AppComponent.context.fillText("Rocks: "+v.rocks,v.centerX-v.radius*0.7,v.centerY-v.radius*0.3);
        if(v.rocks > 0)
            AppComponent.context.drawImage(AppComponent.ROCK_ICON, v.centerX - 0.35 * v.radius, v.centerY - 0.2 * v.radius, v.radius * 0.7, v.radius * 0.7);
    }

}
