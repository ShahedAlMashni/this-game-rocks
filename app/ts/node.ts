export class Node{
    depth: number;
    rocks: number;
    id: number;
    in_degree:number;
    out_degree:number;
    centerX: number;
    centerY: number;
    radius: number;

    constructor(id:number ,depth:number,rocks:number){
        this.id = id;
        this.depth = depth;
        this.rocks = rocks;
        this.radius = 40;
        this.in_degree = 0;
        this.out_degree = 0;
    }
    public distance(v){
        return Math.sqrt((this.centerX-v.centerX)*(this.centerX-v.centerX)+(this.centerY-v.centerY)*(this.centerY-v.centerY));
    }
}