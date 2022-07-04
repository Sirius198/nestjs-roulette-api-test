
export abstract class CreateRoulette {
    gameMode: string;
    balance?: string;
    token?: string;
};

export abstract class SpinRolutte {
    betInfo: BetProperty[];
    winningNumber?: number;
};

export abstract class BetProperty {
    betAmount: number;
    betType: number | string;
};

export class BetResult {
    endBalance: number;
    winning: BetProperty[];
}