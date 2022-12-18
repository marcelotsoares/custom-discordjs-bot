import { UserModel } from "./user";

export interface IMarketplace {
	discordId: string;
	itemId: string;
	itemName: string;
	description: string;
	price: number;
}

export interface ITryBuyOnMarketplace extends IMarketplace {
	user: UserModel
	itemConfig: MarketplaceItemsConfig
}

export type BuyOnMarketplace = Pick<ITryBuyOnMarketplace, 'user' | 'itemConfig'>

export type MarketplaceItemsConfig = Pick<IMarketplace, 'itemId' | 'itemName' | 'description' | 'price'>

export type PurchaseDataMarketplace = Partial<Pick<IMarketplace, 'itemId' | 'discordId' | 'price'>>

export type BuyerDataMarketplace = Required<Pick<PurchaseDataMarketplace, 'itemId' | 'discordId'>>

export interface IMarketplaceConfig {
	items: Array<MarketplaceItemsConfig>
}