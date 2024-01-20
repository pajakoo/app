const router = require("express").Router();
const passport = require("passport");

router.get("/login/success", (req, res) => {
	console.log('pajak success:->', req.user);
	// res.status(200).json({
	// 	error: false,
	// 	message: "Successfully Loged In",
	// 	user: "пайако"
	// });
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

router.get("/google", passport.authenticate("google", ["profile", "email"]));


router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/' }),
	(req, res) => {
	  // Set any necessary cookies, including the first-party cookie
	  const userData = { id: req.user.id, name: req.user._json.name, email: req.user._json.email };
	  const encodedUserData = encodeURIComponent(JSON.stringify(userData));
	  console.log('pajakoo', encodedUserData, userData);

	   res.cookie('firstPartyCookie', encodedUserData, { domain: process.env.CLIENT_URL, secure: true, sameSite: 'None' });
	   res.redirect(process.env.CLIENT_URL);
	}
  );


router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});


module.exports = router;

