url = String(window.location.href);
document.getElementById("tmSubmit").addEventListener("click", addNewTM);

function add(data) {
    let table = document.getElementById("tmTable");
    let tableBody = document.getElementById("tmTableBody");
    table.removeChild(tableBody);
    let newTableBody = document.createElement("tbody");
    newTableBody.setAttribute("id", "tmTableBody");

    for (i = 0; i < data["rows"].length; i++) {
        let newRow = document.createElement("tr");
        newRow.setAttribute("id", String(data["rows"][i].theatreID + ", " + String(data["rows"][i].movieID)));
        let theatreNameTD = document.createElement("td");
        theatreNameTD.innerHTML = data["rows"][i].tname;
        let movieNameTD = document.createElement("td");
        movieNameTD.innerHTML = data["rows"][i].mname;
        newRow.appendChild(theatreNameTD);
        newRow.appendChild(movieNameTD);

        let buttonTD = document.createElement("td");
        let buttonDiv = document.createElement("div");
        buttonDiv.setAttribute("class", "d-flex flex-row-reverse");
        let deleteButton = document.createElement("button");
        let updateButton = document.createElement("button");
        deleteButton.setAttribute("class", "btn btn-secondary");
        deleteButton.setAttribute("onclick", "deleteTM(" + String(data["rows"][i].theatreID) + ", " + String(data["rows"][i].movieID) + ")");
        deleteButton.innerHTML = "Delete";
        updateButton.setAttribute("class", "btn btn-primary mx-2");
        updateButton.setAttribute("onclick", "updateTM(" + String(data["rows"][i].theatreID) + ", " + String(data["rows"][i].movieID) + ")");
        updateButton.innerHTML = "Update";

        buttonDiv.appendChild(deleteButton);
        buttonDiv.appendChild(updateButton);
        buttonTD.appendChild(buttonDiv);
        newRow.appendChild(buttonTD);

        newTableBody.appendChild(newRow);
    }
    table.appendChild(newTableBody);
}

function addNewTM() {
    document.getElementById("tmAddForm").checkValidity();
    if (document.getElementById("tmAddForm").reportValidity() == false) {
        return;
    }
    let req = new XMLHttpRequest();
    let payload = {theatreID:null, movieID:null};
    payload.theatreID = document.getElementById("tmTheatreName").value;
    payload.movieID = document.getElementById("tmMovieName").value;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            add(data);
            document.getElementById("tmAddForm").reset();
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function deleteTM(theatreID, movieID) {
    let row = document.getElementById(String(theatreID) + ", " + String(movieID));
    let req = new XMLHttpRequest();
    let payload = {theatreID:null, movieID:null};
    payload.theatreID = theatreID;
    payload.movieID = movieID;
    req.open("DELETE", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            row.remove();
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function updateTM(theatreID, movieID) {
    let row = document.getElementById(String(theatreID) + ", " + String(movieID));
    var currCol = row.firstElementChild;
    for (i = 0; i < 2; i++) {
        if (i == 0) {
            let theatreInput = document.getElementById("tmTheatreName").cloneNode(true);
            theatreInput.setAttribute("id", "");
            theatreInput.firstElementChild.setAttribute("selected", "false");
            loop1:
            for (j = 0; j < theatreInput.length; j++) {
                if (theatreInput[j].value == theatreID) {
                    theatreInput[j].setAttribute("selected", "true");
                    break loop1;
                }
            }
            currCol.innerHTML = "";
            currCol.appendChild(theatreInput);
            currCol = currCol.nextElementSibling;
        } else {
            let movieInput = document.getElementById("tmMovieName").cloneNode(true);
            movieInput.setAttribute("id", "");
            movieInput.firstElementChild.setAttribute("selected", "false");
            loop2:
            for (k = 0; k < movieInput.length; k++) {
                if (movieInput[k].value == movieID) {
                    movieInput[k].setAttribute("selected", "true");
                    break loop2;
                }
            }
            currCol.innerHTML = "";
            currCol.appendChild(movieInput);
            currCol = currCol.nextElementSibling;
        }
    }
    var button = row.lastElementChild.firstElementChild.lastElementChild;
    button.innerText = "Save";
    button.onclick = function(){saveTM(theatreID, movieID)};
}

function saveTM(theatreID, movieID) {
    let row = document.getElementById(String(theatreID) + ", " + String(movieID));
    var currCol = row.firstElementChild;
    var value1 = null;
    var value2 = null;
    if (currCol.firstElementChild.value == "") {
        return;
    }
    if (currCol.nextElementSibling.firstElementChild.value == "") {
        return;
    }
    for (i = 0; i < 2; i++) {
        let child = currCol.firstElementChild;
        let text = null;
        for (j = 0; j < child.length; j++) {
            if (child[j].selected == true) {
                text = child[j].dataset.name;
                if (value1 == null) {
                    value1 = child[j].value;
                } else {
                    value2 = child[j].value;
                }
            }
        }
        currCol.removeChild(child);
        currCol.textContent = text;
        currCol = currCol.nextElementSibling;
    }
    row.setAttribute("id", String(value1) + ", " + String(value2));
    let req = new XMLHttpRequest();
    let payload = {theatreID:null, movieID:null, oldtheatreID:null, oldmovieID:null};
    payload.theatreID = value1;
    payload.movieID = value2;
    payload.oldtheatreID = theatreID;
    payload.oldmovieID = movieID;
    req.open("PUT", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            add(data);
            var button = row.lastElementChild.firstElementChild.lastElementChild;
            button.innerText = "Update";
            button.onclick = function(){updateTM(value1, value2)};
        } else {
            console.log("Error in network request: " + req.statusText);
            location.reload();
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

$(document).ready(function(){
    $("#searchTM").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#tmTableBody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});