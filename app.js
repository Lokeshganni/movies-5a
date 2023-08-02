const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializaDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at port 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializaDbAndServer();

//API 1

const snakeToCamelCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
        select movie_name
        from movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  res.send(moviesArray.map((obj) => snakeToCamelCase(obj)));
});

//API 2

app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');`;
  const addMovie = await db.run(postMovieQuery);
  const movieId = addMovie.lastID;
  res.send("Movie Successfully Added");
});

// API 3

const myFunc = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  //   console.log(movieId);
  const getQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;
  const getArray = await db.get(getQuery);
  //   console.log(getArray);
  res.send(myFunc(getArray));
});

//API 4

app.put("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  console.log(movieId);
  const api4Body = req.body;
  console.log(api4Body);
  const { directorId, movieName, leadActor } = api4Body;
  const api4Query = `
  UPDATE movie
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`;
  await db.run(api4Query);
  res.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const api5Query = `
  DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(api5Query);
  res.send("Movie Removed");
});

//API 6

const directorSnakeToCamel = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/directors/", async (req, res) => {
  const api6Query = `
    select * from director;`;
  const api6Res = await db.all(api6Query);
  res.send(api6Res.map((obj) => directorSnakeToCamel(obj)));
});

//API 7

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const api7Query = `
  SELECT movie_name 
  FROM movie WHERE director_id=${directorId};`;
  const api7Res = await db.all(api7Query);
  res.send(api7Res.map((obj) => snakeToCamelCase(obj)));
});

module.exports = app;
