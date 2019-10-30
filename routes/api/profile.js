const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');

const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/profile/me
// @desc Get current user profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar', ]);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            })
        }

        res.json(profile);

    } catch (err) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// @route POST api/profile/me
// @desc Create or update user profile
// @access Private
router.post('/', [auth,
        [
            check('status', 'Status is required')
            .not()
            .isEmpty(),
            check('skills', 'Skills is required')
            .not()
            .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagramm,
            linkedin
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagramm) profileFields.social.instagramm = instagramm;
        res.send('');


        try {
            let profile = await Profile.findOne({
                user: req.user.id
            });

            if (profile) {
                // Update
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });
                return res.json(profile)
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    })

// @route GET api/profiles/
// @desc Get All
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET api/profile/user/:user_Id
// @desc Get profile by user ID
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.find({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if (!profile)
            return res.status(400).json({
                msg: 'profile not found'
            });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'profile not found'
            });
        }
        res.status(500).send('Server Error');
    }
});


// @route  DELETE api/profile
// @desc   Delete profile, user & post
//@access  Private
router.delete('/', auth, async (req, res) => {
    try {

        //@todo remove posts


        //remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        })
        // remove user
        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            msg: 'User deleted'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})



module.exports = router;