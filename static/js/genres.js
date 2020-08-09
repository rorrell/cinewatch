function updateGenre(genreID) {
    let text = $("#row" + genreID + " > td:first");
    text.replaceWith('<td><input type="text" id="text' + genreID + '" name="title" value="' + text.text() + '" /></td>');
    let updateButton = $("#row" + genreID + " > td:last > div:first > button:last");
    updateButton.text("Save");
    updateButton.attr('onclick', 'saveGenre(' + genreID + ', false)');
    let viewButton = $('#row' + genreID + ' > td:eq(1) > button:first');
    viewButton.text("Edit");
    viewButton.removeData('mode');
    viewButton.attr('data-mode', 'edit');
}

function saveGenre(genreID, isNew) {
    let row = $("#row" + genreID);
    let textBox = $("#row" + genreID + " > td:first > input:first");
    let text = textBox.val();
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let res = JSON.parse(req.responseText);
            if (isNew) {
                let button2 = $("#row" + genreID + " > td:last > div:first > button:first");
                genreID = res.id;
                button2.attr('onclick', 'deleteGenre(' + genreID + ')');
            }
            row.attr('id', 'row' + genreID);
            textBox.replaceWith(text);
            let button = $("#row" + genreID + " > td:last > div:first > button:last");
            button.text("Update");
            button.attr('onclick', 'updateGenre(' + genreID + ')');
        }
    };
    let url = isNew ? "/genres" : "/genres/update/" + genreID;
    req.open("POST", url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let body = isNew ? "textNew=" + text : "title=" + text;
    req.send(body);
}

function deleteGenre(genreID) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            $("#row" + genreID).remove();
        }
    };
    req.open("GET", "/genres/delete/" + genreID, true);
    req.send();
}

$(document).ready(function(){
    $("#searchGenres").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        $("#genreTable tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $('#movieModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget);
        let movieList = button.data('movies');
        let mode = button.data('mode');
        let modal = $(this);
        let select = modal.find('#movieSelect');
        if(mode === 'view') {
            let list = '<ul>';
            for (let movie of movieList.split(",")) {
                list += '<li>' + movie + '</li>';
            }
            list += '</ul>'
            modal.find('#modalParagraph').html(list);
            select.attr('hidden', true);
        } else if(mode === 'edit') {
            let movieIDs = button.data('movieids');
            for (let movie of movieIDs.split(",")) {
                $('#movieModal select option[value=' + movie + ']').attr('selected', 'selected');
            }
            select.attr('hidden', false);
        }
    });
});