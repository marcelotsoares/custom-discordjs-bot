export interface IPaymentServices {
    message: string;
    hash?: string;
    blockNumber?: string;
    amount?: number;
    success: boolean;
    role?: string;
}
