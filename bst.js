
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
  insert(val) {
    this.root = this._insert(this.root, val, null);   // parent 先傳 null
  }

  delete(val) {
    this.root = this._delete(this.root, val, null);   // 同理
  }

  show() {
    this._relayout(this.root, width / 2, 80, width / 4);
    this._draw(this.root);
  }
  _insert(node, val, parent) {
    if (!node) {                 // new node
      const n = new Node(val);
      n.parent = parent;
      return n;
    }
    if (val < node.value) {
      node.left  = this._insert(node.left,  val, node);
    } else if (val > node.value) {
      node.right = this._insert(node.right, val, node);
    }
    return node;
  }

/* --------- 取代原本的 _delete ---------- */
  _delete(node, val, parent) {
    if (!node) return null;

    /* ❶ 還沒遇到目標，就往左右子樹找 */
    if (val < node.value) {
      node.left  = this._delete(node.left,  val, node);
      return node;
    }
    if (val > node.value) {
      node.right = this._delete(node.right, val, node);
      return node;
    }

    /* ❷ 找到了要刪的 node！*/

    /* ───── 兩個小孩：先播 successor 動畫，再真正刪 ───── */
    if (node.left && node.right) {
      // (a) 收集「右子樹一路往左」的路徑
      const path = [];
      let cur = node.right;
      while (cur) {
        path.push(cur);
        if (cur.left) cur = cur.left;
        else break;
      }

      // (b) 播動畫；播完再搬值＋遞迴刪 successor
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

