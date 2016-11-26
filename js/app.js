/* global $ */


(function() {


  /*
    ajax request for movie name search -
    searchParam() returns input values from name & year input -
    if results.Response is true, call omdbAPIid(results) to retrieve additional movie information per returned result -
    else if false, call noMoves();
  */
  function omdbAPIsearch(page) {

    if(page === undefined) {
      page = '1';
    }

    $.ajax({

      url: "http://www.omdbAPI.com/?s=" + searchParam().name + "&y=" + searchParam().year + "&page=" + page + "&type=movie", 
      
    })

      .done(function(results) {

        console.log(results);

        if(results.Response == "True") {
          omdbAPIid(results, page);         
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
    omdbAPIid() uses omdbAPIsearch()'s results to search for each returned movie title -
    apply properties of plot, rating & review for each result -
    once all properties have been applied to all results, call moviesFound(x)
  */
  var q = 0;
  function omdbAPIid(searchResults, page) {

    $.ajax({

      url: "http://www.omdbAPI.com/?t=" + searchResults.Search[q].Title + "&plot=full&tomatoes=true", 

    })

    .done(function(data) {

      if(data.Response == "True") {

        searchResults.Search[q].moreInfo = data.Plot;
        searchResults.Search[q].score = data.imdbRating;

        if(data.tomatoConsensus == "N/A") {
          searchResults.Search[q].review = "";
        } else {
          searchResults.Search[q].review = "IMDb Consensus: '" + data.tomatoConsensus + "'";
        }

        q++;
        if(q < searchResults.Search.length) {
          omdbAPIid(searchResults, page);
        } else {
          moviesFound(searchResults, page);
          q = 0;
        }

      } else if (data.Response == "False") {
        console.log('error in omdbAPIid');
      }
    })
      .fail(function(data) {

        console.log( data.status, data.statusText );

      }); 

  }


    /*
      for each omdbAPISearch() result, generate li w/ appropiate elements to display movie title, year, poster, imdb link, plot, rating & review if available -
      if poster image is not available, load default image
    */
    function moviesFound(results, page) {

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
              "<div class='more-img'>" + poster + "<span>" + results.Search[i].Title + "</span></br><span>" + results.Search[i].Year + "</span></br><span>IMDb Rating: <span class=" + movieRating(results.Search[i].score) +">" + results.Search[i].score + "</span></span><span class='exit0'>X</span></div>" +
              "<p class='review'>" + results.Search[i].review + "</p>" +
              "<p class='plot'>" + "<span class='indi'>PLOT</span>" + results.Search[i].moreInfo + "</p>" +
            "</div>" +
          "</li>"
        ); 
      }

      /*
        if this is the intial movie search, run moviePagination() -
        else update page number
      */
      if(page == '1' && !$(".pagination").length) {
        moviePagination(results, page);
      } else { 
        $(".page").text("Page " + page); 
      }

      $(".description").hide();

    }


    //moveRating() changes the color each movie's rating number based on the rating score
    function movieRating(x) {
      var visualScore = parseInt(x);
      if(visualScore >= 8) {
        return 'score-good';
      } else if(visualScore >= 5.5) {
        return 'score-average';
      } else {
        return 'score-bad';
      }
    }


    /*
      pagination for movie results, determine number of pages to create by dividing total number of search results by 10 -
      once appropiate pagination has been appended, call cycle() with total number of pages
    */
    function moviePagination(results, page) {

      $(".main-content").append("<div class='pagination'><button class='cycle-less'> -</button></div>");

      var total = Math.ceil(parseInt(results.totalResults / 10));

      if(total > 10) {
        for(var i = 1; i < 11; i++) {
          $(".pagination").append("<a href='#'>" + i + "</a>");
        }        
      }

      $(".pagination").append("<button class='cycle-more'> + </button></br><span class='page'>Page " + page + "</span><span> out of " + total + "</span>");
      
      cycle(total);
    } 

    /*
      cycle() iterates through available pages on button click, iterating by 10 -
      on cycle-more, if iteration overflows amount of pages, hide extra pages -
      on cycle-less, if any pages are hidden, show
    */
    function cycle(total) {

      var lastPage,
          page;

      $(".main-content").on("click", ".cycle-more", function() {

        lastPage = parseInt($(".pagination a:last").text());
        
        if(lastPage < total) {

          $(".pagination a").each(function() {

            page = parseInt($(this).text()) + 10;
            $(this).text(page.toString());
            lastPage = parseInt($(".pagination a:last").text());

            if(lastPage > total) {

              for(var i = 0; i < lastPage - total; i++) {
                $(".pagination a").eq(9 - i).hide();
              }

            }
          });
        }
      });

      $(".main-content").on("click", ".cycle-less", function() {

        lastPage = parseInt($(".pagination a:last").text());

        if(lastPage > 10) {     

          $(".pagination a").each(function() {

            page = parseInt($(this).text()) - 10;
            $(this).text(page.toString());

            if($(this).css("display") == "none") {
              $(this).show();
            }

          });        
        }
      });         
    }   


    // when no movies are found from the ajax request, indicate no movies were found to the user
    function noMovies() {

      $("#movies").html("");

      $("#movies").append(
        "<li class='no-movies'>" +
          "<i class='material-icons icon-help'>help_outline</i>No Movies Found That Match: " + searchParam().name +
        "</li>"
      );
    }

    // loads new search results based on page number which was selected
    $(".main-content").on("click", ".pagination a", function(e) {
      e.preventDefault();
      omdbAPIsearch($(this).text());
    }); 

    // visual indicator for 'More Info' for each movie
    $("#movies").on("mouseenter", "li", function() {
    $(this).find(".description").slideDown("fast", function() {});
    });
     $("#movies").on("mouseleave", "li", function() {
    $(this).find(".description").slideUp("fast", function() {});
    });

    // toggles for additional movie information
    $("#movies").on("click", ".info", function(e) {
      e.stopPropagation();
      e.preventDefault();
      $(this).parents("li").children(".more-info").toggle("fast", function(){});
      $(this).parents("li").siblings().children(".more-info").hide("fast");
    }); 

    $("#movies").on("click", ".exit0", function(e) {
      e.preventDefault();
      $(this).parents("li").children(".more-info").toggle("fast", function(){});
    });

    $(document).click(function() {
      var $el = $(".more-info");
      if($el.is(":visible")) {
        $el.hide("fast");
      }
    });   


    //returns input values for both name & year fields
    function searchParam() {

      var exports = {
        name: $("#search").val(),
        year: $("#year").val()
      };

      return exports;
    }       


    //initial ajax request trigger
    $("#submit").click(function(e) {
      e.preventDefault();
      omdbAPIsearch();
    });


})();
