function getAge(dobString){
    if(dobString == null) {
        return "Unknown";
    }
    let dob = moment(dobString);
    let now = moment().local();
    let age = moment.duration(now.diff(dob));
    return Math.floor(age.asYears());
}
function updateActor(actorID) {
    let values = { firstName: null, lastName: null, dob: null };
    let index = 0;
    $.each(values, function(key, value) {
        let text = $('#row' + actorID + ' > td:eq(' + index + ')');
        if(key === 'dob') {
            let hidden = $('#row' + actorID + ' > td:last > div:first > input:first');
            text.replaceWith('<td><input type="date" id="text' + actorID + '" name="' + key + '" value="' + hidden.val() + '" data-toggle="tooltip" title="DOB" /></td>');
        } else {
            text.replaceWith('<td><input type="text" id="text' + actorID + '" name="' + key + '" value="' + text.text() + '" /></td>');
        }
        index++;
    });
    let button = $('#row' + actorID + ' > td:last > div:first > button:last');
    button.text('Save');
    button.attr('onclick', 'saveActor(' + actorID + ', false)');
}

function saveActor(actorID, isNew) {
    let row = $("#row" + actorID);
    let values = { firstName: null, lastName: null, dob: null };
    let index = 0;
    let body = "";
    $.each(values, function(key, value) {
        let textBox = $('#row' + actorID + ' > td:eq(' + index + ') > input:first');
        values[key] = textBox.val();
        body += key + "=" + textBox.val() + "&";
        index++;
    });
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let res = JSON.parse(req.responseText);
            if(isNew) {
                let button2 = $('#row' + actorID + ' > td:last > div:first > button:first');
                actorID = res.id;
                button2.attr('onclick', 'deleteActor(' + actorID + ')');
            }
            row.attr('id', 'row' + actorID);
            let index = 0;
            $.each(values, function(key, value) {
                let textBox = $('#row' + actorID + ' > td:eq(' + index + ') > input:first');
                if(key === 'dob') {
                    textBox.replaceWith(getAge(value));
                    let hidden = $('#row' + actorID + ' > td:last > div:first > input:first');
                    hidden.val(value);
                }
                textBox.replaceWith(value);
                index++;
            });
            let button = $('#row' + actorID + ' > td:last > div:first > button:last');
            button.text('Update');
            button.attr('onclick', 'updateActor(' + actorID + ')');
        }
    };
    let url = isNew ? "/actors" : "/actors/" + actorID;
    req.open(isNew ? "POST" : "PUT", url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(body.slice(0,body.length-1));
}

function deleteActor(actorID) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            $("#row" + actorID).remove();
        }
    };
    req.open("DELETE", "/actors/" + actorID, true);
    req.send();
}

function addActor() {
    let newRow = $("#actorTable > tbody:first > tr:first").clone(true);
    newRow.attr('id', 'rowNew');
    $('#actorTable > tbody:first > tr:last').after(newRow);
    let button = $("#rowNew > td:last > div:first > button:last");
    button.text("Save");
    button.attr('onclick', 'saveActor("New", true)');
    let arr = ['firstName', 'lastName', 'dob'];
    $.each(arr, function(index, value) {
        let text = $('#rowNew > td:eq(' + index + ') ');
        if(value === 'dob') {
            text.replaceWith('<td><input type="date" id="textNew' + index.toString() + '" name="' + value + '" value="" data-toggle="tooltip" title="DOB" /></td>');
        } else {
            text.replaceWith('<td><input type="text" id="textNew' + index.toString() + '" name="' + value + '" value="" /></td>');
        }
    });
    let form = $("#rowNew > form:first");
    form.attr('id', 'formNew');
}

$(document).ready(function(){
    $("#searchActors").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#actorTable tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});