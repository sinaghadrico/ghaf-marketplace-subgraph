import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { GhafMarketPlaceDetail } from "../generated/schema";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export let ADDRESS_U = "0x1000000000000000000000000000000000000001";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

export function handleGlobal(key: string,value:BigInt=ZERO_BI) :boolean{
    let ghafMarketPlaceDetail = GhafMarketPlaceDetail.load(ADDRESS_ZERO);
        // check for existence
        if (!ghafMarketPlaceDetail) {
            ghafMarketPlaceDetail = new GhafMarketPlaceDetail(ADDRESS_ZERO);
            ghafMarketPlaceDetail.totalNftItem = ZERO_BI;
            ghafMarketPlaceDetail.totalBidItem = ZERO_BI;
        }
        if(key==="totalNftItem")  ghafMarketPlaceDetail.totalNftItem = ghafMarketPlaceDetail.totalNftItem.plus(ONE_BI);
        if(key==="totalBidItem")  ghafMarketPlaceDetail.totalBidItem = ghafMarketPlaceDetail.totalBidItem.plus(ONE_BI);
      
        ghafMarketPlaceDetail.save();
        return true
   
};