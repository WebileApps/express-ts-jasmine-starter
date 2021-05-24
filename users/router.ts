import { NextFunction, RequestHandler, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { getUserById, googleLogin } from "./module";

const router = Router();

router.get("/test-oauth", async (req, res, next) => {
    res.status(StatusCodes.OK).send(`
    <html lang="en">
    <head>
      <meta name="google-signin-scope" content="profile email">
      <meta name="google-signin-client_id" content="559066585746-mugr3mlfv4urfh4kak5fbdlu868jorsb.apps.googleusercontent.com">
      <script src="https://apis.google.com/js/platform.js" async defer></script>
    </head>
    <body>
      <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
      <script>
        function onSignIn(googleUser) {
          // Useful data for your client-side scripts:
          var profile = googleUser.getBasicProfile();
          console.log("ID: " + profile.getId()); // Don't send this directly to your server!
          console.log('Full Name: ' + profile.getName());
          console.log('Given Name: ' + profile.getGivenName());
          console.log('Family Name: ' + profile.getFamilyName());
          console.log("Image URL: " + profile.getImageUrl());
          console.log("Email: " + profile.getEmail());
  
          // The ID token you need to pass to your backend:
          var token = googleUser.getAuthResponse().id_token;
          fetch("/users/google-login", { method: "POST", headers:{"Content-Type" : "application/json"}, body: JSON.stringify({token})}).then(response => response.json()).then(console.log.bind(console));
        }
      </script>
    </body>
  </html>
    `)
})

router.post("/google-login", async (req, res, next) => {
    try {
        res.status(StatusCodes.OK).send(await googleLogin(req.body.token));
    } catch (error) {
        next(error);
    }
});
export = router;
