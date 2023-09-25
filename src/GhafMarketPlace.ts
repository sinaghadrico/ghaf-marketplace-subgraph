import { BigInt, log } from '@graphprotocol/graph-ts';
import {
    BidAccepted as BidAcceptedEvent,
    BidCanceled as BidCanceledEvent,
    BidRevoked as BidRevokedEvent,
    BidUpdated as BidUpdatedEvent,
    GhafMarketPlace,
    Initialized as InitializedEvent,
    NewBid as NewBidEvent,
    NftDelisted as NftDelistedEvent,
    NftListed as NftListedEvent,
    NftSold as NftSoldEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    Paused as PausedEvent,
    Unpaused as UnpausedEvent,
} from '../generated/GhafMarketPlace/GhafMarketPlace';

import { Nft, User, Bid,Offer } from '../generated/schema';

import { handleGlobal } from '../utils';

export let ZERO_BI = BigInt.fromI32(0);

const addressTypes: string[] = ['p2pk', 'p2pkh', 'p2sh', 'p2wpkh', 'p2wsh', 'p2tr'];

export function handleBidAccepted(event: BidAcceptedEvent): void {
    let bid = Bid.load(
        event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
    ); //Bid ID

    if (!bid) {
        log.error('GhafMarketPlace not found at handleBidRevoked with bid bidIdx: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
        ]);
        return;
    }

    bid.isAccepted = true;

    bid.timeStamp = event.block.timestamp;
    bid.transactionHash = event.transaction.hash.toHexString();
    bid.save();

    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        log.error('GhafMarketPlace not found at handleBidAccepted with Nft txid: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString(),
        ]);
        return;
    }

    nft.acceptedBid = bid.id;
    nft.hasAccepted = true;
    nft.save();
}

export function handleBidUpdated(event: BidUpdatedEvent): void {
    let bid = Bid.load(
        event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
    ); //Bid ID

    if (!bid) {
        log.error('GhafMarketPlace not found at handleBidRevoked with bid bidIdx: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
        ]);
        return;
    }

    bid.bidAmount = event.params.newAmount;
    let _bidAmountsHistory: BigInt[] = bid.bidAmountsHistory;
    _bidAmountsHistory.push(event.params.newAmount);
    bid.bidAmountsHistory = _bidAmountsHistory;
    bid.timeStamp = event.block.timestamp;
    bid.transactionHash = event.transaction.hash.toHexString();
    bid.save();
}

export function handleBidCanceled(event: BidCanceledEvent): void {
    let bid = Bid.load(
        event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
    ); //Bid ID

    if (!bid) {
        log.error('GhafMarketPlace not found at handleBidRevoked with bid bidIdx: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
        ]);
        return;
    }

    let ghafMarketPlace = GhafMarketPlace.bind(event.address);

    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        log.error('GhafMarketPlace not found at handleBidRevoked with Nft txid: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString(),
        ]);
        return;
    }

    let nftCapture = ghafMarketPlace.nfts(event.params.nftContractAddress, event.params.tokenId);

    nft.hasAccepted = nftCapture.getHasAccepted();

    if (bid.isAccepted) {
        nft.hasAccepted = false;
        nft.acceptedBid = null;
    }

    nft.save();

    bid.isCanceled = true;
    bid.isUsed = true;
    bid.isAccepted = false;
    bid.timeStamp = event.block.timestamp;
    bid.transactionHash = event.transaction.hash.toHexString();
    bid.save();
}

export function handleBidRevoked(event: BidRevokedEvent): void {
    let bid = Bid.load(
        event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
    ); //Bid ID

    if (!bid) {
        log.error('GhafMarketPlace not found at handleBidRevoked with bid bidIdx: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
        ]);
        return;
    }

    let ghafMarketPlace = GhafMarketPlace.bind(event.address);

    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        log.error('GhafMarketPlace not found at handleBidRevoked with Nft txid: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString(),
        ]);
        return;
    }

    let nftCapture = ghafMarketPlace.nfts(event.params.nftContractAddress, event.params.tokenId);

    nft.hasAccepted = nftCapture.getHasAccepted();

    if (bid.isAccepted) {
        nft.hasAccepted = false;
        nft.isListed = false;
        nft.acceptedBid = null;
    }

    nft.save();

    bid.isRevoked = true;
    bid.isUsed = true;
    bid.isAccepted = false;
    bid.timeStamp = event.block.timestamp;
    bid.transactionHash = event.transaction.hash.toHexString();
    bid.save();
}

export function handleNewBid(event: NewBidEvent): void {
    let bid = Bid.load(
        event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
    ); //bid ID

    if (!bid) {
        bid = new Bid(
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString() + '_' + event.params.bidIdx.toHex(),
        ); //bid ID

        handleGlobal('totalBidItem');
    }

    let user = User.load(event.params.buyer.toHexString()); //bider ID
    if (!user) {
        user = new User(event.params.buyer.toHexString());
    }
    user.save();
    
    bid.isAccepted = false;
    bid.isRevoked = false;
    bid.isCanceled = false;
    bid.isUsed = false;
    bid.nft = event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString();
    bid.bidder = user.id;
    bid.seller = event.params.seller.toHexString();
    bid.bidAmount = event.params.bidAmount;
    bid.bidAmountsHistory = [event.params.bidAmount];
    bid.paymentToken = event.params.paymentToken.toHexString();
    bid.timeStamp = event.block.timestamp;
    bid.transactionHash = event.transaction.hash.toHexString();
    bid.save();
}

export function handleNftListed(event: NftListedEvent): void {
    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        nft = new Nft(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID
        handleGlobal('totalNftItem');
    }

    let user = User.load(event.params.seller.toHexString());
    if (!user) {
        user = new User(event.params.seller.toHexString());
    }
    user.save();
    nft.isSold = false;
    nft.hasAccepted = false;
    nft.fee = ZERO_BI;
    nft.isListed = true;
    nft.seller = user.id;
    nft.buyer = null;
    nft.nftContractAddress = event.params.nftContractAddress.toHexString();
    nft.tokenId = event.params.tokenId.toString().toString();
    nft.timeStamp = event.block.timestamp;
    nft.transactionHash = event.transaction.hash.toHexString();
    nft.buyType = event.params.buyType.toString();
    nft.save();
}

export function handleNftSold(event: NftSoldEvent): void {
    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        log.error('GhafMarketPlace not found at handleNftDelisted with Nft txid: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString(),
        ]);
        return;
    }

    nft.isSold = true;
    nft.isListed = false;
    nft.fee = event.params.fee;
    nft.buyer = event.params.buyer.toString();
    nft.fee = event.params.fee;
    nft.payAmount = event.params.payAmount;
    nft.paymentToken = event.params.paymentToken.toHexString();
    nft.buyType = event.params.buyType.toString();
    nft.timeStamp = event.block.timestamp;
    nft.transactionHash = event.transaction.hash.toHexString();

    nft.save();


    let offer = Offer.load(event.transaction.hash.toHexString()); //offer ID
    if (!offer) {
        offer = new Offer(event.transaction.hash.toHexString()); //offer ID
    }
    offer.buyer = event.params.buyer.toString();
    offer.seller = nft.seller;
    offer.nft = event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString();
    offer.payAmount = event.params.payAmount;
    offer.paymentToken = event.params.paymentToken.toHexString();
    offer.buyType = event.params.buyType.toString();
    offer.timeStamp = event.block.timestamp;
    offer.transactionHash = event.transaction.hash.toHexString();

    offer.save();
}

export function handleNftDelisted(event: NftDelistedEvent): void {
    let nft = Nft.load(event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString()); //Nft ID

    if (!nft) {
        log.error('GhafMarketPlace not found at handleNftDelisted with Nft txid: {}', [
            event.params.nftContractAddress.toHex() + '_' + event.params.tokenId.toString(),
        ]);
        return;
    }

    nft.isListed = false;
    nft.hasAccepted = false;
    nft.acceptedBid = null;
    nft.timeStamp = event.block.timestamp;
    nft.transactionHash = event.transaction.hash.toHexString();

    nft.save();
}
