url = String(window.location.href);
document.getElementById("theatreSubmit").addEventListener("click", addNewTheatre);

function add(data) {
    let table = document.getElementById("theatreTable").lastElementChild;
    let newRow = document.createElement("tr");

    let dataLength = data["rows"].length - 1;
    let newData = data["rows"][dataLength];
    newRow.setAttribute("id", "row" + String(newData["theatreID"]));
    for (i = 1; i < 4; i++) {
        let newCol = document.createElement("td");
        let values = Object.values(newData);
        newCol.innerHTML = String(values[i]);
        newRow.appendChild(newCol);
    }
    let buttonCol = document.createElement("td");
    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "d-flex flex-row-reverse");
    let newDelete = document.createElement("button");
    let newUpdate = document.createElement("button");
    newDelete.setAttribute("class", "btn btn-secondary");
    newDelete.setAttribute("onclick", "deleteTheatre(" + String(newData["theatreID"] + ")"));
    newDelete.innerHTML = "Delete";
    newUpdate.setAttribute("class", "btn btn-primary mx-2");
    newUpdate.setAttribute("onclick", "updateTheatre(" + String(newData["theatreID"] + ")"));
    newUpdate.innerHTML = "Update";
    buttonDiv.appendChild(newDelete);
    buttonDiv.appendChild(newUpdate);
    buttonCol.appendChild(buttonDiv);
    newRow.appendChild(buttonCol);

    table.appendChild(newRow);
}

function addNewTheatre() {
    document.getElementById("addTheatreForm").checkValidity();
    if (document.getElementById("addTheatreForm").reportValidity() == false) {
        return;
    }
    let req = new XMLHttpRequest();
    let payload = {name:null, city:null, state:null};
    payload.name = document.getElementById("theatreName").value;
    payload.city = document.getElementById("theatreCity").value;
    payload.state = document.getElementById("theatreState").value;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            add(data);
            document.getElementById("addTheatreForm").reset();
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function deleteTheatre(ID) {
    var row = document.getElementById("row" + ID);
    let req = new XMLHttpRequest();
    let payload = {theatreID:null};
    payload.theatreID = ID;
    req.open("DELETE", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function () {
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

function updateTheatre(ID) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    for (i = 0; i < 3; i++) {
        let textbox = document.createElement("input");
        textbox.setAttribute("type", "text");
        textbox.setAttribute("value", currCol.textContent);
        currCol.textContent = "";
        currCol.appendChild(textbox);
        currCol = currCol.nextElementSibling;
    }
    var button = row.lastElementChild.firstElementChild.lastElementChild;
    button.innerText = "Save";
    button.onclick = function(){saveTheatre(ID)};
}

function saveTheatre(ID) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    if (currCol.firstElementChild.value == "") {
            return;
        }
    if (currCol.nextElementSibling.firstElementChild.value == "") {
            return;
        }
    if (currCol.nextElementSibling.nextElementSibling.firstElementChild.value == "") {
            return;
        }
    for (i = 0; i < 3; i++) {
        let child = currCol.firstElementChild;
        let text = currCol.firstElementChild.value;
        currCol.removeChild(child);
        currCol.textContent = text;
        currCol = currCol.nextElementSibling;
    }
    let req = new XMLHttpRequest();
    let name = row.firstElementChild;
    let city = row.firstElementChild.nextElementSibling;
    let state = row.firstElementChild.nextElementSibling.nextElementSibling;
    let theatreID = String(row.getAttribute("id")).slice(3, 6);
    let payload = {name:null, city:null, state:null, theatreID:null};
    payload.name = name.textContent;
    payload.city = city.textContent;
    payload.state = state.textContent;
    payload.theatreID = theatreID;

    req.open("PUT", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            var button = row.lastElementChild.firstElementChild.lastElementChild;
            button.innerText = "Update";
            button.onclick = function(){updateTheatre(ID)};
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

$(document).ready(function(){
    $("#searchTheatres").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#theatreTableBody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});