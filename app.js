// ===================== Page Navigation =====================
var pageTitles = {
  'dashboard': '工作台', 'monitor': '话题监测', 'roster': '匹配名单',
  'scoring': '评分标准库', 'alerts': '评分评级', 'reports': '评估报告',
  'tracking': '处置追踪', 'archive': '数据归档', 'profile': '个人空间'
};

document.querySelectorAll('.nav-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage(item.getAttribute('data-page'));
  });
});

function navigateToPage(pageId) {
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var navItem = document.querySelector('.nav-item[data-page="' + pageId + '"]');
  if (navItem) navItem.classList.add('active');
  document.getElementById('page-' + pageId).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[pageId] || '工作台';
}

function goToPage(pageId) { navigateToPage(pageId); }

// ===================== Edit / Add / Delete / Toggle Config =====================
var editConfigs = {
  monitor: [
    { label: '关键词', cellIdx: 0, type: 'text' },
    { label: '所属平台', cellIdx: 1, type: 'text' },
    { label: '监测范围', cellIdx: 2, type: 'text' },
    { label: '状态', cellIdx: 3, type: 'select', options: ['启用', '停用'] }
  ],
  roster: [
    { label: '类型', cellIdx: 0, type: 'select', options: ['企业', '主播', '行业'] },
    { label: '名称', cellIdx: 1, type: 'text' },
    { label: '平台', cellIdx: 2, type: 'text' },
    { label: '粉丝量级', cellIdx: 3, type: 'text' },
    { label: '关联MCN', cellIdx: 4, type: 'text' },
    { label: '状态', cellIdx: 5, type: 'select', options: ['启用', '停用'] }
  ],
  scoring: [
    { label: '评分维度', cellIdx: 0, type: 'text' },
    { label: '分值范围', cellIdx: 1, type: 'text' },
    { label: '评估依据', cellIdx: 2, type: 'text' },
    { label: '评分参考', cellIdx: 3, type: 'text' },
    { label: '状态', cellIdx: 4, type: 'select', options: ['启用', '停用'] }
  ],
  reports: [
    { label: '报告编号', cellIdx: 0, type: 'text', readonly: true },
    { label: '评分对象', cellIdx: 2, type: 'text' },
    { label: '触发关键词', cellIdx: 4, type: 'text' }
  ],
  alerts: [
    { label: '评分对象', cellIdx: 0, type: 'text' },
    { label: '媒体覆盖', cellIdx: 2, type: 'text' },
    { label: '传播速度', cellIdx: 3, type: 'text' },
    { label: '情感负向', cellIdx: 4, type: 'text' },
    { label: '敏感等级', cellIdx: 5, type: 'text' },
    { label: '账号影响', cellIdx: 6, type: 'text' },
    { label: '区域关联', cellIdx: 7, type: 'text' }
  ]
};

var typeColors = { '企业': '#09607D', '主播': '#E67E22', '行业': '#8E44AD' };
var editTarget = null; // { tableBodyId, row, config, mode }

function renderStatusCell(val) {
  return val === '启用' ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
}

function renderTypeCell(val) {
  var color = typeColors[val] || '#09607D';
  return '<span class="tag" style="background:' + color + ';color:#fff">' + val + '</span>';
}

function editRow(tableBodyId, btn, type) {
  var row = btn.closest('tr');
  var config = editConfigs[type];
  editTarget = { tableBodyId: tableBodyId, row: row, config: config, mode: 'edit' };
  document.getElementById('editModalTitle').textContent = '编辑';
  buildEditForm(row, config);
  document.getElementById('editModal').style.display = 'flex';
}

function showAddForm(tableBodyId, type) {
  var config = editConfigs[type];
  editTarget = { tableBodyId: tableBodyId, row: null, config: config, mode: 'add' };
  document.getElementById('editModalTitle').textContent = '新增';
  buildEditForm(null, config);
  document.getElementById('editModal').style.display = 'flex';
}

function buildEditForm(row, config) {
  var html = '';
  config.forEach(function(field) {
    var val = '';
    if (row && row.cells[field.cellIdx]) {
      val = row.cells[field.cellIdx].textContent.trim();
    }
    if (field.type === 'select') {
      var opts = field.options.map(function(o) {
        return '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>';
      }).join('');
      html += '<div class="ps-field"><label>' + field.label + '</label><select class="form-input edit-field" data-idx="' + field.cellIdx + '" data-type="select">' + opts + '</select></div>';
    } else {
      var ro = field.readonly ? 'readonly' : '';
      html += '<div class="ps-field"><label>' + field.label + '</label><input class="form-input edit-field" data-idx="' + field.cellIdx + '" value="' + val.replace(/"/g,'&quot;') + '" ' + ro + '></div>';
    }
  });
  html += '<div style="text-align:center;margin-top:16px"><button class="btn-primary" onclick="saveEdit()">保存</button><button class="btn-sm" onclick="closeModal(\'editModal\')" style="margin-left:8px">取消</button></div>';
  document.getElementById('editModalBody').innerHTML = html;
}

function saveEdit() {
  if (!editTarget) return;
  var fields = document.querySelectorAll('#editModalBody .edit-field');
  if (editTarget.mode === 'edit' && editTarget.row) {
    // Update existing row
    fields.forEach(function(el) {
      var idx = parseInt(el.getAttribute('data-idx'));
      var val = el.value;
      var td = editTarget.row.cells[idx];
      if (!td) return;
      if (el.getAttribute('data-type') === 'select' && editTarget.config && editTarget.config[idx] && editTarget.config[idx].label === '状态') {
        td.innerHTML = renderStatusCell(val);
      } else if (editTarget.config && editTarget.config[idx] && editTarget.config[idx].label === '类型') {
        td.innerHTML = renderTypeCell(val);
      } else {
        td.textContent = val;
      }
    });
  } else if (editTarget.mode === 'add') {
    // Create new row
    var tbody = document.getElementById(editTarget.tableBodyId);
    if (!tbody) return;
    var cells = {};
    fields.forEach(function(el) {
      var idx = parseInt(el.getAttribute('data-idx'));
      cells[idx] = el.value;
    });
    // Determine total cell count from header row
    var headerRow = tbody.closest('table').querySelector('thead tr');
    var totalCells = headerRow ? headerRow.cells.length : 0;
    var html = '<tr>';
    var config = editTarget.config;
    for (var i = 0; i < totalCells; i++) {
      // Check if this is the last cell (action cell)
      var isAction = (i === totalCells - 1);
      if (isAction) {
        // Determine action buttons based on which table
        var tableId = editTarget.tableBodyId;
        if (tableId === 'scoreBody') {
          html += '<td class="action-cell"><button class="btn-sm" onclick="editRow(\'' + tableId + '\',this,\'' + getTableType(tableId) + '\')">修改</button><button class="btn-sm" onclick="toggleRowStatus(this)">停用</button><button class="btn-sm btn-danger" onclick="deleteRow(\'' + tableId + '\',this)">删除</button></td>';
        } else {
          html += '<td class="action-cell"><button class="btn-sm" onclick="editRow(\'' + tableId + '\',this,\'' + getTableType(tableId) + '\')">修改</button><button class="btn-sm btn-danger" onclick="deleteRow(\'' + tableId + '\',this)">删除</button></td>';
        }
      } else if (cells[i] !== undefined) {
        var val = cells[i];
        // Check if field is status or type
        var fieldConfig = config.find(function(f) { return f.cellIdx === i; });
        if (fieldConfig && fieldConfig.label === '状态') {
          html += '<td>' + renderStatusCell(val || '启用') + '</td>';
        } else if (fieldConfig && fieldConfig.label === '类型') {
          html += '<td>' + renderTypeCell(val || '企业') + '</td>';
        } else {
          html += '<td>' + val + '</td>';
        }
      } else {
        html += '<td>—</td>';
      }
    }
    html += '</tr>';
    tbody.insertAdjacentHTML('beforeend', html);
  }
  closeModal('editModal');
}

function getTableType(tableBodyId) {
  if (tableBodyId === 'kwBody') return 'monitor';
  if (tableBodyId === 'rosterBody') return 'roster';
  if (tableBodyId === 'scoreBody') return 'scoring';
  if (tableBodyId === 'reportListBody') return 'reports';
  if (tableBodyId === 'alertResultBody') return 'alerts';
  return 'monitor';
}

// ===================== View Detail (reuses edit modal) =====================
var viewConfigs = {
  reports: [
    { label: '报告编号', cellIdx: 0, type: 'text', readonly: true },
    { label: '评级', cellIdx: 1, type: 'text', readonly: true },
    { label: '评分对象', cellIdx: 2, type: 'text' },
    { label: '总分', cellIdx: 3, type: 'text', readonly: true },
    { label: '触发关键词', cellIdx: 4, type: 'text' },
    { label: '生成时间', cellIdx: 5, type: 'text', readonly: true }
  ],
  archive: [
    { label: '归档编号', cellIdx: 0, type: 'text', readonly: true },
    { label: '事件摘要', cellIdx: 1, type: 'text' },
    { label: '原始评级', cellIdx: 2, type: 'text', readonly: true },
    { label: '对象', cellIdx: 3, type: 'text' },
    { label: '归档时间', cellIdx: 4, type: 'text', readonly: true },
    { label: '状态', cellIdx: 5, type: 'text', readonly: true }
  ]
};

function viewDetail(tableBodyId, btn, type) {
  var config = viewConfigs[type];
  if (!config) { editRow(tableBodyId, btn, type); return; }
  var row = btn.closest('tr');
  editTarget = { tableBodyId: tableBodyId, row: row, config: config, mode: 'edit' };
  document.getElementById('editModalTitle').textContent = '查看详情';
  buildEditForm(row, config);
  document.getElementById('editModal').style.display = 'flex';
}

function viewDetailSimple(info) {
  var lines = info.split('\n');
  var html = '<div style="padding:10px 0">';
  lines.forEach(function(l) {
    var parts = l.split(': ');
    html += '<div class="ps-field"><label>' + parts[0] + '</label><input class="form-input" value="' + (parts[1] || '') + '" readonly></div>';
  });
  html += '<div style="text-align:center;margin-top:16px"><button class="btn-sm" onclick="closeModal(\'detailSimpleModal\')">关闭</button></div>';
  document.getElementById('detailSimpleBody').innerHTML = html;
  document.getElementById('detailSimpleModal').style.display = 'flex';
}

// ===================== Delete with Confirm =====================
var deleteTarget = null;

function deleteRow(tableBodyId, btn) {
  var row = btn.closest('tr');
  deleteTarget = { tableBodyId: tableBodyId, row: row };
  document.getElementById('confirmMsg').textContent = '确定要删除该项吗？删除后不可恢复。';
  document.getElementById('confirmModal').style.display = 'flex';
}

function confirmDeleteAction() {
  if (deleteTarget && deleteTarget.row) {
    deleteTarget.row.remove();
  }
  deleteTarget = null;
  closeModal('confirmModal');
}

// ===================== Toggle Status (启用/停用) =====================
function toggleRowStatus(btn) {
  var row = btn.closest('tr');
  var td = row.cells[row.cells.length - 2]; // status is second-to-last before action
  // Find the status cell by looking for .tag inside
  var statusCells = row.querySelectorAll('td');
  for (var i = 0; i < statusCells.length; i++) {
    var tag = statusCells[i].querySelector('.tag.good, .tag.warn');
    if (tag) {
      var isEnabled = tag.classList.contains('good');
      statusCells[i].innerHTML = isEnabled ? '<span class="tag warn">停用</span>' : '<span class="tag good">启用</span>';
      btn.textContent = isEnabled ? '启用' : '停用';
      break;
    }
  }
}

// ===================== Archive Toggle =====================
function archiveRow(btn) {
  var row = btn.closest('tr');
  var cells = row.querySelectorAll('td');
  // Find status cell (contains status-pill)
  for (var i = 0; i < cells.length; i++) {
    var pill = cells[i].querySelector('.status-pill');
    if (pill) {
      pill.className = 'status-pill done';
      pill.textContent = '已归档';
      btn.remove();
      break;
    }
  }
}

// ===================== Scoring Search with Status Filter =====================
function filterScoreTable() {
  var q = document.getElementById('scoreSearchInput').value.trim().toLowerCase();
  var status = document.getElementById('scoreStatusFilter').value;
  var table = document.getElementById('scoreTable');
  if (!table) return;
  var rows = table.querySelectorAll('tbody tr');
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var matchText = !q || text.indexOf(q) > -1;
    var matchStatus = true;
    if (status) {
      var rowStatus = row.querySelector('.tag') ? row.querySelector('.tag').textContent.trim() : '';
      matchStatus = rowStatus === status;
    }
    row.style.display = (matchText && matchStatus) ? '' : 'none';
  });
}

function resetScoreSearch() {
  document.getElementById('scoreSearchInput').value = '';
  document.getElementById('scoreStatusFilter').value = '';
  filterScoreTable();
}

// ===================== Archive Search with Status Filter =====================
function filterArchiveTable() {
  var q = document.getElementById('archiveSearchInput').value.trim().toLowerCase();
  var status = document.getElementById('archiveStatusFilter').value;
  var table = document.getElementById('archiveListTable');
  if (!table) return;
  var rows = table.querySelectorAll('tbody tr');
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    var matchText = !q || text.indexOf(q) > -1;
    var matchStatus = true;
    if (status) {
      var pill = row.querySelector('.status-pill');
      var rowStatus = pill ? pill.textContent.trim() : '';
      matchStatus = rowStatus === status;
    }
    row.style.display = (matchText && matchStatus) ? '' : 'none';
  });
}

function resetArchiveSearch() {
  document.getElementById('archiveSearchInput').value = '';
  document.getElementById('archiveStatusFilter').value = '';
  filterArchiveTable();
}

// ===================== Excel Import =====================
function parseExcelFile(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, { type: 'array' });
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    var json = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    callback(json);
  };
  reader.readAsArrayBuffer(file);
}

function importKeywords(event) {
  var file = event.target.files[0];
  if (!file) return;
  parseExcelFile(file, function(rows) {
    var tbody = document.getElementById('kwBody');
    tbody.innerHTML = '';
    rows.forEach(function(row) {
      if (row.length < 2 || !row[0]) return;
      var keyword = row[0] || '';
      var platform = row[1] || '全平台';
      var scope = row[2] || '标题+正文+评论';
      var status = row[3] || '启用';
      var time = row[4] || new Date().toISOString().slice(0,10);
      var statusTag = status.indexOf('启用') > -1 ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      var tr = '<tr><td>' + keyword + '</td><td>' + platform + '</td><td>' + scope + '</td><td>' + statusTag + '</td><td>' + time + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'kwBody\',this,\'monitor\')">修改</button><button class="btn-sm btn-danger" onclick="deleteRow(\'kwBody\',this)">删除</button></td></tr>';
      tbody.insertAdjacentHTML('beforeend', tr);
    });
  });
  event.target.value = '';
}

function importRoster(event) {
  var file = event.target.files[0];
  if (!file) return;
  parseExcelFile(file, function(rows) {
    var tbody = document.getElementById('rosterBody');
    tbody.innerHTML = '';
    rows.forEach(function(row) {
      if (row.length < 2 || !row[0]) return;
      var type = row[0] || '企业';
      var name = row[1] || '';
      var platform = row[2] || '—';
      var fans = row[3] || '—';
      var mcn = row[4] || '—';
      var status = row[5] || '启用';
      var time = row[6] || new Date().toISOString().slice(0,10);
      var color = typeColors[type] || '#09607D';
      var statusTag = status.indexOf('启用') > -1 ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      var tr = '<tr><td><span class="tag" style="background:' + color + ';color:#fff">' + type + '</span></td><td>' + name + '</td><td>' + platform + '</td><td>' + fans + '</td><td>' + mcn + '</td><td>' + statusTag + '</td><td>' + time + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'rosterBody\',this,\'roster\')">修改</button><button class="btn-sm btn-danger" onclick="deleteRow(\'rosterBody\',this)">删除</button></td></tr>';
      tbody.insertAdjacentHTML('beforeend', tr);
    });
  });
  event.target.value = '';
}

function importScoring(event) {
  var file = event.target.files[0];
  if (!file) return;
  parseExcelFile(file, function(rows) {
    var tbody = document.getElementById('scoreBody');
    tbody.innerHTML = '';
    rows.forEach(function(row) {
      if (row.length < 2 || !row[0]) return;
      var dimension = row[0] || '';
      var range = row[1] || '';
      var basis = row[2] || '';
      var ref = row[3] || '';
      var status = row[4] || '启用';
      var statusTag = status.indexOf('启用') > -1 ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      var toggleBtn = status.indexOf('启用') > -1 ? '停用' : '启用';
      var tr = '<tr><td>' + dimension + '</td><td>' + range + '</td><td>' + basis + '</td><td>' + ref + '</td><td>' + statusTag + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'scoreBody\',this,\'scoring\')">修改</button><button class="btn-sm" onclick="toggleRowStatus(this)">' + toggleBtn + '</button><button class="btn-sm btn-danger" onclick="deleteRow(\'scoreBody\',this)">删除</button></td></tr>';
      tbody.insertAdjacentHTML('beforeend', tr);
    });
  });
  event.target.value = '';
}

// ===================== Fuzzy Search =====================
function filterTable(tableId, query) {
  var table = document.getElementById(tableId);
  if (!table) return;
  var rows = table.querySelectorAll('tbody tr');
  var q = query.trim().toLowerCase();
  rows.forEach(function(row) {
    var text = row.textContent.toLowerCase();
    row.style.display = (!q || text.indexOf(q) > -1) ? '' : 'none';
  });
}

// ===================== Modal Management =====================
function showRedAlertPopup() {
  document.getElementById('redAlertModal').style.display = 'flex';
}

function showAlertConfig() {
  document.getElementById('alertConfigModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ===================== History Modal =====================
function showHistoryModal() {
  document.getElementById('historyModal').style.display = 'flex';
}

// ===================== Reports =====================
function refreshReports() {
  alert('报告列表已刷新');
}

function exportAllReports() {
  var table = document.getElementById('reportListTable');
  if (!table) return;
  var ws = XLSX.utils.table_to_sheet(table);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '评估报告');
  XLSX.writeFile(wb, '评估报告_' + new Date().toISOString().slice(0,10) + '.xlsx');
}

// ===================== Chart Toggle (周/月) =====================
function setTrendMode(btn, mode) {
  btn.parentNode.querySelectorAll('.toggle-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function setAlertMode(btn, mode) {
  btn.parentNode.querySelectorAll('.toggle-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

// ===================== Clock =====================
function updateClock() {
  var now = new Date();
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  var str = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate())
    + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  document.getElementById('currentTime').textContent = str;
}
updateClock();
setInterval(updateClock, 1000);

// ===================== Pie Chart (Canvas) =====================
(function drawPie() {
  var canvas = document.getElementById('sentimentPie');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 200, H = 200, cx = 100, cy = 100, r = 80;
  canvas.width = W; canvas.height = H;
  var data = [
    { label: '正面', value: 62.3, color: '#27AE60' },
    { label: '中性', value: 24.5, color: '#F39C12' },
    { label: '负面', value: 13.2, color: '#C0392B' }
  ];
  var total = data.reduce(function(s, d) { return s + d.value; }, 0);
  var startAngle = -Math.PI / 2;
  data.forEach(function(d) {
    var sliceAngle = (d.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    startAngle += sliceAngle;
  });
  // Center white circle for donut effect (optional - uncomment for donut)
  // ctx.beginPath(); ctx.arc(cx, cy, 45, 0, 2*Math.PI); ctx.fillStyle='#FFF'; ctx.fill();
})();

// ===================== Line Chart (Canvas) =====================
(function drawAlertTrend() {
  var canvas = document.getElementById('alertTrend');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 400, H = 220;
  canvas.width = W; canvas.height = H;
  var pad = { t: 20, r: 20, b: 30, l: 30 };
  var cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  var days = ['周一', '周二', '周三', '周四', '周五'];
  var redData  = [2, 1, 3, 2, 2];
  var yellowData = [5, 4, 6, 5, 6];
  var maxVal = 10;

  // Grid lines
  ctx.strokeStyle = '#EEE'; ctx.lineWidth = 1;
  for (var i = 0; i <= 4; i++) {
    var y = pad.t + (ch / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#999'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(maxVal - (maxVal / 4) * i, pad.l - 4, y + 3);
  }

  // Draw lines
  var drawLine = function(data, color, label) {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath();
    data.forEach(function(v, i) {
      var x = pad.l + (cw / (days.length - 1)) * i;
      var y = pad.t + ch - (v / maxVal) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Dots
    data.forEach(function(v, i) {
      var x = pad.l + (cw / (days.length - 1)) * i;
      var y = pad.t + ch - (v / maxVal) * ch;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    // X labels
    days.forEach(function(d, i) {
      var x = pad.l + (cw / (days.length - 1)) * i;
      ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(d, x, H - 6);
    });
  };

  drawLine(redData, '#C0392B');
  drawLine(yellowData, '#F39C12');

  // Legend
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#C0392B'; ctx.fillRect(W - 80, 6, 12, 3);
  ctx.fillStyle = '#333'; ctx.textAlign = 'left'; ctx.fillText('红灯', W - 64, 10);
  ctx.fillStyle = '#F39C12'; ctx.fillRect(W - 80, 20, 12, 3);
  ctx.fillStyle = '#333'; ctx.fillText('黄灯', W - 64, 24);
})();

// ===================== Simulated real-time updates =====================
var alertCounts = { red: 2, yellow: 6 };
setInterval(function() {
  alertCounts.red = Math.max(0, alertCounts.red + (Math.random() > 0.7 ? 1 : -1) * (Math.random() > 0.5 ? 1 : 0));
  alertCounts.yellow = Math.max(0, alertCounts.yellow + (Math.random() > 0.6 ? 1 : -1) * (Math.random() > 0.5 ? 1 : 0));
  document.getElementById('redCount').textContent = alertCounts.red;
  document.getElementById('yellowCount').textContent = alertCounts.yellow;
}, 5000);

// ===================== Mock Data (20 rows per table) =====================
function populateMockData() {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var i, d, sHtml, sH, st;
  var kwTbody = document.getElementById('kwBody');
  if (kwTbody) {
    var kws = '食品安全,消费维权,直播带货,虚假宣传,价格欺诈,广告违法,商标侵权,无证经营,卫生条件,超标排放,产品质量,售后服务,合同纠纷,预付卡消费,个人信息,保健品,医疗器械,教育培训,旅游服务,网络订餐'.split(',');
    var plats = '全平台,微博+抖音,抖音,微博,微信,快手,全平台,微博,抖音+快手,微信+微博,全平台,微博,抖音,微信,微博+抖音,快手,全平台,抖音,微博,全平台'.split(',');
    var scopes = '标题+正文+评论,标题+评论,标题+正文,标题,正文+评论,标题+正文+评论,标题+评论,标题,正文+评论,标题+正文,标题+正文+评论,标题,标题+正文,标题+评论,正文+评论,标题+正文,标题+正文+评论,标题+评论,标题,标题+正文'.split(',');
    kwTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      sHtml = i < 17 ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      d = new Date(2026, 3, 1 + i * 2);
      kwTbody.insertAdjacentHTML('beforeend', '<tr><td>' + kws[i] + '</td><td>' + plats[i] + '</td><td>' + scopes[i] + '</td><td>' + sHtml + '</td><td>' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'kwBody\',this,\'monitor\')">修改</button><button class="btn-sm btn-danger" onclick="deleteRow(\'kwBody\',this)">删除</button></td></tr>');
    }
  }

  var rTbody = document.getElementById('rosterBody');
  if (rTbody) {
    var types = '企业,主播,主播,主播,企业,主播,行业,企业,主播,企业,主播,主播,企业,行业,主播,企业,主播,行业,企业,主播'.split(',');
    var rNames = '辖区企业X,辖区主播A,辖区主播B,辖区主播C,辖区企业Y,辖区主播D,餐饮行业,辖区企业Z,辖区主播E,辖区企业W,辖区主播F,辖区主播G,辖区企业V,旅游行业,辖区主播H,辖区企业U,辖区主播I,教育行业,辖区企业T,辖区主播J'.split(',');
    var rPlats = '—,抖音,抖音,抖音,—,快手,全平台,—,抖音,—,微博,快手,—,全平台,抖音,—,微博,全平台,—,抖音'.split(',');
    var fans = '—,50万,120万,200万,—,80万,—,—,35万,—,150万,60万,—,—,90万,—,45万,—,—,300万'.split(',');
    var mcns = '—,MCN-XX,MCN-YY,MCN-ZZ,—,MCN-WW,—,—,MCN-VV,—,MCN-UU,MCN-TT,—,—,MCN-SS,—,MCN-RR,—,—,MCN-QQ'.split(',');
    var tColors = {企业:'#09607D',主播:'#E67E22',行业:'#8E44AD'};
    rTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      sH = i < 17 ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      d = new Date(2026, 3, 1 + i);
      rTbody.insertAdjacentHTML('beforeend', '<tr><td><span class="tag" style="background:' + tColors[types[i]] + ';color:#fff">' + types[i] + '</span></td><td>' + rNames[i] + '</td><td>' + rPlats[i] + '</td><td>' + fans[i] + '</td><td>' + mcns[i] + '</td><td>' + sH + '</td><td>' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'rosterBody\',this,\'roster\')">修改</button><button class="btn-sm btn-danger" onclick="deleteRow(\'rosterBody\',this)">删除</button></td></tr>');
    }
  }

  var scTbody = document.getElementById('scoreBody');
  if (scTbody) {
    var scoreDefs = [
      ['媒体覆盖度','0-20 分','媒体报道数量与级别','央媒 15-20 ｜ 地方 8-14 ｜ 无 0','启用'],
      ['传播扩散速度','0-20 分','社交平台传播趋势','1h 内 15-20 ｜ 数小时 8-14 ｜ 慢 0','启用'],
      ['情感负向程度','0-25 分','评论/转发情感分析','负面>60% 18-25 ｜ 30-60% 8-17 ｜ <30% 0','启用'],
      ['话题敏感等级','0-15 分','涉及敏感领域程度','高度 12-15 ｜ 一般 5-11 ｜ 普通 0','启用'],
      ['账号影响力','0-10 分','粉丝量级与历史影响','头部 8-10 ｜ 腰部 4-7 ｜ 尾部 0-3','启用'],
      ['区域关联度','0-10 分','与辖区关联程度','直接 8-10 ｜ 间接 4-7 ｜ 弱 0','停用'],
      ['舆情爆发力','0-15 分','事件传播峰值速度','爆发 12-15 ｜ 渐进 5-11 ｜ 平缓 0','启用'],
      ['舆论引导难度','0-10 分','舆论反转与引导成本','困难 8-10 ｜ 一般 4-7 ｜ 容易 0','启用'],
      ['利益相关方','0-10 分','涉及利益主体数量','多方 8-10 ｜ 少数 4-7 ｜ 单一 0','启用'],
      ['政策敏感度','0-15 分','与现行政策关联','直接违 12-15 ｜ 擦边 5-11 ｜ 无关 0','启用'],
      ['公众关注度','0-10 分','公众关注热度','热搜 8-10 ｜ 热门 4-7 ｜ 一般 0','启用'],
      ['媒体公信力','0-10 分','报道媒体权威程度','央媒 8-10 ｜ 地方 4-7 ｜ 自媒 0','启用'],
      ['跨域传播力','0-15 分','跨平台跨区域传播','全国 12-15 ｜ 全省 5-11 ｜ 本地 0','启用'],
      ['事件溯源难度','0-10 分','追溯事件源头难度','困难 8-10 ｜ 一般 4-7 ｜ 容易 0','停用'],
      ['应对紧迫性','0-10 分','需要响应的时间窗口','紧迫 8-10 ｜ 一般 4-7 ｜ 充裕 0','启用'],
      ['社会影响面','0-15 分','对社会秩序的影响','广泛 12-15 ｜ 局部 5-11 ｜ 个别 0','启用'],
      ['法律风险','0-15 分','可能引发的法律后果','重大 12-15 ｜ 一般 5-11 ｜ 轻微 0','启用'],
      ['经济损失评估','0-10 分','潜在经济损失规模','严重 8-10 ｜ 中等 4-7 ｜ 轻微 0','启用'],
      ['重复发生概率','0-10 分','类似事件再次发生可能','高频 8-10 ｜ 中频 4-7 ｜ 低频 0','启用'],
      ['国际影响','0-10 分','国际关注与影响','国际 8-10 ｜ 国内 4-7 ｜ 本地 0','停用']
    ];
    scTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      var sd = scoreDefs[i];
      sH = sd[4] === '启用' ? '<span class="tag good">启用</span>' : '<span class="tag warn">停用</span>';
      var tog = sd[4] === '启用' ? '停用' : '启用';
      scTbody.insertAdjacentHTML('beforeend', '<tr><td>' + sd[0] + '</td><td>' + sd[1] + '</td><td>' + sd[2] + '</td><td>' + sd[3] + '</td><td>' + sH + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'scoreBody\',this,\'scoring\')">修改</button><button class="btn-sm" onclick="toggleRowStatus(this)">' + tog + '</button><button class="btn-sm btn-danger" onclick="deleteRow(\'scoreBody\',this)">删除</button></td></tr>');
    }
  }

  var aTbody = document.getElementById('alertResultBody');
  if (aTbody) {
    var aNames = '辖区主播A,辖区主播B,辖区企业X,辖区主播C,辖区企业Y,辖区主播D,辖区企业Z,辖区主播E,辖区企业W,辖区主播F,辖区主播G,辖区企业V,辖区主播H,辖区企业U,辖区主播I,辖区企业T,辖区主播J,辖区企业S,辖区主播K,辖区企业R'.split(',');
    var aTypes = '主播,主播,企业,主播,企业,主播,企业,主播,企业,主播,主播,企业,主播,企业,主播,企业,主播,企业,主播,企业'.split(',');
    var aScores = [
      [6,14,18,4,3,6],[15,16,20,14,8,8],[8,10,8,6,5,4],[2,3,5,2,2,1],
      [18,20,22,15,9,9],[10,12,14,8,6,5],[4,6,8,3,2,2],[14,15,18,12,7,7],
      [6,8,10,5,4,3],[12,14,16,10,7,6],[8,9,12,7,5,4],[16,18,20,13,8,8],
      [4,5,7,3,2,2],[10,11,14,8,6,5],[2,4,5,2,1,1],[12,13,16,10,7,6],
      [6,7,9,5,4,3],[14,15,18,11,8,7],[8,10,12,6,5,4],[10,12,15,9,6,5]
    ];
    aTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      var sc = aScores[i];
      var tot = sc[0]+sc[1]+sc[2]+sc[3]+sc[4]+sc[5];
      var rClass = tot >= 70 ? 'bad' : (tot >= 40 ? 'warn' : 'good');
      var rLbl = tot >= 70 ? '🔴 红灯' : (tot >= 40 ? '🟡 黄灯' : '🟢 绿灯');
      var tp = aTypes[i];
      var cl = tp === '企业' ? '#09607D' : '#E67E22';
      d = new Date(2026, 4, 11 - Math.floor(i/3), 10 - i%8, (30 + i*7) % 60);
      aTbody.insertAdjacentHTML('beforeend', '<tr><td>' + aNames[i] + '</td><td><span class="tag" style="background:' + cl + ';color:#fff">' + tp + '</span></td><td>' + sc[0] + '</td><td>' + sc[1] + '</td><td>' + sc[2] + '</td><td>' + sc[3] + '</td><td>' + sc[4] + '</td><td>' + sc[5] + '</td><td>' + tot + '</td><td><span class="tag ' + rClass + '">' + rLbl + '</span></td><td>' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</td><td class="action-cell"><button class="btn-sm" onclick="editRow(\'alertResultBody\',this,\'alerts\')">修改</button></td></tr>');
    }
  }

  var rpTbody = document.getElementById('reportListBody');
  if (rpTbody) {
    var rpScores = [81,51,41,15,93,42,24,68,33,55,47,82,26,50,18,63,35,71,44,56];
    var rKeywords = '食品安全,直播带货,消费维权,虚假宣传,价格欺诈,广告违法,商标侵权,无证经营,卫生条件,超标排放,产品质量,售后服务,合同纠纷,预付卡消费,个人信息,—,—,—,—,—'.split(',');
    rpTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      var ts = rpScores[i];
      var rc = ts >= 70 ? 'bad' : (ts >= 40 ? 'warn' : 'good');
      var rl = ts >= 70 ? '🔴 红灯' : (ts >= 40 ? '🟡 黄灯' : '🟢 绿灯');
      d = new Date(2026, 4, 11 - Math.floor(i/4), 9 + i%8, 15 + i*13 % 45);
      var rid = 'RPT-202605' + pad(11 - i%3) + '-' + pad(1 + Math.floor(i/3));
      rpTbody.insertAdjacentHTML('beforeend', '<tr><td>' + rid + '</td><td><span class="tag ' + rc + '">' + rl + '</span></td><td>' + aNames[i] + '</td><td>' + ts + ' 分</td><td>' + rKeywords[i] + '</td><td>' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</td><td class="action-cell"><button class="btn-sm" onclick="viewDetail(\'reportListBody\',this,\'reports\')">查看详情</button><button class="btn-sm" onclick="editRow(\'reportListBody\',this,\'reports\')">修改</button></td></tr>');
    }
  }

  var tpTbody = document.getElementById('trackingPendingBody');
  if (tpTbody) {
    tpTbody.innerHTML = '';
    var pending = [
      ['AL-20260511-02','warn','🟡 黄灯','辖区主播A',51,'pending','待处理','查看','分配处理'],
      ['AL-20260511-01','bad','🔴 红灯','辖区主播B',81,'processing','处理中','查看','办结']
    ];
    for (i = 0; i < pending.length; i++) {
      var t = pending[i];
      var btn2 = t[8] === '办结' ? '<button class="btn-sm" style="border-color:#27AE60;color:#27AE60" onclick="alert(\'已办结\')">办结</button>' : '<button class="btn-sm" style="border-color:#09607D;color:#09607D" onclick="alert(\'已分配\')">分配处理</button>';
      tpTbody.insertAdjacentHTML('beforeend', '<tr><td>' + t[0] + '</td><td><span class="tag ' + t[1] + '">' + t[2] + '</span></td><td>' + t[3] + '</td><td>' + t[4] + '</td><td><span class="status-pill ' + t[5] + '">' + t[6] + '</span></td><td class="action-cell"><button class="btn-sm" onclick="viewDetailSimple(\'告警ID: ' + t[0] + '\\n对象: ' + t[3] + '\\n总分: ' + t[4] + '\\n处置状态: ' + t[6] + '\')">' + t[7] + '</button>' + btn2 + '</td></tr>');
    }
  }

  var trFTbody = document.getElementById('trackingFullBody');
  if (trFTbody) {
    trFTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      var day = 11 - Math.floor(i/5);
      var hour = (9 + i * 3) % 24;
      var trScore = aScores[i] ? aScores[i][0]+aScores[i][1]+aScores[i][2]+aScores[i][3]+aScores[i][4]+aScores[i][5] : 30 + i*3;
      var trTag = trScore >= 70 ? 'bad' : (trScore >= 40 ? 'warn' : 'good');
      var trColor = trScore >= 70 ? '🔴 红灯' : (trScore >= 40 ? '🟡 黄灯' : '🟢 绿灯');
      var stCls, stLbl, person, tm;
      if (i < 2) { stCls = 'processing'; stLbl = '处理中'; person = '张三'; tm = '2026-05-' + pad(day) + ' ' + pad(hour) + ':' + pad((i*17)%60); }
      else if (i < 4) { stCls = 'pending'; stLbl = '待处理'; person = '—'; tm = '—'; }
      else if (i < 12) { stCls = 'done'; stLbl = '已办结'; person = i%3===0?'李四':(i%3===1?'王五':'赵六'); tm = '2026-05-' + pad(day) + ' ' + pad(hour) + ':' + pad((i*17)%60); }
      else { stCls = 'archived'; stLbl = '已归档'; person = '钱七'; tm = '2026-05-' + pad(day) + ' ' + pad(hour) + ':' + pad((i*17)%60); }
      var extra = '';
      if (stCls === 'pending') extra = '<button class="btn-sm" style="border-color:#09607D;color:#09607D" onclick="alert(\'已分配\')">分配</button>';
      else if (stCls === 'processing') extra = '<button class="btn-sm" style="border-color:#27AE60;color:#27AE60" onclick="alert(\'已办结\')">办结</button>';
      trFTbody.insertAdjacentHTML('beforeend', '<tr><td>AL-202605' + pad(day) + '-' + pad(i+1) + '</td><td><span class="tag ' + trTag + '">' + trColor + '</span></td><td>' + aNames[i] + '</td><td>' + trScore + '</td><td><span class="status-pill ' + stCls + '">' + stLbl + '</span></td><td>' + person + '</td><td>' + tm + '</td><td class="action-cell"><button class="btn-sm" onclick="viewDetailSimple(\'告警ID: AL-202605' + pad(day) + '-' + pad(i+1) + '\\n对象: ' + aNames[i] + '\\n总分: ' + trScore + '\\n状态: ' + stLbl + '\\n责任人: ' + person + '\')">查看</button>' + extra + '</td></tr>');
    }
  }

  var arcTbody = document.getElementById('archiveListBody');
  if (arcTbody) {
    var arcEvents = '辖区主播B直播带货消费投诉,辖区企业X产品宣传争议,辖区主播C新品发布会正面传播,辖区企业Y广告违法被查处,辖区主播D价格欺诈事件,辖区企业Z无证经营整改,辖区主播E卫生条件不达标,辖区企业W合同纠纷调解,辖区主播F售后维权事件,辖区企业V超标排放通报,辖区主播G商标侵权诉讼,辖区企业U虚假宣传被罚,辖区主播H产品质量投诉,辖区企业T预付卡消费纠纷,辖区主播I个人信息泄露,辖区企业S保健品违规营销,辖区主播K直播售假事件,辖区企业R医疗器械事故,辖区主播J教育培训投诉,辖区企业Q旅游服务纠纷'.split(',');
    var arcRatings = 'bad,warn,good,bad,warn,warn,bad,warn,good,bad,warn,bad,warn,good,bad,warn,bad,warn,good,warn'.split(',');
    var arcLabels = '🔴 红灯,🟡 黄灯,🟢 绿灯,🔴 红灯,🟡 黄灯,🟡 黄灯,🔴 红灯,🟡 黄灯,🟢 绿灯,🔴 红灯,🟡 黄灯,🔴 红灯,🟡 黄灯,🟢 绿灯,🔴 红灯,🟡 黄灯,🔴 红灯,🟡 黄灯,🟢 绿灯,🟡 黄灯'.split(',');
    var arcObjs = '辖区主播B,辖区企业X,辖区主播C,辖区企业Y,辖区主播D,辖区企业Z,辖区主播E,辖区企业W,辖区主播F,辖区企业V,辖区主播G,辖区企业U,辖区主播H,辖区企业T,辖区主播I,辖区企业S,辖区主播K,辖区企业R,辖区主播J,辖区企业Q'.split(',');
    arcTbody.innerHTML = '';
    for (i = 0; i < 20; i++) {
      var isDone = i < 14;
      var sc2 = isDone ? 'done' : 'pending';
      var sl2 = isDone ? '已归档' : '未归档';
      var ad = new Date(2026, 4, 7 - i);
      var aid = 'ARC-202605' + pad(7 - i);
      var abtn = isDone ? '' : '<button class="btn-sm" onclick="archiveRow(this)">归档</button>';
      var atime = isDone ? ad.getFullYear() + '-' + pad(ad.getMonth()+1) + '-' + pad(ad.getDate()) : '—';
      arcTbody.insertAdjacentHTML('beforeend', '<tr><td>' + aid + '</td><td>' + arcEvents[i] + '</td><td><span class="tag ' + arcRatings[i] + '">' + arcLabels[i] + '</span></td><td>' + arcObjs[i] + '</td><td>' + atime + '</td><td><span class="status-pill ' + sc2 + '">' + sl2 + '</span></td><td class="action-cell">' + abtn + '<button class="btn-sm" onclick="viewDetail(\'archiveListBody\',this,\'archive\')">查看详情</button></td></tr>');
    }
  }
}

populateMockData();
