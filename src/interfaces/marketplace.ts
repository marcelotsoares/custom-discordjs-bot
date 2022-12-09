interface IMarketplace {
	itemId: string;
	itemName: string;
	description: string;
	price: number;
    discordId?: string;
}

interface IMarketplaceMenuItems {
	items: Array<IMarketplace>
}