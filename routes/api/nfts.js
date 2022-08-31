const express = require('express');
const router = express.Router();
const nftModule = require('../../modules/nft/nftController');

// router.post('/detail/:id', userModule.)

/**
 * @route POST api/user/update
 * @description Update user route
 * @access Public
 */
router.post('/search', nftModule.Search);

/**
 * @route GET api/nft/total-mint-count
 * @description Get total minted nft count
 * @access Public
 */
router.get('/total-mint-count', nftModule.GetTotalMintCount);

/**
 * @route POST api/nft/create
 * @description Mint nft
 * @access Public
 */
router.post('/create', nftModule.Create);

module.exports = router;