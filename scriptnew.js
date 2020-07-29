let FLAGPlayer = 0  // who's turn   0 red player,   1 blue player
// let cc = 0
let dragging = 0  //It is used to indicate that dragging is in progress or not in progress. It is mainly used to control the lighting path operation.
let prepared = 0
let unresolved = 0  //Indicates that there are currently unfinished operations.
let destination_Node = ""

var tooltip = d3.select("#body")
    .append("div")
    .attr("class", "tooltip")
    .style("z-index", "10")
    .style("opacity", 0)


class Tree{
    constructor(lc, rc, rc2,undo){
        this.lc = lc.bind(this)
        this.rc = rc.bind(this)
        this.rc2 = rc2.bind(this)
        this.undo = undo.bind(this)
    }
    run(tree){
        const width = window.innerWidth;
		const height = window.innerHeight / 2;
        const radius = 40;
		const gcon = 0;
		
        const arc = d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))//0.005
                .innerRadius(d => d.y0  * radius )   //+ Math.pow(1.5,d.depth-1)
                .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))// + Math.pow(1,d.depth-1)) //newcode
                .padRadius(radius* 1.5 )
    
        const partition = data => {
            const root = d3.hierarchy(data)
                    .sum(d => d.size)
                    .sort((a, b) => b.value - a.value);
            return d3.partition()
                    .size([2 * Math.PI, root.height + 1])
                    (root);
        };

        var data = tree
        const root = partition(data);
        
        root.each(d => d.current = d);
        
        d3.select('#partitionSVG').selectAll('*').remove()

        const svg = d3.select('#partitionSVG')
                .style("width", "100%")
                .style("height", "100%")
                .style("font", "10px monospace") // key2   about the size of the label
				
        const g = svg.append("g")
                .attr("transform", `translate(${width / 2},${height})`);

        g.append("g")
                .selectAll("path")
                .data(root.descendants().slice(1))
                .join("path")
                .attr("fill", getColor)
                .attr("d", d => arc(d.current))
                .on('click', d =>{  //Only the red side uses click, and the blue side uses the drag event.
                    if(FLAGPlayer == 0){  // It means the round of Red Player
                        if (d.data.isLeaf) {
                            this.lc(d)
                        }
                        // console.log("why do you stay here")
                        d3.event.preventDefault()
                    }else if(FLAGPlayer == 1 && d.data.isLeaf && d.data.firstStage){//if (d.data.isLeaf && d.data.firstStage) 
                        console.log('here'+FLAGPlayer)
                        {
                            d.data.chosen = true
                            d.data.firstStage = false
                            d.data.red_end = false
                            d.data.blue = false
                            d.data.normal = false
                            // cc = 1 
                            unresolved = 1
                            prepared = 1
                            redNowLabel = d.data.label

                            Recording.push("b:r:" + redNowLabel);
                            console.log(Recording) 

                            // when you click the red node, then the legit positions for blue player
                            // would be dark green
                            for( var i = beginLabel; i < endLabel+1; i++ ){
                                var label = ""+i;  //change the i to a string
                                findNodeTo(tree, label, node => {
                                    if(node.normal){
                                        if(single.check(label,redNowLabel)){
                                            node.predictcolor = true
                                            node.normal = false
                                        }
                                    }
                                })
                            }
                            // 如果有一个只需要改变颜色的函数就好了，而不需要重新绘制这个图形。
                            treemap.run(tree)
                        }
                    }
                })
                .on("mouseover", d => {
                    d3.selectAll("path")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
                    
                    //Get this path
                    var sequenceArray = d.ancestors().reverse();
                    sequenceArray.shift(); 
                    
                    const arrowEle = document.getElementsByClassName('arrow')[0]
                    arrowEle.innerHTML = sequenceArray
                        .map(i => `<div class="arrow-item" style="background-color:${getColor(i)};font-size:x-small;border-color:${getColor(i)};">${i.data.label}</div>`)
                        .join('')
                    svg.selectAll("path")
                    .filter(function(node) {

                        if (dragging==0) {  
                            return (sequenceArray.indexOf(node) >= 0)
                        }
                        else{  //Indicates that the dragging operation is in progress, so nodes that encounter non normal should not be lit up.
                            let flg = node.data.chosen || node.data.firstStage|| node.data.red_end|| node.data.blue || !node.data.isLeaf
                            if (flg) { //Indicates that it cannot be lit during dragging
                                return false  
                            }else{  //Indicates that it can be lit during dragging
                                return true && (sequenceArray.indexOf(node) >= depth-2) 
                            }
                        }
                    })
                    .transition()
                    .duration(300)
                    .style("opacity", 0.7);

                    if(d.data.isLeaf && d.data.predictcolor ){
                        destination_Node = d.data.label
                    }
                    tooltip.html(d.data.label)
                    return tooltip.transition()
                      .duration(300)
                      .style("opacity",1)
                })
                .on("mousemove", function(d) {
                    return tooltip
                    .transition()
                      .duration(300)
                      .style("top", (d3.event.pageY+0)+"px")//+10
                      .style("left", (d3.event.pageX+0)+"px");//+10
                  })

                .call(
                    d3.drag()  
                    .filter(function(d) { // The filter function here ensures that only leaf nodes in firststage can be dragged
                        if(d.data.chosen){
                            return d.data.isLeaf
                            // if (unresolved == 0){
                            //     return d.data.isLeaf && d.data.firstStage;
                            // }else if(unresolved == 1){
                            //     return d.data.isLeaf && d.data.chosen;
                            // }
                        }else{
                            return false
                        }
                    })
                    .on('start', (d) => {
                        dragging = 1; //the dragging begins
                        // redNowLabel = d.data.label
                        const { x, y } = d3.event
                        // console.log('dragging begins:', x, y);
                        window.dx = 0;
                        window.dy = 0;
                    })
                    .on('end', (d) => {
                        dragging = 0; //dragging ends
                        const { x, y } = d3.event
                        // console.log('dragging ends:', x, y);
                        console.log('beginlabel:'+d.data.label) 
                        console.log('destination_Node:'+destination_Node)
                        // console.log('there should call Blue_step_2')
                        if(destination_Node !=""){
                            this.rc2(destination_Node) 
                            //remove all the legit position's coloring
                            for(var i = beginLabel; i < endLabel+1; i++){
                                var label = ""+i; //change the i to a string
                                findNodeTo(tree, label, node => {
                                    if(node.predictcolor){
                                        node.blue = false
                                        node.firstStage = false
                                        node.chosen = false
                                        node.red_end = false
                                        node.normal = true
                                        node.predictcolor = false
                                    }
                                })
                            }
                        }
                        // else{  //如果他还是空呢

                        // }
                        treemap.run(tree)
                    })
                    .on('drag', draged)
                )
                .on("mouseout", function(d){
                    var demoP=document.getElementById("sequencetxt");
                    demoP.innerHTML = "";
                    d3.selectAll("path")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
                    return tooltip.transition()
                    .duration(300).style("opacity", 1);
                })
                  
        g.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .style("user-select", "none")
                .selectAll("text")
                .data(root.descendants().slice(1))
                .join("text")
                .attr("dy", "0.35em")
                .attr("transform", d => labelTransform(d.current))
                //key2 if you do not want to show the label on the disk, just comment out the following sentence
                .text(d => d.data.label);

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        function draged(d) {
            // cx, cy
            const { x, y, dx, dy, subject } = d3.event
            window.dx += dx;
            window.dy += dy;
            // This gets the current position, and then gets the difference, which is the required translate x y value
            d3.select(this)
                .attr('cx', x)
                .attr('cy', y)
                .attr("transform", `translate(${window.dx},${window.dy})`);
        }
    }
}