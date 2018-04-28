// pubminer.js
//
// JavaScript to support pubminer UI results page

// expand the row and fill with content from the backend
// code adapted from samples on PatternFly.org
$.fn.addArrowClickHandler = function() {
    this.click(function(event){
        if(!$(event.target).is("button, a, input, .fa-ellipsis-v")){
            $(this).find(".fa-angle-right").toggleClass("fa-angle-down")
            .end().parent().toggleClass("list-view-pf-expand-active")
            .find(".list-group-item-container").toggleClass("hidden");

            if($(this).find(".fa-angle-down").length > 0) {
                let expansionBody = $(this).closest("div.list-group-item").find("div.expansion-body");
                let uidValue = $(this).closest("div.list-group-item").find("input.uid").val();
                // Get the content from back end and append to the expansion area div
                $.get('/detail/' + uidValue, null, function(response) {
                    expansionBody.html(response);
                });
            }
        } else {
        }
    });
};

// close the expanded row
// code adapted from samples on PatternFly.org
$.fn.addCloseRowHandler = function() {
    this.on("click", function (){
        $(this).parent().addClass("hidden")
        .parent().removeClass("list-view-pf-expand-active")
        .find(".fa-angle-right").removeClass("fa-angle-down");
    });
};

// add styling to rows that have been check-selected
// code adapted from samples on PatternFly.org
$.fn.addRowCheckboxHandler = function() {
    this.change(function (e) {
        if ($(this).is(":checked")) {
            $(this).closest('.list-group-item').addClass("active");
        } else {
            $(this).closest('.list-group-item').removeClass("active");
        }
    });
};

$(document).ready(function() {

    $(".selectpicker").selectpicker();

    $("form").submit(function() {
        $("#searchForm button[type='submit']").prop("disabled", true);
        $(".pm-message-area").toggleClass("hidden");
        $(".search-loading").toggleClass("hidden");
    });

    $("#pm-datatable-whatsnew").DataTable({
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

    // Click handler for Select All
    $("#selectAllMenuItem").click(function(){
        $("input.uid").each(function(){
            $(this).prop('checked', true);
        });
    });

    // Click handler for Unselect All
    $("#unSelectAllMenuItem").click(function(){
        $("input.uid:checked").each(function(){
            $(this).prop('checked', false);
        });
    });

    // Click handler for Export button
    $("#exportMenuItem").click(function(){
        if ($("input.uid:checked").length > 0) {
            var searchTerm = $("#termSearched").val();
            var idsToExport = `"search term","pmid","pmcid","title","sentences","table1"`;
            $("input.uid:checked").each(function(){
                let id = $(this).val();
                let pmcid = $(this).closest(".list-group-item").find("input.pmcid").val();
                if (!pmcid) {
                    pmcid = "";
                }
                let title = $(this).closest(".list-group-item-header").find(".article-title").text();
                let sentences = $(this).closest(".list-group-item").find(".demo-sentence-section").length > 0 ? "Yes" : "No";
                let table1 = $(this).closest(".list-group-item").find(".pm-table1").length > 0 ? "Yes" : "No";
                idsToExport += `,\n"${searchTerm}",${id},${pmcid},"${title}",${sentences},${table1}`;
                $(this).prop('checked', false);
            });

            // Code adapted from:
            // https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
            var blob = new Blob([idsToExport], {type: 'text/csv;charset=utf8'});
            var fileName = "pm_export_" + Date.now() + ".csv";
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                // Create a new anchor tag element
                var elem = window.document.createElement('a');
                elem.href = window.URL.createObjectURL(blob);
                elem.download = fileName;
                // Append the anchor to the document
                document.body.appendChild(elem);
                // Click it
                elem.click();
                // Remove it from the document
                document.body.removeChild(elem);
            }
        }
    });

    // the next three function calls add handlers to the rows initially displayed.

    // row checkbox selection
    $("input[type='checkbox']").addRowCheckboxHandler();

    // click the list-view heading then expand a row
    $(".list-group-item-header").addArrowClickHandler();

    // click the close button, hide the expand row and remove the active status
    $(".list-group-item-container .close").addCloseRowHandler();

    // handle new rows added to display
    $("#moreButton").click(function() {

        let params = { start: $("#itemsLoaded").val()};

        $.get('/results/' + $("#webenv").val() + '/' + $("#querykey").val(),
            params, function(response) {

                let newRows = $.parseHTML(response)

                // add handlers to the new rows

                // row checkbox selection
                $(newRows).find("input[type='checkbox']").addRowCheckboxHandler();

                // click the list-view heading then expand a row
                $(newRows).find(".list-group-item-header").addArrowClickHandler();

                // click the close button, hide the expand row and remove the active status
                $(newRows).find(".list-group-item-container .close").addCloseRowHandler();

                // add the rows to the page
                $("#resultRows").append(newRows);

                // bump up the counter for more rows
                let itemsLoaded = parseInt($("#itemsLoaded").val(), 10) + newRows.length;
                $("#itemsLoaded").val(itemsLoaded);

                // if we've gotten all the rows, hide the Show More button.
                let totalItems = parseInt($("#totalItems").val(), 10);
                if (itemsLoaded == totalItems) {
                    $("#moreButton").hide();
                }

                // update the banner
                let searchTerm = $("#termSearched").val();
                $(".results-summary").text(`Displaying ${itemsLoaded} of ${totalItems} results found for "${searchTerm}"`)
            });

    });

    // hide the Show More button if there are no more rows to get
    let itemsLoaded = parseInt($("#itemsLoaded").val(), 10);
    let totalItems = parseInt($("#totalItems").val(), 10);
    if (itemsLoaded == totalItems) {
        $("#moreButton").hide();
    }

});
