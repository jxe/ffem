// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { TwitterStrategy } from 'remix-auth-twitter';
import { PrismaClient, User } from '@prisma/client'
const db = new PrismaClient()

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

interface SessionData {
  userId: number,
  roles: string[],
  source: string,
}

export let authenticator = new Authenticator<SessionData>(sessionStorage);

const clientID = process.env.TWITTER_CONSUMER_KEY;
const clientSecret = process.env.TWITTER_CONSUMER_SECRET;
if (!clientID || !clientSecret) {
  throw new Error("TWITTER_CONSUMER_KEY and TWITTER_CONSUMER_SECRET must be provided");
}

authenticator.use(
  new TwitterStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: process.env.AUTH_CALLBACK_DOMAIN
        ? `${process.env.AUTH_CALLBACK_DOMAIN}/api/auth/twitter/callback`
        : "http://localhost:3000/api/auth/twitter/callback",
      // In order to get user's email address, you need to configure your app permission.
      // See https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials.
      includeEmail: true // Optional parameter. Default: false.
    },
    // Define what to do when the user is authenticated
    async ({ accessToken, accessTokenSecret, profile }) => {
      // profile contains all the info from `account/verify_credentials`
      // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials

      // Return a user object to store in sessionStorage.
      // You can also throw Error to reject the login
      return await registerTwitterUser(profile);
    }
  ),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "twitter"
);

// let googleStrategy = new GoogleStrategy(
//   {
//     clientID: process.env.GOOGLE_CLIENT_ID!,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     callbackURL: process.env.AUTH_CALLBACK_DOMAIN!
//       ? `${process.env.AUTH_CALLBACK_DOMAIN!}/api/auth/google/callback`
//       : "http://localhost:3000/api/auth/google/callback"
//   },
//   async ({ accessToken, refreshToken, extraParams, profile }) => {
//     return registerGoogleUser(profile)
//   }
// );

// authenticator.use(googleStrategy);

// async function registerGoogleUser(profile: any) {
//   console.log("got google profile", profile)
//   const { id: googleId, displayName: name } = profile
//   const json = profile._json
//   const photoUrl = json["picture"] || json.image?.url || json.photos?.[0]?.value
//   const email = profile?.emails?.[0]?.value
//   const handleRoot = (profile._json["given_name"] || "user").replace(/\W+/g, "")
//   const handle = handleRoot + googleId.slice(-6)
//   const nick = profile.name?.givenName

//   console.log("have", { email, name, photoUrl, googleId, nick })
//   let user
//   if (email) {
//     user = await db.user.upsert({
//       where: { email },
//       create: { handle, email, name, photoUrl, googleId, nick },
//       update: { email, googleId },
//     })
//   } else {
//     user = await db.user.upsert({
//       where: { googleId },
//       create: { handle, name, photoUrl, googleId, nick },
//       update: { googleId },
//     })
//   }
//   return {
//     userId: user.id,
//     roles: [user.role],
//     source: "google",
//   }
// }


async function registerTwitterUser(profile: any) {
  console.log('running twitter auth', profile)
  const email = profile.emails && profile.emails[0]?.value
  const name = profile.displayName
  const twitterId = profile.id
  const twitterName = profile.username
  const photoUrl = `https://res.cloudinary.com/meaning-supplies/image/twitter/${twitterId}.jpg` // profile.photos && profile.photos[0]?.value
  const nick = profile.name?.givenName
  const {
    location,
    // description, url, followers_count, friends_count, listed_count, profile_image_url, profile_banner_url
  } = profile._json
  const city = location
  const handle = twitterName
  let user: User
  if (email) {
    user = await db.user.upsert({
      where: { email },
      create: { handle, email, name, photoUrl, twitterId, twitterName, nick, city },
      update: { email, twitterId, twitterName, city },
    })
  } else {
    user = await db.user.upsert({
      where: { twitterId },
      create: { handle, name, photoUrl, twitterId, twitterName, city },
      update: { twitterId, twitterName, city },
    })
  }
  // if (!email) {
  //     // This can happen if you haven't enabled email access in your twitter app permissions
  //     return done(new Error("Twitter OAuth response doesn't have email."))
  // }
  // if (Math.abs(user.createdAt.getTime() - Date.now()) < 100000) {
  // await tgram(user, "signed up")
  // }
  return {
    userId: user.id,
    roles: [user.role],
    source: "twitter",
  }
}


// export default passportAuth({
//   // secureCookie: false,
//   successRedirectUrl: "/",
//   errorRedirectUrl: "/",
//   secureProxy: true,
//   strategies: [
//     {
//       authenticateOptions: {
//         scope: [
//           "https://www.googleapis.com/auth/plus.login",
//           "https://www.googleapis.com/auth/userinfo.email",
//         ],
//       },
//       strategy: new GoogleStrategy(
//         {
//           clientID: process.env.GOOGLE_CLIENT_ID,
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//           callbackURL: process.env.AUTH_CALLBACK_DOMAIN
//             ? `${process.env.AUTH_CALLBACK_DOMAIN}/api/auth/google/callback`
//             : "http://localhost:3000/api/auth/google/callback",
//         },
//
//       ),
//     },
//     {
//       strategy: new TwitterStrategy(
//         {
//           // authenticateOptions: { },
//           consumerKey: process.env.TWITTER_CONSUMER_KEY,
//           consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//           callbackURL: process.env.AUTH_CALLBACK_DOMAIN
//             ? `${process.env.AUTH_CALLBACK_DOMAIN}/api/auth/twitter/callback`
//             : "http://localhost:3000/api/auth/twitter/callback",
//           includeEmail: true,
//         },
//
//       ),
//     },
//   ],
// })


// const profile = {
//   id: 2784,
//   id_str: '2784',
//   name: 'Joe Edelman',
//   screen_name: 'edelwax',
//   location: 'Berlin',
//   description: 'Would you be rich, if you were paid by how much meaning you bring to others’ lives? @humsys',
//   url: 'https://t.co/jvrMcTGwsQ',
//   // entities: { url: [Object], description: [Object] },
//   followers_count: 6485,
//   friends_count: 1005,
//   listed_count: 293,
//   utc_offset: null,
//   time_zone: null,
//   profile_image_url: 'http://pbs.twimg.com/profile_images/1447949104596856837/iUC__tH5_normal.jpg',
//   profile_image_url_https: 'https://pbs.twimg.com/profile_images/1447949104596856837/iUC__tH5_normal.jpg',
//   profile_banner_url: 'https://pbs.twimg.com/profile_banners/2784/1583952006',
//   email: 'joe.edelman@gmail.com'
// }