const router = require("express").Router();
const passport = require("passport");

const { ObjectId } = require('mongodb');
const client  = require("../connectdb/client");
const dbName = process.env.DB_NAME;
const db = client.db(dbName);

router.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json({
			error: false,
			message: "Successfully Loged In",
			user: req.user,
		});
	} else {
		res.status(403).json({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});

// router.get("/google", passport.authenticate("google", ["profile", "email"]));
router.get('/google', (req, res, next) => {
	passport.authenticate('google', {
	  prompt: 'select_account',
	  scope: ['profile', 'email'],
	})(req, res, next);
  });


router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/' }),
	async (req, res) => {
		await client.connect();
	  try {
		// Check if the user already exists in the database
		const user = req.user._json;
		const existingUserCursor = await db.collection('users').find({ googleId: user.sub });
		const existingUser = await existingUserCursor.next();
		console.log(existingUser)
		if (!existingUser) {
		  // If the user doesn't exist, create a new user
		  const newUser = {
			googleId: user.sub,
			name: user.name,
			picture: user.picture,
			email: user.email,
			roles: [new ObjectId('65ad37260d46ccb8d29534f8')], //diff in db!!!!
		  };
  
		  // Insert the new user into the database
		  await db.collection('users').insertOne(newUser);
  
		  // Redirect the user after saving user information
		  res.redirect(process.env.CLIENT_URL);
		} else {
		  // If the user exists, redirect the user without saving again
		  res.redirect(process.env.CLIENT_URL);
		}
	  } catch (error) {
		console.error('Грешка при обработка на потребителската информация:', error.message);
		res.status(500).json({ error: 'Грешка при обработка на потребителската информация.' });
	  } finally {
        await client.close();
    }
	}
  );
  
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});


module.exports = router;

