import React from "react";
// import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";

const Favorite = () => {
  const { favoriteMovies } = useAppContext();
  return favoriteMovies.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      
      <h1 className="text-lg font-medium my-4">Your Favorite Movies</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favoriteMovies.map((movie) => (
          <div key={movie._id}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-3xl font-bold text-center">No Movie Avalivle</h1>
    </div>
  );
};

export default Favorite;
