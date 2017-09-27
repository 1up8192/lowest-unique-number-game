function createDataCell(content){
  var cell = document.createElement("td");
  cell.textContent = content;
  return cell;
}

function createHeaderCell(content){
  var cell = document.createElement("th");
  cell.textContent = content;
  return cell;
}

function addDataRow(table, columnList){
  var row = document.createElement("tr");
  columnList.map(createDataCell).forEach((cell) => {
    row.appendChild(cell);
  })
  table.appendChild(row);
}

function addHeaderRow(table, columnHeaderList){
  var row = document.createElement("tr");
  columnHeaderList.map(createHeaderCell).forEach((cell) => {
    row.appendChild(cell);
  })
  table.appendChild(row);
}

function limitRows(table, maxRows){
  if(table.rows.length > maxRows + 1){
    table.deleteRow(1);
  }
}
