url = String(window.location.href);
document.getElementById("movieSubmit").addEventListener("click", addNewMovie);
document.getElementById("searchMovieSubmit").addEventListener("click", searchMovie);

function add(data) {
    let table = document.getElementById("movieTable").lastElementChild;
    let newRow = document.createElement("tr");

    let dataLength = data["rows"].length - 1;
    let newData = data["rows"][dataLength];
    newRow.setAttribute("id", "row" + String(newData["movieID"]));
    for (i = 1; i < 4; i++) {
        let newCol = document.createElement("td");
        let values = Object.values(newData);
        newCol.innerHTML = String(values[i]);
        newRow.appendChild(newCol);
    }
    let synopsisCol = document.createElement("td");

    let synopsisX = document.createElement("button");
    synopsisX.setAttribute("type", "button");
    synopsisX.setAttribute("class", "btn btn-info");
    synopsisX.setAttribute("data-toggle", "modal");
    synopsisX.setAttribute("data-target", "#synopsis" + String(newData["movieID"]));
    synopsisX.innerHTML = "View";
    synopsisCol.appendChild(synopsisX);

    let synopsisDiv = document.createElement("div");
    synopsisDiv.setAttribute("class", "modal fade");
    synopsisDiv.setAttribute("id", "synopsis" + String(newData["movieID"]));
    synopsisDiv.setAttribute("tabindex", "-1");
    synopsisDiv.setAttribute("role", "dialog");
    synopsisDiv.setAttribute("aria-labelledby", "synopsisTitle" + String(newData["movieID"]));
    synopsisDiv.setAttribute("aria-hidden", "true");

    let synopsisDiv2 = document.createElement("div");
    synopsisDiv2.setAttribute("class", "modal-dialog");
    synopsisDiv2.setAttribute("role", "document");

    let synopsisDiv3 = document.createElement("div");
    synopsisDiv3.setAttribute("class", "modal-content");

    let modalHeader = document.createElement("div");
    modalHeader.setAttribute("class", "modal-header");

    let modalTitle = document.createElement("h1");
    modalTitle.setAttribute("class", "modal-title");
    modalTitle.setAttribute("id", "synopsisTitle" + String(newData["movieID"]));
    modalTitle.innerHTML = newData["name"];

    let modalTitleButton = document.createElement("button");
    modalTitleButton.setAttribute("type", "button");
    modalTitleButton.setAttribute("class", "close");
    modalTitleButton.setAttribute("data-dismiss", "modal");
    modalTitleButton.setAttribute("aria-label", "Close");

    let modalTitleSpan = document.createElement("span");
    modalTitleSpan.setAttribute("aria-hidden", "true");
    modalTitleSpan.innerHTML = "&times;";

    let modalBody = document.createElement("div");
    modalBody.setAttribute("class", "modal-body");
    let modalBodyP = document.createElement("p");
    modalBodyP.textContent = String(newData["synopsis"]);
    modalBody.appendChild(modalBodyP);

    let modalFooter = document.createElement("div");
    modalFooter.setAttribute("class", "modal-footer");
    let modalFooterButton = document.createElement("button");
    modalFooterButton.setAttribute("type", "button");
    modalFooterButton.setAttribute("class", "btn btn-secondary");
    modalFooterButton.setAttribute("data-dismiss", "modal");
    modalFooterButton.innerHTML = "Close";
    modalFooter.appendChild(modalFooterButton);

    modalTitleButton.appendChild(modalTitleSpan);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalTitleButton);
    synopsisDiv3.appendChild(modalHeader);
    synopsisDiv3.appendChild(modalBody);
    synopsisDiv3.appendChild(modalFooter);
    synopsisDiv2.appendChild(synopsisDiv3);
    synopsisDiv.appendChild(synopsisDiv2);
    synopsisCol.appendChild(synopsisDiv);
    newRow.appendChild(synopsisCol);

    let buttonCol = document.createElement("td");
    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "d-flex flex-row-reverse");
    let newDelete = document.createElement("button");
    let newUpdate = document.createElement("button");
    newDelete.setAttribute("class", "btn btn-secondary");
    newDelete.setAttribute("onclick", "deleteMovie(" + String(newData["movieID"] + ")"));
    newDelete.innerHTML = "Delete";
    newUpdate.setAttribute("class", "btn btn-primary mx-2");
    newUpdate.setAttribute("onclick", "updateMovie(" + String(newData["movieID"] + ")"));
    newUpdate.innerHTML = "Update";
    buttonDiv.appendChild(newDelete);
    buttonDiv.appendChild(newUpdate);
    buttonCol.appendChild(buttonDiv);
    newRow.appendChild(buttonCol);

    table.appendChild(newRow);
}

function addNewMovie() {
    document.getElementById("addMovieForm").checkValidity();
    if (document.getElementById("addMovieForm").reportValidity() == false) {
        return;
    }
    let req = new XMLHttpRequest();
    let payload = {name:null, releaseDate:null, averageCriticRating:null, synopsis:null};
    payload.name = document.getElementById("movieName").value;
    payload.releaseDate = document.getElementById("movieDate").value;
    payload.averageCriticRating = document.getElementById("movieRating").value;
    payload.synopsis = document.getElementById("movieSynopsis").value;
    req.open("POST", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            add(data);
            document.getElementById("addMovieForm").reset();
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function deleteMovie(ID) {
    var row = document.getElementById("row" + ID);
    let req = new XMLHttpRequest();
    let payload = {movieID:null};
    payload.movieID = ID;
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

function updateMovie(ID) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    for (i = 0; i < 3; i++) {
        if (i == 0 || i == 2) {
            let textbox = document.createElement("input");
            textbox.setAttribute("type", "text");
            textbox.setAttribute("value", currCol.textContent);
            currCol.textContent = "";
            currCol.appendChild(textbox);
        } else {
            let textbox = document.createElement("input");
            textbox.setAttribute("type", "date");
            let months = {
                Jan: "01",
                Feb: "02",
                Mar: "03",
                Apr: "04",
                May: "05",
                Jun: "06",
                Jul: "07",
                Aug: "08",
                Sep: "09",
                Oct: "10",
                Nov: "11",
                Dec: "12"
            };
            let dateString = currCol.textContent;
            let dateYear = String(dateString.slice(dateString.length - 4, dateString.length));
            let dateMonth = months[String(dateString.slice(0, 3))];
            let dateDay = null;
            if (String(dateString.slice(5, 6)) == " ") {
                dateDay = "0" + String(dateString.slice(4, 5));
            } else {
                dateDay = String(dateString.slice(4, 6));
            }
            let dateFormatted = dateYear + "-" + dateMonth + "-" + dateDay;
            textbox.setAttribute("value", dateFormatted);
            currCol.textContent = "";
            currCol.appendChild(textbox);
        }
        currCol = currCol.nextElementSibling;
    }
    let editSynopsisButton = row.lastElementChild.previousElementSibling.firstElementChild;
    editSynopsisButton.innerHTML = "Edit";
    let editSynopsis = row.lastElementChild.previousElementSibling.lastElementChild.firstElementChild.firstElementChild.firstElementChild.nextElementSibling;
    let copySynopsis = editSynopsis.firstElementChild.textContent;
    let synopsisInput = document.createElement("textarea");
    synopsisInput.setAttribute("rows", "20");
    synopsisInput.setAttribute("cols", "50");
    synopsisInput.textContent = copySynopsis;
    editSynopsis.removeChild(editSynopsis.firstElementChild);
    editSynopsis.appendChild(synopsisInput);
    
    var button = row.lastElementChild.firstElementChild.lastElementChild;
    button.innerText = "Save";
    button.onclick = function(){saveMovie(ID)};
}

function saveMovie(ID, synButton, parent, child) {
    let row = document.getElementById("row" + ID);
    var currCol = row.firstElementChild;
    if (currCol.firstElementChild.value == "") {
        return;
    }
    if (currCol.nextElementSibling.nextElementSibling.firstElementChild.value == "") {
        return;
    }
    var releaseDate = row.firstElementChild.nextElementSibling.firstElementChild.value;
    for (i = 0; i < 3; i++) {
        if (i == 1) {
            let child = currCol.firstElementChild;
            let text = currCol.firstElementChild.value;
            currCol.removeChild(child);
            let months = {
                "01": "Jan",
                "02": "Feb",
                "03": "Mar",
                "04": "Apr",
                "05": "May",
                "06": "Jun",
                "07": "Jul",
                "08": "Aug",
                "09": "Sep",
                "10": "Oct",
                "11": "Nov",
                "12": "Dec"
            };
            dateString = text;
            let dateMonth = months[dateString.slice(5, 7)];
            let dateYear = dateString.slice(0, 4);
            let dateDay = null;
            if (dateString.slice(8, 9) == "0") {
                dateDay = dateString.slice(9, 10);
            } else {
                dateDay = dateString.slice(8, 10);
            }
            let newDate = dateMonth + " " + dateDay + " " + dateYear;
            currCol.textContent = newDate;
            currCol = currCol.nextElementSibling;
        } else {
            let child = currCol.firstElementChild;
            let text = currCol.firstElementChild.value;
            currCol.removeChild(child);
            currCol.textContent = text;
            currCol = currCol.nextElementSibling;
        }
    }
    let req = new XMLHttpRequest();
    let name = row.firstElementChild;
    let averageCriticRating = row.firstElementChild.nextElementSibling.nextElementSibling;
    let synopsis = row.lastElementChild.previousElementSibling.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.value;
    let movieID = String(row.getAttribute("id")).slice(3);
    let payload = {name:null, releaseDate:null, averageCriticRating:null, synopsis:null, movieID:null};
    payload.name = name.textContent;
    payload.releaseDate = releaseDate;
    payload.averageCriticRating = averageCriticRating.textContent;
    payload.synopsis = synopsis;
    payload.movieID = movieID;

    req.open("PUT", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            var button = row.lastElementChild.firstElementChild.lastElementChild;
            button.innerText = "Update";
            button.onclick = function(){updateMovie(ID)};
            
            let synButton = row.lastElementChild.previousElementSibling.firstElementChild;
            synButton.innerHTML = "View";
            let synText = synopsis;
            let syn = row.lastElementChild.previousElementSibling.lastElementChild.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.firstElementChild;
            let parent = row.lastElementChild.previousElementSibling.lastElementChild.firstElementChild.firstElementChild.firstElementChild.nextElementSibling;
            let paragraph = document.createElement("p");
            paragraph.innerHTML = synText
            parent.removeChild(syn);
            parent.appendChild(paragraph);
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function searchMovie() {
    let req = new XMLHttpRequest();
    let payload = {movieName:null, movieGenre:null, actorNameFirst:null, actorNameLast:null, awardCompany:null, awardCategory:null};
    if (document.getElementById("searchMovieName").value != "") {
        payload.movieName = document.getElementById("searchMovieName").value;
    }
    if (document.getElementById("searchMovieGenre").value != "") {
        payload.movieGenre = document.getElementById("searchMovieGenre").value;
    }
    if (document.getElementById("searchMovieActorFirst").value != "") {
        payload.actorNameFirst = document.getElementById("searchMovieActorFirst").value;
    }
    if (document.getElementById("searchMovieActorLast").value != "") {
        payload.actorNameLast = document.getElementById("searchMovieActorLast").value;
    }
    if (document.getElementById("searchMovieAwardCompany").value != "") {
        payload.awardCompany = document.getElementById("searchMovieAwardCompany").value;
    }
    if (document.getElementById("searchMovieAwardCategory").value != "") {
        payload.awardCategory = document.getElementById("searchMovieAwardCategory").value;
    }
    req.open("GET", url + "/search/?" + "movieName=" + payload.movieName + "&movieGenre=" + payload.movieGenre + "&actorNameFirst=" + payload.actorNameFirst + "&actorNameLast=" + payload.actorNameLast + "&awardCompany=" + payload.awardCompany + "&awardCategory=" + payload.awardCategory, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.responseText);
            if (data == "") {
                window.alert("No matches found, please refine your search.");
            } else {
                displaySearch(data);
            }
        } else {
            console.log("Error in network request: " + req.statusText);
        }
    })
    req.send(null);
    event.preventDefault();
}

function displaySearch(data) {
    let table = document.getElementById("movieTable");
    let tableBody = table.lastElementChild;
    let tableBodyCopy = tableBody.cloneNode(false);

    for (i = 0; i < tableBody.rows.length; i++) {
        let rowID = tableBody.children[i].getAttribute("id").slice(3);
        loop1:
        for (j = 0; j < data.length; j++) {
            if (rowID == data[j].movieID) {
                let childCopy = tableBody.children[i].cloneNode(true);
                tableBodyCopy.appendChild(childCopy);
                break loop1;
            }
        }
    }
    table.replaceChild(tableBodyCopy, tableBody);
    document.getElementById("movieSubmit").remove();
    let searchSubmit = document.getElementById("searchMovieSubmit");
    searchSubmit.innerText = "Reset";
    searchSubmit.setAttribute("onclick", "window.location.reload()");
}
