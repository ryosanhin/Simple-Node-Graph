// ==========================================
// 1. Drawflowエディタの初期化
// ==========================================
const id = document.getElementById("drawflow");
const editor = new Drawflow(id);
editor.reroute = true; // 接続線を曲げられるようにする
editor.start(); // エディタを起動

let isNodeSelected = false;
let selectedNodeId; // 選択中のノードのID

// ==========================================
// 2. ノードのHTMLテンプレート定義
// ==========================================
// df-title, df-context 属性をつけることで、Drawflowが自動でJSONデータに同期
const nodeHtml = `
	<div class="node-content" onmousedown="stopDragInEditMode(event, this)" ondblclick="switchToEditMode(this)">
		<textarea df-context placeholder="# Header\n*Italic* and **strong** etc." class="edit-mode"></textarea>
		<div class="preview-mode markdown-body"></div>
	</div>
`;

// ==========================================
// 3. ノード追加処理
// ==========================================
function addMarkdownNode() {
    // 画面がスクロール・ズームされていても、現在の表示領域の中央に配置するための計算
    const canvasWidth = editor.precanvas.clientWidth;
    const canvasHeight = editor.precanvas.clientHeight;
    const zoom = editor.zoom;
    const canvasX = editor.precanvas.getBoundingClientRect().x;
    const canvasY = editor.precanvas.getBoundingClientRect().y;

    const posX = (canvasWidth / 2 - canvasX) / zoom;
    const posY = (canvasHeight / 2 - canvasY) / zoom;

    // ノードを追加 (入力1ポート, 出力1ポート)
    const nodeId = editor.addNode('myNode', 1, 1, posX, posY, 'my-node', { "title": "", "context": "" }, nodeHtml, false);
    
    // 追加された直後はプレビュー状態にする
    const nodeElement = document.getElementById('node-' + nodeId);
    switchToPreviewMode(nodeElement);
}

// ==========================================
// 4. 自動プレビュー・編集モード切替のイベント
// ==========================================

// ノードがクリックされて「選択状態」になったら発火するDrawflowの標準イベント
editor.on('nodeSelected', function(id) {
	// 他にも選択中だったらそれを編集モードからプレビューモードへ切り替え
	if(isNodeSelected){
		switchToPreviewMode(selectedNodeId);
	}
});

// ノード以外の場所（キャンバス背景など）がクリックされ、「選択解除」されたら発火するイベント
editor.on('nodeUnselected', function(id) {
	// 未選択なら早期リターン
	if(!isNodeSelected) return;
	
	const nodeElement = document.getElementById(selectedNodeId);
	isNodeSelected = false;
	
	// 選択が外れたノードをプレビューモードにする
	switchToPreviewMode(nodeElement);
});

function switchToEditMode(element) {
	const nodeElement = element.classList?.contains('drawflow-node') ? element : element.closest('.drawflow-node');
	
	if (!nodeElement) return;
	
	// 新しく選択されたノードのIdをキャッシュ
	const id = nodeElement.id;
	selectedNodeId = id;
	isNodeSelected = true;
	
	nodeElement.classList.remove('is-previewing');
	
	setTimeout(() => {
		editor.updateConnectionNodes(nodeElement.id);
	}, 0);
}

// プレビューモードへの切り替え関数
function switchToPreviewMode(nodeElement) {
	if (!nodeElement) return;
	
	// Drawflow内部に保存されている最新の入力値を取得
	const contextInput = nodeElement.querySelector('textarea[df-context]');
	
	if (contextInput) {
		// コンテキスト側は marked.parse() を使ってマークダウンをHTMLに変換
		nodeElement.querySelector('.markdown-body').innerHTML = marked.parse(contextInput.value);
	}
	
	// 'is-previewing' クラスを付与し、CSSの力でプレビュー表示に切り替える
	nodeElement.classList.add('is-previewing');
	
	setTimeout(() => {
		editor.updateConnectionNodes(nodeElement.id);
	}, 0);
}

// Drawflowへマウスダウンのイベントが伝播するのを止める（テキストエリアの拡縮操作のみが有効になる）
function stopDragInEditMode(event, element) {
	const nodeElement = element.closest('.drawflow-node');
	
	// プレビューモードでない（＝編集モード中）なら
	if (!nodeElement.classList.contains('is-previewing')) {
		event.stopPropagation();
	}
}

// ==========================================
// 5. テスト用：初期ノードの配置
// ==========================================
// 起動時に最初から配置されているサンプルノード
const node1Id = editor.addNode('myNode', 1, 1, 300, 150, 'my-node', {"context": "# Header\nClick here to edit" }, nodeHtml, false);
const nodeElement1 = document.getElementById('node-' + node1Id);
switchToPreviewMode(nodeElement1); // 最初はプレビューにしておく

// ==========================================
// 6. エクスポート機能
// ==========================================
function exportData() {
	const exportJson = JSON.stringify(editor.export(), null, 4);
	
	// JSONをファイルとしてダウンロードさせる処理
	const blob = new Blob([exportJson], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'nodes_data.json';
	a.click();
	URL.revokeObjectURL(url);
}

// ==========================================
// 7. インポート機能
// ==========================================
function importData(event) {
	const file = event.target.files[0];
	if (!file) return;

	// ファイルをテキストとして読み込む
	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			// テキストをJSONオブジェクトに変換
			const importJson = JSON.parse(e.target.result);
			
			// Drawflowにデータをインポート（現在の画面は自動で上書き）
			editor.import(importJson);

			// 【重要】インポート直後は「編集モード」の見た目になってしまうため、
			// 全てのノードを「プレビューモード」に再設定する
			const allNodes = document.querySelectorAll('.drawflow-node');
			allNodes.forEach(nodeElement => {
				switchToPreviewMode(nodeElement);
			});
			
			// 次回も同じファイルを選択できるように input の値をリセット
			event.target.value = "";
			
		} catch (error) {
			alert("JSONファイルの読み込みに失敗しました。\n正しい形式のファイルか確認してください。");
			console.error(error);
		}
	};
	
	// 読み込みの実行
	reader.readAsText(file);
}