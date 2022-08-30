const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const auctionSchema = require('./auctionSchema');
const bidSchema = require('../bid/bidSchema');
const transactionSchema = require('../transaction/transactionSchema');

const auctionController = {};

auctionController.Auction = async (req, res, next) => {
    try {
        const data = new auctionSchema({
            market: req.body.market,
            nft: req.body.nft,
            seller: req.body.seller,
            buyer: req.body.buyer,
            price: req.body.price,
            period: req.body.period,
            state: req.body.state,
            supply: req.body.supply
        });
        await data.save();
        return otherHelper.sendResponse(res, httpStatus.OK, { auction: data });
    } catch (err) {
        next(err);
    }
}

auctionController.Bid = async (req, res, next) => {
    try {
        const { market, bidder, state, price, supply, contract, hash, nft } = req.body;
        const auction = await auctionSchema.findOne({market: market});

        const bid = await new bidSchema({
            auction: auction._id,
            bidder: bidder,
            state: state,
            price: price,
            supply: supply
        }).save();

        if (auction.bids) {
            auction.bids.push(bid._id)
        } else {
            auction.bids = [bid._id];
        }
        auction.state = 1;
        await auction.save();

        await new transactionSchema({
            to: contract,
            from: bidder,
            nft: nft,
            price: price,
            supply: supply,
            transactionHash: hash
        }).save();

        return otherHelper.sendResponse(res, httpStatus.OK, { message: 'SUCCESS' });
    } catch (err) {
        next(err);
    } 
}

auctionController.Get = async (req, res, next) => {
    try {
        const auctions = 
                await auctionSchema
                    .find()
                    .populate({
                        path: 'sellerInfo', 
                        populate: {
                            path: 'user'
                        }
                    })
                    .populate('nftInfo')
                    .limit(req.body.limit ?? 12)
        // auctions.forEach((element) 
        //                 => {
        //                     if (element.bids)
        //                     element.bids
        //                 })

        return otherHelper.sendResponse(res, httpStatus.OK, { auctions: auctions });
    } catch (err) {
        next(err);
    }
}

auctionController.Find = async (req, res, next) => {
    try {
        const { id } = req.body;
        const data = await auctionSchema
                        .findOne({market: id})
                        .populate({
                            path: 'sellerInfo',
                            populate: {
                                path: 'user'
                            }
                        })
                        .populate({
                            path: 'nftInfo',
                            populate: [{
                                path: 'creatorInfo',
                                populate: {
                                    path: 'user'
                                }
                            }, {
                                path: 'owners',
                                populate: {
                                    path: 'ownerInfo',
                                    populate: 'user'
                                }
                            }]
                        })
        // console.
        return otherHelper.sendResponse(res, httpStatus.OK, { auction: data });
    } catch (err) {
        next(err);
    }
}
module.exports = auctionController;