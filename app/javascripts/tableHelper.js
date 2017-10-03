var tableHelpers={
  createDataCell: function(content){
    var cell = document.createElement("td");
    cell.textContent = content;
    return cell;
  },

  createHeaderCell: function(content){
    var cell = document.createElement("th");
    cell.textContent = content;
    return cell;
  },

  addDataRow: function(table, columnList){
    var row = document.createElement("tr");
    columnList.map(this.createDataCell).forEach((cell) => {
      row.appendChild(cell);
    })
    table.appendChild(row);
  },

  addHeaderRow: function(table, columnHeaderList){
    var row = document.createElement("tr");
    columnHeaderList.map(this.createHeaderCell).forEach((cell) => {
      row.appendChild(cell);
    })
    table.appendChild(row);
  },

  limitRows: function(table, maxRows){
    if(table.rows.length > maxRows + 1){
      table.deleteRow(1);
    }
  }
};

module.exports = tableHelpers;
