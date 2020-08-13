url = String(window.location.href);
document.getElementById("awardSubmit").addEventListener("click", addNewAward);

function add(data) {
    let table = document.getElementById("awardTable").lastElementChild;
    let newRow = document.createElement("tr");

    let dataLength = data["rows"].length - 1;
    let newData = data["rows"][dataLength];
    newRow.setAttribute("id", "row" + String(newData["awardID"]));
    for (i = 1; i < 5; i++) {
        let newCol = document.createElement("td");
        let values = Object.values(newData);
        if (i == 4) {
            if (String(values[i]) == "null") {
                newCol.innerHTML = "";
                newRow.appendChild(newCol);
            } else {
                let movieSelection = document.getElementById("movieForAward");
                let option = movieSelection.firstElementChild;
                for (j = 0; j < movieSelection.length; j++) {
                    if (String(values[i]) == option.value) {
                        newCol.innerHTML = option.dataset.name;
                        newRow.appendChild(newCol);
                        break;
                    }
                    option = option.nextElementSibling;
                }
            }
        } else {
            newCol.innerHTML = String(values[i]);
            newRow.appendChild(newCol);
        }
    }
    let newCol = document.createElement("td");
    newCol.setAttribute("style", "display:none;");
    newCol.innerHTML = String(newData["movieID"]);
    newRow.appendChild(newCol);

    let buttonCol = document.createElement("td");
    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "d-flex flex-row-reverse");
    let newDelete = document.createElement("button");
    let newUpdate = document.createElement("button");
    newDelete.setAttribute("class", "btn btn-secondary");
    newDelete.setAttribute("onclick", "deleteAward(" + String(newData["awardID"] + ")"));
    newDelete.innerHTML = "Delete";
    newUpdate.setAttribute("class", "btn btn-primary mx-2");
    newUpdate.setAttribute("onclick", "updateAward(" + String(newData["awardID"] + ")"));
    newUpdate.innerHTML = "Update";
    buttonDiv.appendChild(newDelete);
    buttonDiv.appendChild(newUpdate);
    buttonCol.appendChild(buttonDiv);
    newRow.appendChild(buttonCol);

    table.appendChild(newRow);
}

function addNewAward() {
    document.getElementById("addAwardForm").checkValidity();
    if (document.getElementById("addAwardForm").reportValidity() == false) {
        return;
    }
    let req = new XMLHttpRequest();
    let payload = {company:null, category:null, yearAwarded:null, movieID:null};
    payload.company = document.getElementById("awardCompany").value;
    payload.category = document.getElementById("awardCategory").value;
    payload.yearAwarded = document.getElementById("yearAwarded").value;
    payload.movieID = document.getElementById("movieForAward").value;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            add(data);
            document.getElementById("addAwardForm").reset();
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function deleteAward(ID) {
    var row = document.getElementById("row" + ID);
    let req = new XMLHttpRequest();
    let payload = {awardID:null};
    payload.awardID = ID;
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

function updateAward(ID) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    var movieSelection = document.getElementById("movieForAward").cloneNode(true);
    movieSelection.removeAttribute("id");
    movieSelection.firstElementChild.setAttribute("selected", "false");
    for (i = 0; i < 4; i++) {
        if (i == 3) {
            let movieField = row.lastElementChild.previousElementSibling.previousElementSibling;
            if (movieField.innerHTML == "") {
                movieField.appendChild(movieSelection);
                currCol = currCol.nextElementSibling;
            } else {
                let movieIdentifier = String(row.lastElementChild.previousElementSibling.innerHTML);
                let movieCounter = movieSelection.firstElementChild;
                for (j = 0; j < movieSelection.length; j++) {
                    if (movieCounter.value == movieIdentifier) {
                        movieCounter.setAttribute("selected", "true");
                        break;
                    }
                    movieCounter = movieCounter.nextElementSibling;
                }
                movieField.innerHTML = "";
                movieField.appendChild(movieSelection);
                currCol = currCol.nextElementSibling;
            }
        } else {
            let textbox = document.createElement("input");
            if (i == 2) {
                textbox.setAttribute("type", "number");
                textbox.setAttribute("min", "1000");
                textbox.setAttribute("max", "9999");
                textbox.setAttribute("value", currCol.textContent);
                currCol.textContent = "";
                currCol.appendChild(textbox);
                currCol = currCol.nextElementSibling;
            } else {
                textbox.setAttribute("type", "text");
                textbox.setAttribute("value", currCol.textContent);
                currCol.textContent = "";
                currCol.appendChild(textbox);
                currCol = currCol.nextElementSibling;
            }
        }
    }
    var button = row.lastElementChild.firstElementChild.lastElementChild;
    button.innerText = "Save";
    button.onclick = function(){saveAward(ID)};
}

function saveAward(ID) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    var movieText = null;
    var movieValue = null;
    if (currCol.firstElementChild.value == "") {
            return;
    }
    if (currCol.nextElementSibling.firstElementChild.value == "") {
            return;
    }
    if (currCol.nextElementSibling.nextElementSibling.firstElementChild.value == "" || 
        String(currCol.nextElementSibling.nextElementSibling.firstElementChild.value).length < 4 || 
        String(currCol.nextElementSibling.nextElementSibling.firstElementChild.value).length > 4) {
            return;
    }
    for (i = 0; i < 4; i++) {
        if (i == 3) {
            let child = currCol.firstElementChild;
            let option = child.firstElementChild;
            for (j = 0; j < child.length; j++) {
                if (option.selected == true) {
                    movieText = option.dataset.name;
                    movieValue = option.value;
                    row.lastElementChild.previousElementSibling.innerHTML = option.value;
                    break;
                }
                option = option.nextElementSibling;
            }
            currCol.removeChild(child);
            currCol.textContent = movieText;
        } else {
            let child = currCol.firstElementChild;
            let text = currCol.firstElementChild.value;
            currCol.removeChild(child);
            currCol.textContent = text;
            currCol = currCol.nextElementSibling;
        }
    }
    let req = new XMLHttpRequest();
    let company = row.firstElementChild;
    let category = row.firstElementChild.nextElementSibling;
    let yearAwarded = row.firstElementChild.nextElementSibling.nextElementSibling;
    let movieID = movieValue;
    if (movieID == "no-movie") {
        movieID = null;
    }
    let awardID = String(row.getAttribute("id")).slice(3, 6);
    let payload = {company:null, category:null, yearAwarded:null, movieID:null, awardID:null};
    payload.company = company.textContent;
    payload.category = category.textContent;
    payload.yearAwarded = yearAwarded.textContent;
    payload.movieID = movieID;
    payload.awardID = awardID;

    req.open("PUT", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            var button = row.lastElementChild.firstElementChild.lastElementChild;
            button.innerText = "Update";
            button.onclick = function(){updateAward(ID)};
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

$(document).ready(function(){
    $("#searchAwards").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#awardTableBody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});