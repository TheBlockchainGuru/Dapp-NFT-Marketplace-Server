const userSchema = require('./userSchema');
const walletSchema = require('../wallet/walletSchema');
const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const userController = {}

userController.Register = async (req, res, next) => {
    try {
        const { wallet } = req.body;
        const user = await walletSchema.findOne({ wallet: wallet });

        if (! user ) {
            const newUser = new userSchema();
            await newUser.save();

            const newWallet = new walletSchema();
            newWallet.wallet = wallet;
            newWallet.user = newUser._id;
            await newWallet.save();
        }
        // const data = await walletSchema.findOne({ wallet: wallet}).populate('user');

        const data = await walletSchema
                            .findOne({ wallet: wallet})
                            .populate({
                                path: 'user',
                                populate: 'followers, following'
                            });
        return otherHelper.sendResponse(res, httpStatus.OK, { user: data }, null, 'user info');
    } catch (err) {
        next(err);
    }
}

userController.Update = async (req, res, next) => {
    try {
        const { id, name, image, bio, email, facebook, twitter, instagram, web } = req.body
        console.log(req.body)
        const user = await userSchema.updateOne({_id: id }, {
            name: name,
            bio: bio,
            image: image,
            email: email,
            facebook: facebook,
            twitter: twitter,
            instagram: instagram,
            web: web
        })

        return otherHelper.sendResponse(res, httpStatus.OK, { user: user});
    } catch (err) {
        next(err);
    }
}

userController.GetTotalUserCount = async (req, res, next) => {
    try {
        const data = await userSchema.find().count();
        return otherHelper.sendResponse(res, httpStatus.OK, { total: data });
    } catch (err) {
        next(err);
    }
}

userController.GetFeaturedUsers = async (req, res, next) => {
    try {
        const data = await userSchema
                        .find()
                        .populate('wallets')
                        .limit(12)
        return otherHelper.sendResponse(res, httpStatus.OK, { users: data });
    } catch (err) {
        next(err);
    }
}

userController.Follow = async (req, res, next) => {
    try {
        const {walletTo, walletFrom} = req.body
        const walletInfoTo = await walletSchema
            .findOne({wallet: walletTo});
        const walletInfoFrom =  await walletSchema
            .findOne({wallet: walletFrom});

        const userIdTo = walletInfoTo.user
        const userIdFrom = walletInfoFrom.user
    
        await userSchema
            .find({_id: userIdTo})
            .update(
                {$push: {followers: userIdFrom}},
            )

        await userSchema
            .find({_id: userIdFrom})
            .update(
                {$push: {following: userIdTo}},
            );

        return otherHelper.sendResponse(res, httpStatus.OK, { message: 'success' });
    } catch (err) {
        next(err);
    }
}

userController.Search = async (res, req, next) => {
    try {
        return otherHelper.sendResponse(res, httpStatus.OK, { message: "SUCCESS"});
    } catch (err) {
        next(err);
    }
}
module.exports = userController;