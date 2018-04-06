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
        },
        initComplete: function() {
            var rowCount = this.api().$('tbody tr').length;
            $("#update-count").text(rowCount + " new articles added")
        }
    });
});
