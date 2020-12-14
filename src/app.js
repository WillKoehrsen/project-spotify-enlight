const express = require("express");
const serverless = require("serverless-http");
const dotenv = require("dotenv");

const app = express();

const router = express.Router();

router.get("/", (req, response) => {
  const request = require("request");
  let client_id = process.env.CLIENT_ID;
  let client_secret = process.env.CLIENT_SECRET;
  let refresh_token = process.env.REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    dotenv.config();
    client_id = process.env.CLIENT_ID;
    client_secret = process.env.CLIENT_SECRET;
    refresh_token = process.env.REFRESH_TOKEN;
  }

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: { grant_type: "refresh_token", refresh_token: refresh_token },
  };

  request.post(authOptions, function (error, res) {

		var header = {
      Authorization: "Bearer " + JSON.parse(res.body).access_token,
    };
    var song_name, artist, song_url;

    request(
      {
        url: "https://api.spotify.com/v1/me/player/currently-playing?",
        headers: header,
      },
      function (error, res, body) {
        if (
          res.statusCode == 204 ||
          JSON.parse(body).currently_playing_type != "track"
        ) {
          // Use recently played instead of currently playing
          request(
            {
              url:
                "https://api.spotify.com/v1/me/player/recently-played?type=track&limit=1",
              headers: header,
            },
            function (error, res, body) {
							var body_text = JSON.parse(body);
							console.log(body_text);
              var track = body_text.items[0].track;
              song_name = track.name;
              artist = track.artists[0].name;
              song_url = track.external_urls.spotify;
              response.json({
                song_name: song_name,
                artist: artist,
                song_url: song_url,
              });
            }
          );
        } else {
					var body_text = JSON.parse(body);
					console.log(body_text);
          var track = body_text.item;
          song_name = track.name;
          artist = track.artists[0].name;
          song_url = track.external_urls.spotify;
          response.json({
            song_name: song_name,
            artist: artist,
            song_url: song_url,
          });
        }
      }
    );
  });
});

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);
