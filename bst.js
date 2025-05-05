class Node {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
      this.height=1
        this.parent = null;
    }
}

function getHeight(node){
  return (node == null)? 0 : node.height;
}
function updateHeight(node){
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}
function getBalance(node){
  return (node == null)? 0: getHeight(node.left) - getHeight(node.right);
}
function rotateRight(y) {
  let x = y.left;
  let T2 = x.right;
  x.right = y;
  y.left = T2;
  if(T2) T2.parent = y;
  x.parent = y.parent;
  y.parent = x;
  updateHeight(x);
  updateHeight(y);
  return x;
}
function rotateLeft(x){
  let y = x.right;
  let T2 = y.left;
  y.left = x;
  x.right = T2;
  if(T2) T2.parent = x;
  y.parent = x.parent;
  x.parent = y;
  return y;
}
let root;
let resultText = "";

function setup() {
    createCanvas(windowWidth, windowHeight);
    root = null; // 一開始是空樹
    inputBox = createInput();
    inputBox.position(20, 20);
    inputBox.size(100);

    insertButton = createButton('insert');
    insertButton.position(130, 20);
    insertButton.mousePressed(onInsertPressed);
    searchButton = createButton('search');
    searchButton.position(200, 20);
    searchButton.mousePressed(onSearchPressed);
    RemoveButton = createButton('Remove');
    RemoveButton.position(270, 20);
    RemoveButton.mousePressed(onRemovePressed);
}

function draw() {
    //if (keyIsPressed === true && keyCode === ENTER) onInsertPressed();
    background(255, 220, 250);
    textAlign(CENTER, CENTER);
    textSize(20);
    drawTree(root);
    fill(50);
    textAlign(LEFT, TOP);
    textSize(24);
    text(resultText, 20, 80);
}

function drawTree(node) {
    updatePositions(root, width / 2, 100, width / 6);
    if (node == null) {
        return;
    }

    if (node.left != null) {
        stroke(0);
        line(node.x, node.y, node.left.x, node.left.y);
        drawTree(node.left);
    }
    if (node.right != null) {
        stroke(0);
        line(node.x, node.y, node.right.x, node.right.y);
        drawTree(node.right);
    }

    if (node.highlighted) fill(255, 200, 200);
    else fill(255, 150, 200);
    stroke(0);
    ellipse(node.x, node.y, 50, 50);
    fill(0);
    noStroke();
    text(node.value, node.x, node.y);
}

// 插入新數字
function insert(value) {
    if (root == null) {
        root = new Node(value)
        root.parent = null;
    } else insertNode(root, value);

}

function highlight(node) {
    if (node == null) return
    node.highlighted = 1;
    setTimeout(() => {
        node.highlighted = 0
    }, 900)
}

// 插入的輔助函數
function insertNode(node, value) {

    setTimeout(() => {
        if (value < node.value) {
            if (node.left == null) {
                node.left = new Node(value);
                node.left.parent = node
            } else
                insertNode(node.left, value, node);
            highlight(node.left);

        } else if (value > node.value) {

            if (node.right == null) {
                node.right = new Node(value);
                node.right.parent = node
            } else
                insertNode(node.right, value);
            highlight(node.right);

        }
    }, 600)

    return node;
}

// 更新每個節點的位置
function updatePositions(node, x, y, spacing) {
    if (node == null) return;
    node.x = x;
    node.y = y;
    if (node.left != null) {
        updatePositions(node.left, x - spacing, y + 100, spacing / 1.7);
    }
    if (node.right != null) {
        updatePositions(node.right, x + spacing, y + 100, spacing / 1.7);
    }
}

function onInsertPressed() {
    let value = float(inputBox.value());
    if (!isNaN(value)) {
        if (root) highlight(root);
        insert(value);
        inputBox.value('');
    }
}

function onSearchPressed() {
    let value = float(inputBox.value());
    if (!isNaN(value)) {
        resultText = "searching... 🔍";
        search(root, value);
        inputBox.value('');
    }
}

function onRemovePressed() {
    let value = float(inputBox.value());
    if (!isNaN(value)) {
        resultText = "searching... 🔍";
        Remove(root, value);
        inputBox.value('');
    }
}

function search(node, value) {
    if (node == null) {
        resultText = "didn't find 💔"
        return;
    }
    highlight(node);
    setTimeout(() => {
        if (value < node.value) search(node.left, value);
        else if (value > node.value) search(node.right, value);
        else {
            resultText = "found 💖"
        }
    }, 700)
}

function setToBe(node, to) {
    if (node == root) root = to
    else if (node.parent.left == node) {
        node.parent.left = to
        if (to != null) to.parent = node.parent
    }
    else if (node.parent.right == node) {
        node.parent.right = to
        if (to != null) to.parent = node.parent
    }
}

function leftMostInSubtree(node) {
    if (node.left == null) return node
    let next = leftMostInSubtree(node.left)
    return (next ? next : node)
}

function Remove(node, value) {
    if (node == null) {
        resultText = "didn't find 💔"
        return;
    }
    highlight(node);
    setTimeout(() => {
        if (value < node.value) Remove(node.left, value);
        else if (value > node.value) Remove(node.right, value);
        else {
            resultText = "removing...❗"
            setTimeout(() => {
                resultText = "successfully removed.🎵"
            }, 1400)
            if (node.left && node.right) {
                let inOrderSucessor = leftMostInSubtree(node.right)
                highlight(inOrderSucessor)
                setTimeout(() => {
                    node.value = inOrderSucessor.value
                    setToBe(inOrderSucessor, inOrderSucessor.right)
                }, 1400)

            }
            else{
                let toBeSwapped = node.left || node.right || null
                highlight(toBeSwapped)
                setTimeout(() => {
                    setToBe(node, toBeSwapped)
                }, 1400)
            }

        }

    }, 700)
}
