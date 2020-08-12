function updateGenre(genreID) {
    let text = $("#row" + genreID + " > td:first");
    text.replaceWith('<td><input type="text" id="text' + genreID + '" name="title" value="' + text.text() + '" /></td>');
    let button = $("#row" + genreID + " > td:last > div:first > button:last");
    button.text("Save");
    button.attr('onclick', 'saveGenre(' + genreID + ', false)');
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
    let url = isNew ? "/genres" : "/genres/" + genreID;
    req.open(isNew ? "POST" : "PUT", url, true);
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
    req.open("DELETE", "/genres/" + genreID, true);
    req.send();
}

function addGenre() {
    let newRow = $("#genreTable > tbody:first > tr:first").clone(true);
    newRow.attr('id', 'rowNew');
    $('#genreTable > tbody:first > tr:last').after(newRow);
    let button = $("#rowNew > td:last > div:first > button:last");
    button.text("Save");
    button.attr('onclick', 'saveGenre("New", true)');
    let text = $("#rowNew > td:first");
    text.replaceWith('<td><input type="text" id="textNew" name="title" value=""></td>');
    let form = $("#rowNew > form:first");
    form.attr('id', 'formNew');
}

$(document).ready(function(){
    $("#searchGenres").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#genreTable tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});