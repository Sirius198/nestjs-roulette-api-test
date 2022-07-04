import { Injectable } from '@nestjs/common';
import { start } from 'repl';
import { BetProperty, BetResult } from './roulette.dto';

@Injectable()
export class RouletteService {
    // create(gameMode: string, startBalance: number) { }
    checkBalance(bets: BetProperty[], balance: number): boolean {
        let sum: number = 0;
        for (let i = 0; i < bets.length; i++)
            sum += bets[i].betAmount;
        if (balance < sum)
            return false;
        return true;
    }

    spin(bets: BetProperty[], startBalance: number, winningNumber: number): BetResult {

        let betResult = new BetResult;
        betResult.winning = [];

        for (let i = 0; i < bets.length; i++) {

            switch (bets[i].betType) {
                case 'odd':
                    if (winningNumber % 2 == 1) {
                        betResult.winning.push(bets[i]);
                    }
                    startBalance -= bets[i].betAmount;
                    break;
                case 'even':
                    if (winningNumber % 2 == 0) {
                        betResult.winning.push(bets[i]);
                    }
                    startBalance -= bets[i].betAmount;
                    break;

                default: // number bet
                    if (winningNumber === bets[i].betType) {
                        betResult.winning.push(bets[i]);
                    }
                    startBalance -= bets[i].betAmount;
                    break;
            }
        }

        betResult.endBalance = startBalance;

        return betResult;
    }
}
