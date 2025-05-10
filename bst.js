
let tree;
let highlightPath = [];
let currentHighlightIndex = 0;

class Node {
  constructor(value, x, y) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = x;
    this.y = y;
    this.height=1;
  }

  display() {
    if (highlightPath[currentHighlightIndex] === this) {
      fill(255, 200, 200);
    } else {
      fill(255, 150, 200);
    }
    ellipse(this.x, this.y, 50, 50);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(this.value, this.x, this.y);
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  insert(val){
    this.root = this._insertRaw(this.root, val);
    setTimeout(() => {
      this.root = this._rebalance(this.root);
    }, 1000);  
  }

  delete(val) {
    this.root = this._delete(this.root, val, null);   // 同理
  }

  show() {
    this._relayout(this.root, width / 2, 80, width / 4);
    this._draw(this.root);
  }
  _getH(n){
    if(n == null) return 0;
    return n.height;
  }
  _updateH(n){
    if(n==null) return;
    n.height = 1 + Math.max(this._getH(n.left), this._getH(n.right));
  }
  _balance(n){
    return this._getH(n.left) - this._getH(n.right);
  }
  _rotateRight(y) {
    const x  = y.left;
    const T2 = x.right;

    x.right = y;
    y.left  = T2;

    this._updateH(y);
    this._updateH(x);
    return x;              // 回傳新根
  }
  _rotateLeft(x) {
    const y  = x.right;
    const T2 = y.left;

    y.left  = x;
    x.right = T2;

    this._updateH(x);
    this._updateH(y);
    return y;
  }
  _insertRaw(node, val){
    if(!node) return new Node(val);

    if(val < node.value)      node.left  = this._insertRaw(node.left,  val);
    else if(val > node.value) node.right = this._insertRaw(node.right, val);
    else return node;                                   // 重複值直接忽略

    this._updateH(node);
    return node;
  }
  _rebalance(node){
    if(!node) return null;

    /* 先遞迴 Rebalance 左右子樹 */
    node.left  = this._rebalance(node.left);
    node.right = this._rebalance(node.right);

    /* 更新高度，再檢查失衡 */
    this._updateH(node);
    const bal = this._balance(node);

    // LL
    if(bal > 1 && this._balance(node.left) >= 0)
      return this._rotateRight(node);
    // LR
    if(bal > 1 && this._balance(node.left) < 0){
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }
    // RR
    if(bal < -1 && this._balance(node.right) <= 0)
      return this._rotateLeft(node);
    // RL
    if(bal < -1 && this._balance(node.right) > 0){
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }
    return node;        // 已平衡
  }
  _delete(node, val, parent) {
    if (!node) return null;

    if (val < node.value) {
      node.left  = this._delete(node.left,  val, node);
      return node;
    }
    if (val > node.value) {
      node.right = this._delete(node.right, val, node);
      return node;
    }

    if (node.left && node.right) {
      // (a) 收集「右子樹一路往左」的路徑
      const path = [];
      let cur = node.right;
      while (cur) {
        path.push(cur);
        if (cur.left) cur = cur.left;
        else break;
      }
      const self = this;                     // 保存 this
      animatePath(path, () => {
        const succ = path[path.length - 1];  // 路徑最後一顆 = successor
        node.value = succ.value;             // 把值搬上來
        node.right = self._delete(node.right,
                                  succ.value,
                                  node);     // 把 successor 拔掉
      });

      return node;                           // 先回傳，實際更新在 callback 內
    }

    /* ───── 只有 0 or 1 個小孩：照舊立即處理 ───── */
    const child = node.left ? node.left : node.right;   // 可能是 null
    if (child) child.parent = parent;                   // 更新 parent 指標
    return child;                                       // 回傳給上一層接線
  }

  _min(n) { return n.left ? this._min(n.left) : n; }

  /* ─── 私有：重新排版 ─── */
  _relayout(node, x, y, gap) {
    if (!node) return;
    node.x = x;
    node.y = y;
    this._relayout(node.left,  x - gap, y + 100, gap / 2);
    this._relayout(node.right, x + gap, y + 100, gap / 2);
  }

  /* ─── 私有：畫圖 ─── */
  _draw(node) {
    if (!node) return;
    stroke(0);
    if (node.left)  line(node.x, node.y, node.left.x,  node.left.y);
    if (node.right) line(node.x, node.y, node.right.x, node.right.y);
    node.display();
    this._draw(node.left);
    this._draw(node.right);
  }
  getInsertPath(val) {
    const path = [];
    let cur = this.root;
    while (cur) {
      path.push(cur);
      if (val < cur.value) {
        if (!cur.left) break;   // 下一步就會插在這
        cur = cur.left;
      } else if (val > cur.value) {
        if (!cur.right) break;
        cur = cur.right;
      } else break;             // 同值 (理論上不會插)
    }
    return path;
  }

  getSearchPath(val) {
    const path = [];
    let cur = this.root;
    while (cur) {
      path.push(cur);
      if (val < cur.value)      cur = cur.left;
      else if (val > cur.value) cur = cur.right;
      else break;               // 找到了
    }
    return path;
  }
}

function animatePath(path, cb) {
  highlightPath = path;
  currentHighlightIndex = 0;

  const id = setInterval(() => {
    if (currentHighlightIndex < path.length - 1) {
      currentHighlightIndex++;
    } else {
      clearInterval(id);
      highlightPath = [];
      currentHighlightIndex = 0;
      if (cb) cb();             // 跑完再做真正的工作
    }
  }, 500);                      // 速度想調就改這裡
}

function setup() {
  const canvas = createCanvas(1200, 800);
  canvas.parent('canvas-container');
  tree = new BST();
}

function draw() {
  background(255);
  tree.show();
}

function insertNode() {
  const valueStr = document.getElementById('inputBox').value;
  const value = parseFloat(valueStr);
  if (isNaN(valueStr) || valueStr === '') return;

  highlightPath = tree.getInsertPath(value);
  currentHighlightIndex = 0;
  document.getElementById('inputBox').value = '';

  let interval = setInterval(() => {
    if (currentHighlightIndex < highlightPath.length - 1) {
      currentHighlightIndex++;
    } else {
      clearInterval(interval);
      tree.insert(value); // 實際插入節點
      highlightPath = [];
      currentHighlightIndex = 0;
    }
  }, 500);
}

function deleteNode() {
  const valueStr = document.getElementById('inputBox').value;
  const value = parseFloat(valueStr);
  if (isNaN(valueStr) || valueStr === '') return;

  document.getElementById('inputBox').value = '';

  /* ① 先高亮 root→目標 的搜尋路徑 */
  const path = tree.getSearchPath(value);
  animatePath(path, () => {
    /* ② 搜尋動畫播完，再真正刪除
          ⇒ _delete() 內部會自己播放 successor 動畫 */
    tree.delete(value);
  });

  /* 不要清 highlightPath，讓 animatePath 控管 */
}


function searchNode() {
  const valueStr = document.getElementById('inputBox').value;
  const value = parseFloat(valueStr);
  if (isNaN(valueStr) || valueStr === '') return;

  highlightPath = tree.getSearchPath(value);
  currentHighlightIndex = 0;
  document.getElementById('inputBox').value = '';
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = ''; // clear previous

  let interval = setInterval(() => {
    if (currentHighlightIndex < highlightPath.length - 1) {
      currentHighlightIndex++;
    } else {
      clearInterval(interval);
      // after animation finishes
      if (highlightPath.length > 0 && highlightPath[highlightPath.length - 1].value === value) {
        messageDiv.textContent = 'Found😽';
        // keep highlight at found node
      } else {
        messageDiv.textContent = 'Not Found😭';
        highlightPath = [];
        currentHighlightIndex = 0;
      }
    }
  }, 500);
}

