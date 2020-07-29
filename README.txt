You can 
(1) change the Max_Choice_Num to set the most leaves that red player can choose.
(2) change the depth to set the levels of the tree.

The following are some important variables.
Note:
FLAGPlayer:  0   means its red player's turn 
             1   means its blue player's turn
            
cc：  0  means that blue player is gonna choose a red leaf node.
      1  means that blue player has chosen a red leaf node, he is gonna choose a normal leaf node.

cur_red_choice_num:  used to record how may nodes the red player has chosen until now.

How to play this game？
（1）First, the red palyer should choose n nodes as its strategy.  and these nodes will become red.
(2)Second, the blue should do n rounds to resolve this problem. In each round, the bule player should 
choose a red node and drag it to a legal node.(Maybe your choice is illegal,it will alert(blue error), 
and the red node you have chosen will become dark red. but do not worry, you just need to drag the drak red node to 
a legal position. Remember that you can only resolve the drak red node, then you can continue to resolve other red nodes.) 

Please keep the mouse within the scope of each node to avoid a lot of trouble.
Because in this version, you cant not always keep the destination path highlight(Maybe this is a bug, but this will not
affect the running of the game). I am gonna fix it later.



















