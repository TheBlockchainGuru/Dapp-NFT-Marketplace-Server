const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const auctionSchema = require('./auctionSchema');
const bidSchema = require('../bid/bidSchema');
const transactionSchema = require('../transaction/transactionSchema');
const nftSchema = require('../nft/nftSchema');
const historySchema = require('../history/historySchema');

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
        await new historySchema({
            market: req.body.market,
            nft: req.body.nft,
            type: 'List',
            list: data._id,
            supply: req.body.supply,
            creator: req.body.seller,
            state: "0",
            endAt: req.body.endAt
        }).save();
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
        let nftIds = [];
        let nftIdsFromSearch = [];
        let nftIdsFromCategory = [];
        let query = { state: { $in: [0, 1] } }
        let sort = ['createAt', '1'];

        if (req.body.sort) {
            sort = req.body.sort;
        }

        if (req.body.keyword) {
            const nfts = await nftSchema
                            .find({
                                $text: {
                                    $search: req.body.keyword
                                }
                            })
                            .select('id');
            if (nfts.length) {
                nftIdsFromSearch = nfts.map(element => element.id);
                nftIds.push(...nftIdsFromSearch);
            }
            
            query.nft = {
                $in: nftIds
            }
        } 
        
        if (req.body.category) {
            const nfts = await nftSchema
                                .find({category: req.body.category})
                                .select('id')
            if (nfts.length) {
                nftIdsFromCategory = nfts.map(element => element.id)
            }

            if (req.body.keyword) {
                if (nftIds.length) {
                    const realItems = nftIds.filter(element => nftIdsFromCategory.includes(element))
                    nftIds = realItems; 
                }
            } else {
                nftIds.push(...nftIdsFromCategory);
            }

            query.nft = {
                $in: nftIds
            }
        }
        const auctions = await auctionSchema
                        .find(query)
                        .sort([sort])
                        .populate({
                            path: 'sellerInfo', 
                            populate: {
                                path: 'user'
                            }
                        })
                        .populate('nftInfo')
                        .limit(req.body.limit ?? 12)

        if (auctions.length) {
            for( let i = 0; i < auctions.length; i ++) {
                const auction = auctions[i];
                const bids = await bidSchema.find({auction: auction._id})
                auctions[i].bids = bids;
            }
        }
        
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
        const bids = await bidSchema
                                .find({auction: data._id})
                                .populate({
                                    path: 'bidderInfo',
                                    populate: {
                                        path: 'user'
                                    }
                                })
                                .sort([['price', '1']]);
        const result = data.toObject();
        result.bids = bids;

        return otherHelper.sendResponse(res, httpStatus.OK, { auction: result });
    } catch (err) {
        next(err);
    }
}
module.exports = auctionController;