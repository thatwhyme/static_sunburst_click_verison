How to play the game?
Step1: select a suitable proportion for red player. The text will tell you how many nodes
for the red player can choose.
Step2: red player chooses n many nodes first.
Step3: blue player try to move all the red nodes to legit positions
step4: if you want to reset the proportion, please click New Game to start a new game.

Notice: 
(1) the Repeat Button can help red player reproduce the choices in the previous round.
So if this is the first time you play the game, this Repeat Button will not work.
Of course, if the player knows the code well, he can change the "redList" variable in luoji.js file.
(2) the Undo Button can help any player to retreat one step.


///////////////////////////////////////////////////////////////////////////////////
some important variables:

Max_Choice_Num: the most leaves that red player can choose.

depth: the levels of the tree.

FLAGPlayer:  0   means its red player's turn 
             1   means its blue player's turn  

cc：  0  means that blue player is gonna choose a red leaf node.
      1  means that blue player has chosen a red leaf node, he is gonna choose a normal leaf node.

cur_red_choice_num:  used to record how may nodes the red player has chosen until now.

Recording: [] record all the steps

redList： [] for Repeat function








