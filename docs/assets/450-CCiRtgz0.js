const n=450,e="Delete Node in a BST",t="Trees",o=`var deleteNode = function(root, key) {
    // Base case: key not found in the tree
    if (!root) {
        return null;
    }

    if (key < root.val) {
        // Key is smaller — search in the left subtree
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        // Key is larger — search in the right subtree
        root.right = deleteNode(root.right, key);
    } else {
        // Found the node to delete

        // Case 1: No left child — replace with right child
        if (!root.left) {
            return root.right;
        }

        // Case 2: No right child — replace with left child
        if (!root.right) {
            return root.left;
        }

        // Case 3: Two children — find the inorder successor
        // (smallest node in the right subtree)
        let successor = root.right;
        while (successor.left) {
            successor = successor.left;
        }

        // Replace this node's value with the successor's value,
        // then delete the successor from the right subtree
        root.val = successor.val;
        root.right = deleteNode(root.right, successor.val);
    }

    return root;
};`,l="4082d91b8d87dd5ddfdc8db8da4df2cbeacd215815bde8ec57e4dc37f1253ff3",r="d120be949580d04de09546df406ed5b5a640d1e6ded6b75fa128e96dd15f723b",a="c1210fefa933313173f2f0b1b81be138f506641d59a88207036d230af1e54bd3",d=[{name:"Example",input:[{$tree:[5,3,6,2,4,null,7]},3],expected:[5,4,6,2,null,null,7],result:[5,4,6,2,null,null,7],steps:[{site:16,line:1,kind:"call",label:"deleteNode",state:{root:{$ref:"o1"},key:3},input:{root:{$ref:"o1"},key:3},heap:{o1:{kind:"tree",fields:{val:5,left:{$ref:"o2"},right:{$ref:"o5"}}},o2:{kind:"tree",fields:{val:3,left:{$ref:"o3"},right:{$ref:"o4"}}},o3:{kind:"tree",fields:{val:2,left:null,right:null}},o4:{kind:"tree",fields:{val:4,left:null,right:null}},o5:{kind:"tree",fields:{val:6,left:null,right:{$ref:"o6"}}},o6:{kind:"tree",fields:{val:7,left:null,right:null}}},value:{$scalar:"undefined"},stack:["deleteNode"]},{site:1,line:3,kind:"check",label:"!root",state:{root:{$ref:"o1"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode"]},{site:14,line:7,kind:"check",label:"key < root.val",state:{root:{$ref:"o1"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!0,stack:["deleteNode"]},{site:16,line:1,kind:"call",label:"deleteNode",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:{$scalar:"undefined"},stack:["deleteNode","deleteNode"]},{site:1,line:3,kind:"check",label:"!root",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode"]},{site:14,line:7,kind:"check",label:"key < root.val",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode"]},{site:13,line:10,kind:"check",label:"key > root.val",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode"]},{site:5,line:17,kind:"check",label:"!root.left",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode"]},{site:7,line:22,kind:"check",label:"!root.right",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode"]},{site:8,line:28,kind:"statement",label:"let successor = root.right;",state:{successor:{$ref:"o4"},root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:{$scalar:"undefined"},stack:["deleteNode","deleteNode"]},{site:10,line:29,kind:"check",label:"successor.left",state:{successor:{$ref:"o4"},root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:null,stack:["deleteNode","deleteNode"]},{site:11,line:35,kind:"statement",label:"root.val = successor.val;",state:{successor:{$ref:"o4"},root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{o2:{kind:"tree",fields:{val:4,left:{$ref:"o3"},right:{$ref:"o4"}}}},value:{$scalar:"undefined"},stack:["deleteNode","deleteNode"]},{site:16,line:1,kind:"call",label:"deleteNode",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:{$scalar:"undefined"},stack:["deleteNode","deleteNode","deleteNode"]},{site:1,line:3,kind:"check",label:"!root",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode","deleteNode"]},{site:14,line:7,kind:"check",label:"key < root.val",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode","deleteNode"]},{site:13,line:10,kind:"check",label:"key > root.val",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:!1,stack:["deleteNode","deleteNode","deleteNode"]},{site:5,line:17,kind:"check",label:"!root.left",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:!0,stack:["deleteNode","deleteNode","deleteNode"]},{site:4,line:18,kind:"return",label:"return root.right;",state:{root:{$ref:"o4"},key:4},input:{root:{$ref:"o1"},key:3},heap:{},value:null,stack:["deleteNode","deleteNode","deleteNode"]},{site:12,line:36,kind:"statement",label:"root.right = deleteNode(root.right, successor.val);",state:{successor:{$ref:"o4"},root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{o2:{kind:"tree",fields:{val:4,left:{$ref:"o3"},right:null}}},value:{$scalar:"undefined"},stack:["deleteNode","deleteNode"]},{site:15,line:39,kind:"return",label:"return root;",state:{root:{$ref:"o2"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:{$ref:"o2"},stack:["deleteNode","deleteNode"]},{site:2,line:9,kind:"statement",label:"root.left = deleteNode(root.left, key);",state:{root:{$ref:"o1"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:{$scalar:"undefined"},stack:["deleteNode"]},{site:15,line:39,kind:"return",label:"return root;",state:{root:{$ref:"o1"},key:3},input:{root:{$ref:"o1"},key:3},heap:{},value:{$ref:"o1"},stack:["deleteNode"]}]},{name:"Edge case",input:[{$tree:[1]},1],expected:[],result:[],steps:[{site:16,line:1,kind:"call",label:"deleteNode",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{o1:{kind:"tree",fields:{val:1,left:null,right:null}}},value:{$scalar:"undefined"},stack:["deleteNode"]},{site:1,line:3,kind:"check",label:"!root",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{},value:!1,stack:["deleteNode"]},{site:14,line:7,kind:"check",label:"key < root.val",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{},value:!1,stack:["deleteNode"]},{site:13,line:10,kind:"check",label:"key > root.val",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{},value:!1,stack:["deleteNode"]},{site:5,line:17,kind:"check",label:"!root.left",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{},value:!0,stack:["deleteNode"]},{site:4,line:18,kind:"return",label:"return root.right;",state:{root:{$ref:"o1"},key:1},input:{root:{$ref:"o1"},key:1},heap:{},value:null,stack:["deleteNode"]}]}],s={id:450,title:e,topic:t,code:o,sourceHash:l,generatorHash:r,fixtureHash:a,examples:d};export{o as code,s as default,d as examples,a as fixtureHash,r as generatorHash,n as id,l as sourceHash,e as title,t as topic};
