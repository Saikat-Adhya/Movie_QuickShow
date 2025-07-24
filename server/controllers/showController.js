import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
// This function fetches the currently playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );

    const movies = data.results;
    res.status(200).json({ success: true, movies: movies });
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//admin add new show
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);
    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);
      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;
      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path, // ✅
        backdrop_path: movieApiData.backdrop_path, // ✅
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date, // ✅
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "", // ✅ FIXED TYPO
        vote_average: movieApiData.vote_average, // ✅
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movie._id,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });
    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }
    res
      .status(201)
      .json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error("Error adding new show:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



//API to get all shows

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 });
    // filter unique shows
    const uniqueShows = new Set(shows.map(show => show.movie));
    res.status(200).json({ success: true, shows: Array.from(uniqueShows) });
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getShows = async (req, res) => {
//   try {
//     const now = new Date();
//     console.log("Current time:", now);

//     // Fetch all shows (no date filter for now)
//     const allShows = await Show.find().sort({ showDateTime: 1 });
//     console.log("Total shows found:", allShows.length);

//     if (allShows.length === 0) {
//       return res.status(200).json({ success: true, shows: [] });
//     }

//     // Filter unique movies (keep first show per movie)
//     const seenMovies = new Set();
//     const uniqueShows = [];

//     for (const show of allShows) {
//       if (!seenMovies.has(show.movie)) {
//         seenMovies.add(show.movie);
//         uniqueShows.push(show);
//       }
//     }

//     console.log("Unique shows returned:", uniqueShows.length);

//     res.status(200).json({ success: true, shows: uniqueShows });
//   } catch (error) {
//     console.error("Error fetching shows:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



//api to get a single show from db
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
   const shows = await Show.find({ movie: movieId ,showDateTime: { $gte: new Date() } })
   const movie = await Movie.findById(movieId);
   const dateTime = {};
    shows.forEach(show => {
      const date = show.showDateTime.toISOString().split("T")[0];
      // const time = show.showDateTime.toISOString().split("T")[1].split(".")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({time: show.showDateTime, showId: show._id});
    });
    res.status(200).json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("Error fetching show by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
