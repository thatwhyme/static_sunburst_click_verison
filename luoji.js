const colorMap = {
    normal: '#6699FF',  // this color means the normal node in the circle
    red_process: '#e14089',  //this color means the node is just selected by the red player
    red_process2:'#8c0442',  //this color means the node is a red node and it is chosen by blue player,then becomes dark red 
    end: '#9966FF',      //this color means that the purple node where the blue player's stragety to solve one red node
    red_end: 'lightgreen', //this color means the green node
    predictcolor:'#048774'
}

function getColor(d) {

    if (d.data.chosen) return colorMap.red_process2
    if (d.data.red_end) {
        return  colorMap.red_end  
    } else if(d.data.firstStage){
        return colorMap.red_process
    } else if (d.data.blue) {
        return  colorMap.end
    } else if(d.data.predictcolor){
        return colorMap.predictcolor;
    }else if(d.data.normal){
        return colorMap.normal;
    }
}

const tree = {
    label: '0',
    children: [],
    color: colorMap.未选择,
    isLeaf: false,
}

const depth = 7    //the depth of the tree,(including the root)

const cache = {
    0: [tree]
}


//represent the range of the leaves range
let beginLabel = Math.pow(2,depth-1)-1;
let endLabel = 2 * beginLabel;

// some thinking:
//Every step should be a string
//for the red player: it should be "r:label"
//for the blue player: it should be "b:r:label:b:label" or "b:r:label"(this special case appears because 
//if the blue's stragety is wrong or he fails to drag the red node to a suitable position)

let Recording = []; //This is used to record every step

// Math.floor(Math.pow(2,depth-1)*0.422)
const Max_Choice_Num = 3 // this is a constraint which refers that the max num nodes that Red player can choose
console.log("Max_Choice_Num: "+Max_Choice_Num)
let cur_red_choice_num = 0  //the num of nodes that red player has chosen at this moment

let redNowLabel =  ''

let count = 1  // used as label when constructing the tree initally

let isDoubleLabel = label => {    //to judge the label is double or not
    return /\d+\/\d+/g.test(label)
}

function error(msg){   // error msg
    alert(msg || 'Blue Error！！')
    return
}

//constructing process
for (let i = 0; i < depth - 1; i++) {
    cache[i + 1] = []
    for(let c of cache[i]) {
        let c1 = {
            label: count++ + '',
            children: [],
            isLeaf: i === depth - 2,
            p: c,
            normal:true,
            firstStage:false,
            chosen : false,
            red_end:false,
            predictcolor:false,
            blue:false,
            // dummy: new Set(),
        }
        let c2 = {
            label: count++ + '',
            children: [],
            isLeaf: i === depth - 2,
            p: c,
            normal:true,
            firstStage:false,
            chosen : false,
            red_end:false,
            predictcolor:false,
            blue:false,
            // dummy: new Set(),
        }
        if (i === depth - 2) {
            c1.size = i
            c2.size = i
        }
        c.children = [c1, c2]
        cache[i+1].push(c1, c2)
    }
}

//check for blue player weather the node can be clicked
function checkNodeCanClick(d){ 
    console.log(d.data.label+" "+d.data.normal)
    if (d.data.red_end) return false   
    if (d.data.blue) return false
    if (d.data.firstStage) return false
    if (d.data.chosen) return false  
    return true
}

//the handling process
const single = {  
    check(bluelabel, redlabel) {   //check the strategy of blue player
        // alert('check blue')
        let blueNode = findNodeTo(tree, bluelabel)
        let redNode = findNodeTo(tree, redlabel)
        // alert(redNode)
        while (blueNode != redNode) {
            let _r_label = redNode.label.split('/')[0]
            let _b_label = blueNode.label.split('/')
            if (_b_label.length == 2 && !_b_label.includes(_r_label)) {
                // error()
                // return false
                return false
            }
            blueNode = blueNode.p
            redNode = redNode.p
        }
        return true
    },
    
    handle(bluelabel, redlabel) {   //change the corresponding color and label
        let blueNode = findNodeTo(tree, bluelabel)
        let redNode = findNodeTo(tree, redlabel)
        while (blueNode != redNode) {
            if (!isDoubleLabel(blueNode.label)) {
                blueNode.label += '/' + redNode.label.split('/')[0]
                tmpLayer ++
                blueNode.blue = true
                blueNode.firstStage = false
                blueNode.red_end = false
                blueNode.chosen = false
                blueNode.normal = false
                blueNode = blueNode.p
                redNode = redNode.p
            }else{
                break
            }
            // blueNode.dummy_color = false  //no matter the blueNode is dummy or not, it should become purple first  
        }
    }
}

function filTxt(){
    leftNow = Max_Choice_Num - cur_red_choice_num
    if( leftNow >1 ){
        document.getElementById("NUM").innerHTML = "you still have "+leftNow+" choices";
    }else if(leftNow == 1){
        document.getElementById("NUM").innerHTML = "you still have "+leftNow+" choice";
    }else{
        document.getElementById("NUM").innerHTML = "you have no choice now";
    }
}


function onlclick(d) {   //left click  for  red player
    console.log('running onlclick for red player：' + cur_red_choice_num)
    
    if (FLAGPlayer == 1)  { //It means that the red side has exhausted his options
        console.log("change")
        return    
    }

    if (d.data.firstStage) return   //The red party cannot select the node that he has already selected
        
    cur_red_choice_num += 1   //the num of nodes that red player has chosen at this moment
    
    // for showing the leaves left
    filTxt()

    findNodeTo (tree, d.data.label, node => {  //find this node and change its color to red
        node.firstStage = true
        node.normal = false
    })
    
    Recording.push("r:"+d.data.label) // recording the process
    console.log(Recording)

    this.run(tree)

    if (cur_red_choice_num == Max_Choice_Num){ //It means that the red side has exhausted his options
        FLAGPlayer = 1  // this means that it is blue player's turn
        console.log("FLAGPlayer:"+FLAGPlayer)
    }

}

function Blue_Step_1(d){  //the first step in one round of blue player's
    console.log('call Blue_Step_1') // just used for debugging the program
    if(unresolved == 1){
        if(FLAGPlayer == 1 && d.data.chosen){
            prepared = 1
        } 
    }
}

function Blue_Step_2(label) {   //this is blue player's turn's second step
    //The second judgment is to determine whether the destination node is a droppable blue node. For example, it can't be a dual node node.
    // lock = false
    console.log("calling Blue_Step_2")
    if(unresolved == 0) {
        console.log("unresolved: "+unresolved) 
        return
    }
    if (isDoubleLabel(label)) return   //This indicates that the leaf node is already double label and can no longer be used as a blue option.

    if (!single.check(label, redNowLabel))  { //If it's illegal, you have to drag it back to a suitable node
        prepared = 0    
        return
    }
    findNodeTo(tree, redNowLabel, node => {
        node.chosen = false
        node.firstStage = false
        node.red_end = true
        node.blue = false
        node.normal = false
        node.predictcolor = false
    })

    findNodeTo(tree, label, node => {
        node.blue = true
        node.chosen = false
        node.firstStage = false
        node.red_end = false
        node.normal = false
        node.predictcolor = false
        
    })
    tmpLayer = 0
    single.handle(label, redNowLabel)

    var tmp = Recording.pop();
    tmp += ":b:"+ label+":stop-"+tmpLayer;
    Recording.push(tmp);
    console.log(Recording);

    unresolved = 0
    prepared = 0
    dragging = 0
}
function onrclick2(label){ // the second step of the blue side
    destination_Node = ""
    Blue_Step_2(label) 
    treemap.run(tree) 
    
}


function onrclick(d){  // the first step of the blue side
    Blue_Step_1(d)
    treemap.run(tree)  
}

function findNodeTo(node, label, handle = () => {}) {  //find the node with the appointed label
    if (node.label === label || node.label.split('/')[0]  == label) {
        handle(node)
        return node
    } else if (node.children.length) {
        return findNodeTo(node.children[1], label, handle) || findNodeTo(node.children[0], label, handle)
    } else {
        return    //return undefined
    }
}

// UndoFunction
function UndoFunction(d){

    console.log('click undo button')
    var tmp = Recording.pop()
    console.log(tmp)
    var tmps = tmp.split(":");
    console.log("tmps len:"+tmps.length)
    if(tmps.length == 2){ //This representation is one step of the Red player. We just need to change its color to normal
        findNodeTo (tree, tmps[1], node => {  
            node.firstStage = false
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = true
        }) 

        if(cur_red_choice_num == Max_Choice_Num){
            FLAGPlayer = 0;
        }
        cur_red_choice_num -= 1
        filTxt()
        console.log("cur_red_choice_num:"+cur_red_choice_num)

    }else if(tmps.length == 3){
        findNodeTo (tree, tmps[2], node => {  
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal =false
        }) 

        //clear all the legit positions' coloring
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

        unresolved = 0
        prepared = 0
        dragging = 0
        console.log(Recording)
        console.log('undo success :'+tmps)

    }else if(tmps.length == 6){

        findNodeTo (tree, tmps[2], node => {  
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
        })
        
        findNodeTo (tree, tmps[4], node => {  
            node.firstStage = false
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = true
            node.label = node.label.split('/')[0]
            tmpOps = 1
            while (tmpOps < parseInt(tmps[5].split("-")[1])) {
                node = node.p
                node.firstStage = false
                node.red_end = false
                node.chosen = false
                node.blue = false
                node.predictcolor = false
                node.normal = true
                node.label = node.label.split('/')[0]
                tmpOps ++
            }
        })
        unresolved = 0
        prepared = 0
        dragging = 0
        destination_Node = ""
        console.log(Recording)
        console.log('undo success :'+tmps)
    }else{
        console.log("what happened?")
    }
    treemap.run(tree);
}

const treemap = new Tree(onlclick, onrclick,onrclick2,UndoFunction)  
treemap.run(tree)

