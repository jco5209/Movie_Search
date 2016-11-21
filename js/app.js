(function() {

  /*
    ajax request for movie name search & year filter -
    searchParam() returns input values for name & year input -
    if results.Response is true, call omdbAPIid(results) -
    else if false, call noMoves();
  */
  function omdbAPIsearch() {

    $.ajax({

      url: "http://www.omdbAPI.com/?s=" + searchParam().name + "&y=" + searchParam().year, 
      
    })

      .done(function(results) {

        if(results.Response == "True") {
          omdbAPIid(results);         
        } else if(results.Response == "False") {
          noMovies();
        }

      })

      .fail(function(results) {

        console.log( results.status, results.statusText );

        $("#movies").html("");
        $("#movies").append(
          "<li class='no-movies'>" +
            "<i class='material-icons icon-help'>help_outline</i>Connection Error: " + results.status + " " + results.statusText +
          "</li>"
        );

      });
  }

  /*
    omdbAPIid() uses omdbAPIsearch()'s results to search for a specific movie title -
    ajax requests are made based on length of omdbAPIsearch()'s results -
    apply properties of plot, rating & review for each result -
    once all properties have been applied to all results, call moviesFound(x)
  */

  var q = 0;
  function omdbAPIid(x) {


    $.ajax({

      url: "http://www.omdbAPI.com/?t=" + x.Search[q].Title + "&plot=full&tomatoes=true", 

    })
    .done(function(data) {

      if(data.Response == "True") {

        x.Search[q].moreInfo = data.Plot;
        x.Search[q].score = data.imdbRating;

        if(data.tomatoConsensus == "N/A") {
          x.Search[q].review = "";
        } else {
          x.Search[q].review = "IMDb Consensus: '" + data.tomatoConsensus + "'";
        }

        q++;
        if(q < x.Search.length) {
          omdbAPIid(x);
          console.log(data);
        } else {
          moviesFound(x);
          q = 0;
        }
      } else if (data.Response == "False") {
        console.log('error in description ajax');
      }
    })
      .fail(function(data) {

        console.log( data.status, data.statusText );

      }); 

  }

    /*
      for each result, generate li w/ appropiate elements to display movie title, year, poster, imdb link, plot, rating & review if available -
      if poster image is not available, load default image
    */
    function moviesFound(results) {

      var poster,
          imdb;   

      $("#movies").html("");

      for(var i = 0; i < results.Search.length; i++) {

        imdb = "http://www.imdb.com/title/" + results.Search[i].imdbID;

        if(results.Search[i].Poster == "N/A") {

          poster = "<a href=" + imdb + "><i class='material-icons poster-placeholder'>crop_original</i></a>";

        } else {

          poster = "<a href=" + imdb + "><img class='movie-poster' src=" + results.Search[i].Poster + "></a>";

        }
        $("#movies").append(

          "<li>" +
            "<div class='poster-wrap'>" +
              poster +
            "</div>" + 
            "<div class='info'>" +
              "<span class='movie-title'>" + results.Search[i].Title + "</span>" +
              "<span class='movie-year'>" + results.Search[i].Year + "</span>" +
              "<a class='description' href='#'>More Info</a>" + 
            "</div>" +
            "<div class='more-info'>" +
              "<div class='more-img'><img src=" + results.Search[i].Poster + "><span>" + results.Search[i].Title + "</span></br><span>" + results.Search[i].Year + "</span></br><span>IMDb Rating: " + results.Search[i].score +"</span><span class='exit0'>X</span></div>" +
              "<p class='review'>" + results.Search[i].review + "</p>" +
              "<p class='plot'>PLOT: " + "<span></br></span>" + results.Search[i].moreInfo + "</p>" +
            "</div>" +
          "</li>"

        ); 
      }
      $(".description").hide();
    }

    /*
      displays 'No Movies Found' indication when no movies are found
    */
    function noMovies() {

      $("#movies").html("");

      $("#movies").append(
        "<li class='no-movies'>" +
          "<i class='material-icons icon-help'>help_outline</i>No Movies Found That Match: " + searchParam().name +
        "</li>"
      );

    }

    /*
      returns input values for both name & year fields
    */
    function searchParam() {

      var exports = {
        name: $("#search").val(),
        year: $("#year").val()
      };

      return exports;
    } 

    /*
      visual indicator for 'More Info' for each movie
    */
    $("#movies").on("mouseenter", "li", function() {
    $(this).find(".description").slideDown("fast", function() {});
    });
     $("#movies").on("mouseleave", "li", function() {
    $(this).find(".description").slideUp("fast", function() {});
    });

    /*
      toggles for additional movie information
    */ 
    $("#movies").on("click", ".info", function(e) {
      e.preventDefault();
      $(this).parents("li").children(".more-info").toggle("fast", function(){});
    }); 
    $("#movies").on("click", ".exit0", function(e) {
      e.preventDefault();
      $(this).parents("li").children(".more-info").toggle("fast", function(){});
    });       

    /*
      initial ajax request trigger
    */
    $("#submit").click(function(e) {
      e.preventDefault();
      omdbAPIsearch();
    });


})();


















// -end