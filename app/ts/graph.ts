import {Node} from "./node";
import {AppComponent} from "./app.component";

export class Graph{
    node_array: Array<Node>;
    edges_array: Array<[number,number]>;
    current_turn : number;
    grundy=[];
    number_rocks:number;

    constructor(canvasWidth,canvasHeight){
       while(this.node_array == null){
           this.generateGraph(canvasWidth,canvasHeight);
           if(this.node_array.length <= 8|| this.number_rocks <= 5 || this.number_rocks > 12 || this.getCurrentXor() == 0 || this.edges_array.length>13){
               this.node_array = null;
           }
       }
    }
    public generateGraph(canvasWidth,canvasHeight){
        this.node_array = [  ];
        this.edges_array = [];
        this.current_turn = 0;

        var idx = 0;
        for(var depth = 3 ; depth >= 0;depth--){
            var nodes = this.getRandomInt(2,3);
            while(nodes>0){
                var rocks = this.getRandomInt(0,2);
                this.number_rocks += rocks;
                if(depth == 3)rocks = 0;
                this.node_array.push(new Node(idx,depth,rocks));
                nodes--;
                idx++;
            }
        }

        // find their positions
        var cur_row = 0;
        var position_y=canvasHeight/(1+AppComponent.MAX_DEPTH)
        var position_X=-1;

        for(var i=0;i<this.node_array.length;i++){
            if(i==0|| this.node_array[i].depth !=this.node_array[i-1].depth){
                var cnt = 0;
                for(var j = 0 ; j < this.node_array.length;++j){
                    if(this.node_array[j].depth == this.node_array[i].depth)++cnt;
                }
                if(this.node_array[i].depth==0)
                    position_X = canvasWidth/(0.5+cnt);
                else if(this.node_array[i].depth==1)
                    position_X = canvasWidth/(0.7+cnt);
               else position_X = canvasWidth/(1+cnt);
                cur_row = 0;
            }

            this.node_array[i].centerX=position_X*(cur_row+1);
            this.node_array[i].centerY=position_y*(this.node_array[i].depth + 1);
            cur_row++;
        }


        for(var i = 0 ; i < this.node_array.length; ++i){
            if(this.node_array[i].depth == 3)continue;
            var num = this.getRandomInt(1,this.node_array[i].depth <=1 ? 3: 2);
            while(num>0) {
                var u = i, v = -1;
                while (v == -1) {
                    v = this.getRandomInt(0, u - 1);
                    if(this.node_array[v].depth == 3){
                        var cl = 100000;
                        for(var j = 0 ; j < this.node_array.length;++j){
                            if(this.node_array[j].depth == 3 && ( this.node_array[u].distance(this.node_array[j]) < cl)){
                                cl = this.node_array[u].distance(this.node_array[j]);
                                v = j;
                            }
                        }
                    }
                    if (this.node_array[u].depth >= this.node_array[v].depth) v= -1;
                }
                this.node_array[v].in_degree++;
                this.node_array[u].out_degree++;
                this.edges_array.push([u, v]);
                num--;
            }
        }
        this.findGrundyNumbers();

    }
    public getCurrentXor(){
        var xor = 0;
        for (var i = 0; i < this.node_array.length; i++) {
            if (this.node_array[i].rocks % 2 != 0) xor ^= this.grundy[i];
        }
        return xor;
    }
    public getGameState(){
        var no_moves = 1;
        for(var i = 0 ; i < this.node_array.length;++i){
            if(this.node_array[i].rocks>0 && this.node_array[i].out_degree>0)
                no_moves = 0;
        }
        if(no_moves == 1)return this.current_turn == 0?-1:1;
        return 0;
    }
    public moveRock(u,v){

        this.node_array[u].rocks--;
        this.node_array[v].rocks++;
        this.current_turn = this.current_turn==0?1:0;
    }

    public findGrundyNumbers(){
        for(var i=0;i<this.node_array.length;i++){
            this.grundy[i]=-1;
        }
        for(var i=0;i<this.node_array.length;i++){
            if(this.grundy[i]==-1)this.dfs(i);
        }
    }
    private dfs(u){
        var set=[];
        var idx=0,mex=0;
        for (var i = 0; i < this.node_array.length; i++) {
            if(this.isThereEdge(u,i)){
                var v=i;
                if(this.grundy[v]==-1){
                    this.dfs(v);
                }
                set[idx++]=this.grundy[v];
            }
        }
        set.sort();
        var i=0;
        while(i<idx){
            if(set[i]!=mex)break;
            while(i<idx && mex==set[i] )i++;
            mex++;
        }
        this.grundy[u]=mex;
    }
    public isThereEdge(u,v){
        for(var i = 0 ; i < this.edges_array.length;++i){
            if(this.edges_array[i][0] ==u && this.edges_array[i][1] == v){
                return true;
            }
        }
        return false;
    }
    public getCurrentTurn(){
        return this.current_turn;
    }
    
    public getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min+1)) + min;
    }

}