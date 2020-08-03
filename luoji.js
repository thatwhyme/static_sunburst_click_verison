const colorMap = {
    normal: '#6699FF',  // this color means the normal node in the circle
    red_process: '#e14089',  //this color means the node is just selected by the red player
    red_process2:'#8c0442',  //this color means the node is a red node and it is chosen by blue player,then becomes dark red 
    blue_end: '#9966FF',      //this color means that the purple node where the blue player's stragety to solve one red node
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
        return  colorMap.blue_end
    } else if(d.data.predictcolor){
        return colorMap.predictcolor;
    }else if(d.data.normal){
        return colorMap.normal;
    }
}
// let status = 'process'
// let next = 'red'

const tree = {
    label: '0',
    children: [],
    color: colorMap.未选择,
    isLeaf: false,
    // dummy: new Set(),
}
const depth = 7
const cache = {
    0: [tree]
}

//represent the range of the leaves range
let beginLabel = Math.pow(2,depth-1)-1;
let endLabel = 2 * beginLabel;

let Recording = []; //This is used to record every step

// let redList = [63,64,65,67,68,69,71,72,73,79,80,81,83,84,85,87,88,89,95,96,97,99,100,101,103,104,105] 
let redList = []

let Max_Choice_Num = 0  // this is a constraint for Red player
//const Max_Choice_Num = 27  // this is a constraint for Red player
let cur_red_choice_num = 0  //表示当前红色玩家一共选中了多少个节点。

let redNowLabel = ''

let gameBegin = 0 //represent that the game begins

let count = 1
let isDoubleLabel = label => {
    return /\d+\/\d+/g.test(label)
}
function error(msg){
    alert(msg || 'Blue Error！！')
}
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
        }
        if (i === depth - 2) {
            c1.size = i
            c2.size = i
        }
        c.children = [c1, c2]
        cache[i+1].push(c1, c2)
    }
}

function checkNodeCanClick(d){ //check for blue player
    if (d.data.red_end) return false   
    if (d.data.blue) return false
    if (d.data.firstStage) return false
    if (d.data.chosen) return false  
    return true
}

const single = {  //single label of red player suitation (leaf node)
    check(bluelabel, redlabel) {   //check the strategy of blue player
        let blueNode = findNodeTo(tree, bluelabel)
        let redNode = findNodeTo(tree, redlabel)
        while (blueNode !== redNode) {
            let _r_label = redNode.label.split('/')[0]
            let _b_label = blueNode.label.split('/')
            if (_b_label.length === 2 && !_b_label.includes(_r_label)) {
                // error()
                console.log("_b_label.length:"+_b_label.length)
                console.log("_b_label.includes(_r_label):"+_b_label.includes(_r_label))
                return
            }
            blueNode = blueNode.p
            redNode = redNode.p
        }
        return true
    },
    handle(bluelabel, redlabel) {   //change the corresponding color and label
        let blueNode = findNodeTo(tree, bluelabel)
        let redNode = findNodeTo(tree, redlabel)
        while (blueNode !== redNode) {
            if (!isDoubleLabel(blueNode.label)) {
                blueNode.label += '/' + redNode.label.split('/')[0]
                tmpLayer ++
                blueNode.blue = true
                blueNode.firstStage = false
                blueNode.red_end = false
                blueNode.chosen = false
                blueNode.normal = false
                blueNode.predictcolor = false
                blueNode = blueNode.p
                redNode = redNode.p
            }else{
                break
            }
        }
    }
}


function onlclick(d) {   //left click  for  red player
    
    var slider = document.getElementById("myRange");
    Max_Choice_Num = Math.floor(Math.pow(2,depth-1)*slider.value/100)
    
    if (cur_red_choice_num >= Max_Choice_Num){
        return
    }
    gameBegin = 1
    if (FLAGPlayer == 1)  { //It means that the red side has exhausted his options
        return    
    }
    if (d.data.firstStage) return   //Let's see if the red side has chosen the previous option
    

    cur_red_choice_num += 1   //Represents the actual number of choices of the Red side
    
    findNodeTo (tree, d.data.label, node => {  
        node.firstStage = true
        node.red_end = false
        node.chosen = false
        node.blue = false
        node.normal = false
        node.predictcolor = false
        Recording.push("r:" + d.data.label) // recording the process
        console.log(Recording)
    })

    this.run(tree)
    if (cur_red_choice_num >= Max_Choice_Num){
        FLAGPlayer = 1  //It's Blue's turn
    }
}

function Blue_Step_1(d){  //This is the first step of the blue side. Click a red node.
 
    if(cc==1)return  //t indicates that there is still an unresolved node. You need to solve it first.

    if(FLAGPlayer == 1 && d.data.firstStage ){//First of all, this has to be the round of the blue player, and then the round of clicking the red node
        redNowLabel = d.data.label
        findNodeTo(tree, redNowLabel, node => {  
            node.chosen = true
            node.firstStage = false
            node.red_end = false
            node.blue = false
            node.normal = false
        })
        cc = 1 

        //Light up all legitimate nodes
        for( var i = beginLabel; i < endLabel+1; i++ ){
            var label = ""+i;  //change the i to a string
            findNodeTo(tree, label, node => {
                if(node.normal){
                    // node.predictcolor = false
                    if(single.check(label,redNowLabel)){
                        node.predictcolor = true
                        node.normal = false
                    }
                }
            })
        }

        Recording.push("b:r:" + redNowLabel);
        console.log(Recording) 
    } 
}

function Blue_Step_2(d) {   // this is blue player's turn
    
    if (cc == 0) return   //Indicates that blue player has not selected a valid red node
    if (isDoubleLabel(d.data.label)) return   
    if (!checkNodeCanClick(d)) return   
    if (!single.check(d.data.label, redNowLabel)) return  

    findNodeTo(tree, redNowLabel, node => {
        node.chosen = false
        node.firstStage = false
        node.red_end = true
        node.blue = false
        node.normal = false
    })

    findNodeTo(tree, d.data.label, node => {
        node.blue = true
        node.chosen = false
        node.firstStage = false
        node.red_end = false
        node.normal = false
    })

    Leaf_go_Back_to_Normal();

    tmpLayer = 0
    single.handle(d.data.label, redNowLabel)
    var tmp = Recording.pop();
    tmp += ":b:"+ d.data.label+":stop-"+tmpLayer;
    Recording.push(tmp);
    console.log(Recording);
    cc = 0
}

function onrclick(d){  
    if( cc == 0 ){
        Blue_Step_1(d)
    }
    if( cc == 1){
        Blue_Step_2(d) 
    }
    this.run(tree) 
}

//find the node in the tree according the label
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
    if(Recording.length == 0) return
    console.log('click undo button')
    var tmp = Recording.pop()
    console.log(tmp)
    var tmps = tmp.split(":");
    console.log("tmps len:"+tmps.length)

    //example: "r:65"
    if(tmps.length == 2){ //This representation is one step of the Red player. We just need to change its color to normal
        findNodeTo (tree, tmps[1], node => {  
            node.firstStage = false
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = true
        }) 

        FLAGPlayer = 0;
        cur_red_choice_num -= 1  // As the red side retreats one step, it needs to reduce one
        filTxt()
        console.log("cur_red_choice_num:"+cur_red_choice_num)
        console.log(Recording)
        console.log("undo success:"+tmps)
    }else if(tmps.length == 3){  //example     b:r:71
        findNodeTo (tree, tmps[2], node => {  
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal =false
        }) 
        //Eliminate legitimate nodes's color
        Leaf_go_Back_to_Normal();
        console.log(Recording)
        console.log('undo success :'+tmps)

    }else if(tmps.length == 6){// exmaple   b:r:71:b:76:stop-3
        //find the red node and turn it to firstStage state
        findNodeTo (tree, tmps[2], node => {  
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
        })
        
        //find the blue node and turn it to normal
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

        console.log(Recording)
        console.log('undo success :'+tmps)
    }else{
        console.log("what happened?")
    }
    treemap.run(tree);
}

function reDraw_Tree(node){
    while(node){
        node.normal = true
        node.blue = false
        node.chosen = false
        node.firstStage = false
        node.red_end = false
        node.predictcolor = false
        node.label = node.label.split('/')[0]
        node = node.p
    }
    
}
//help the red player to set all his options 
function Repeat(){
    
    //just copy the red choices for red player has chosen, and redisplay them again
    if(redList.length == 0){
        for(var i = 0;i<Recording.length;i++){
            tmps = Recording[i].split(":");
            if(tmps.length==2){
                redList.push(parseInt(tmps[1]))
            }else{
                break
            }
        }
    }
    

    Max_Choice_Num = redList.length

    for(var i = beginLabel; i < endLabel+1; i++){
        var label = ""+i; //change the i to a string
        findNodeTo(tree, label, node => {
            reDraw_Tree(node)
        })
    }
    treemap.run(tree)
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    gameBegin = 1
    for(var i = 0; i < redList.length; i++){
        console.log(redList[i])
        //Find the corresponding red node according to redList[i], 
        //and set its color attribute and phase attribute
        findNodeTo (tree, redList[i]+"", node => {    // the label should be a string, so I make redList[i]+""
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
            node.predictcolor = false
        })
        Recording.push("r:" + redList[i]) // recording the process
        cur_red_choice_num += 1   // Represents the actual number of choices in the Red player
    }
    treemap.run(tree)
    console.log(Recording)
    if (cur_red_choice_num == Max_Choice_Num){
        FLAGPlayer = 1  // It's Blue's turn
    }
}

//change all the predicting legit to normal
function Leaf_go_Back_to_Normal(){
    //clear all the legit positions' coloring
    for(var i = beginLabel; i < endLabel+1; i++){
        var label = ""+i; //change the i to a string
        findNodeTo(tree, label, node => {
            if(node.predictcolor){ // && !node.firstStage
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

//show the notice sentence
function filTxt(){
    var slider = document.getElementById("myRange");
    Max_Choice_Num = Math.floor(Math.pow(2,depth-1)*slider.value/100)
    leftNow = Max_Choice_Num - cur_red_choice_num
    if( leftNow >1 ){
        document.getElementById("NUM").innerHTML = "Red Player still has "+leftNow+" choices";
    }else if(leftNow == 1){
        document.getElementById("NUM").innerHTML = "Red Player still has "+leftNow+" choice";
    }else{
        document.getElementById("NUM").innerHTML = "Red Player has no choice now";
    }
}

function newGame(){
    gameBegin = 0
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    redList = []
    location.reload()
}

const treemap = new Tree(onlclick, onrclick,UndoFunction,Repeat)  
treemap.run(tree)