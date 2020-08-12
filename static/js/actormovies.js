function loadMovies() {
    let actorID = $('#actorMoviesSelect option:selected')[0].value;
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let res = JSON.parse(req.responseText);
            let movieSelect = $('#movieSelect');
            movieSelect[0].selectedIndex = -1;
            let options = Array.from(movieSelect[0].options);
            $.each(res.movies, function(key, value) {
                let option = options.filter(o => o.value === value.movieID.toString());
                option[0].selected = true;
            });
            $('#movieDiv').attr("hidden", false);
        }
    };
    req.open("GET", "/actormovies/" + actorID, true);
    req.send();
}

function saveMovies() {
    let actorID = $('#actorMoviesSelect option:selected')[0].value;
    let options = $('#movieSelect option:selected');
    let movieIds = '';
    $.each(options, function(key, value) {
       movieIds += value.value + ',';
    });
    movieIds = movieIds.slice(0, -1);
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            $('#confirmationModal').modal('show');
        }
    };
    req.open("PUT", "/actormovies/" + actorID, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send("movie_ids=" + movieIds);
}