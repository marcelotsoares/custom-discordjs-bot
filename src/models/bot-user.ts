import { getModelForClass, prop } from '@typegoose/typegoose';

export class Transaction {
    @prop()
    public hash: string;

    @prop()
    public ts: Date;

    @prop()
    public chain: string;

    @prop()
    public token: string;

    @prop()
    public amount: number;

    @prop({ default: 0 })
    public status: number;

    @prop()
    public blockNumber?: number;
}

export class InventoryItem {
    @prop()
    itemId: string;

    @prop()
    qtd: number;
}

export class MembershipService {
    @prop()
    public active: boolean;

    @prop()
    public expiration: Date;

    @prop()
    public region: string;

    @prop({ type: () => [Transaction] })
    public transactions: Transaction[];
}

export class Services {
    @prop({ type: () => MembershipService })
    membership?: MembershipService;
}

export class BotUser {
    @prop({ unique: true })
    public discordId: string;

    @prop({ index: true })
    public discordName: string;

    @prop({ index: true })
    public xp: number;

    @prop({ index: true })
    public level: number;

    @prop({ index: true })
    public coins: number;

    @prop({ type: () => [InventoryItem], required: true, default: [] })
    public inventory!: InventoryItem[];
}

export const BotUserModel = getModelForClass(BotUser, {
    schemaOptions: {
        timestamps: true,
        collection: 'users',
        strictQuery: true,
    },
});
