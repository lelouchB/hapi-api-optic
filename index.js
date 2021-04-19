const Hapi = require("@hapi/hapi");
const Mongoose = require("mongoose");

Mongoose.connect(
  "<YOUR-MONGODB-CONNECTION-STRING>",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false  }
)
  .then(() => {
    console.log("Database Connected");
    return true;
  })
  .catch((err) => {
    console.error("Error : Cannot connect to Database " + err);
    return false;
  });

const MovieModel = Mongoose.model("movies", {
  name: String,
  year: Number,
  plot: String,
});

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
  });
  
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Welcome To Movies API!!";
    },
  });
  server.route({
    method: "POST",
    path: "/addMovie",
    handler: async (request, h) => {
      try {
        const newMovie = new MovieModel(request.payload);
        const result = await newMovie.save();

        return h.response(result);
      } catch (error) {
        return h.response(error).code(500);
      }
    },
  });

  server.route({
    method: "GET",
    path: "/movies",
    handler: async (request, h) => {
      try {
        const movies = await MovieModel.find().exec();
        return h.response(movies);
      } catch (error) {
        return h.response(error).code(500);
      }
    },
  });

  server.route({
    method: "GET",
    path: "/movie/{id}",
    handler: async (request, h) => {
      try {
        const movie = await MovieModel.findById(request.params.id).exec();
        return h.response(movie);
      } catch (error) {
        return h.response(error).code(500);
      }
    },
  });

  server.route({
    method: "PUT",
    path: "/movie/{id}",
    handler: async (request, h) => {
      try {
        const result = await MovieModel.findByIdAndUpdate(
          request.params.id,
          request.payload,
          { new: true }
        );
        return h.response(result);
      } catch (error) {
        return h.response(error).code(500);
      }
    },
  });
  server.route({
    method: "DELETE",
    path: "/movie/{id}",
    handler: async (request, h) => {
      try {
        const result = await MovieModel.findByIdAndDelete(request.params.id);
        return h.response(result);
      } catch (error) {
        return h.response(error).code(500);
      }
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
