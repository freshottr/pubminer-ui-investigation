$(document).ready(function() {

    $("#table1").DataTable({
        columns: [
            {data: "pmcid"},
            {data: "title"}
        ],
        ajax: 'data/wndata.json',
        dom: 't',
        language: {
            zeroRecords: "No records found"
        }
    });

    $('.datatable').dataTable();

});
