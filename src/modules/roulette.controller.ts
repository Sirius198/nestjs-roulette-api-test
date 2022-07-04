import { Body, Controller, Get, Req, Param, Post, Patch, Delete, Res } from '@nestjs/common';
import { AppService } from '../app.service';
import { Request, response } from 'express';
import { BetProperty, CreateRoulette, SpinRolutte } from './roulette.dto';
import { JWTHelper } from 'src/utils/jwt';
import { Response } from 'express';
import { randomInt } from 'crypto';
import { RouletteService } from './roulette.service';
import constants from 'src/constants';

declare module "express-session" {
    interface Session {
        gameMode: string;
        startBalance: number;
        endBalance: number;
    }
}

@Controller()
export class RouletteController {
    constructor(private readonly appService: AppService, private rouletteService: RouletteService) { }

    @Post('/create')
    public async createGame(@Req() request: Request, @Res() res: Response, @Body() body: CreateRoulette) {

        const { gameMode, token } = body;
        let startBalance;
        if (gameMode == 'normal') {
            try {
                let data: any = await JWTHelper.verify(token);

                if (data.balance == undefined)
                    return res.status(500).send({ message: 'Invalid token' });
                if (body.balance != undefined)
                    return res.status(500).send({ message: 'Found balance' });

                startBalance = data.balance;
            } catch (e) {
                return res.status(404).send({ message: e.message });
            }
        }
        else if (gameMode == 'testing') {
            startBalance = body.balance;
            if (startBalance == undefined)
                return res.status(500).send({ message: 'No balance' });
        }
        else {
            // Exception
            return res.status(404).send({ message: 'Invalid gameMode' });
        }

        // Store gameMode and startBalance to session
        request.session.gameMode = gameMode;
        request.session.startBalance = startBalance;
        request.session.endBalance = startBalance;
        request.session.save();

        return res.status(200).send({ status: 'success' });
    }

    @Patch('/spin')
    spin(@Req() request: Request, @Res() res: Response, @Body() body: SpinRolutte) {

        const { betInfo } = body;
        const { endBalance, gameMode } = request.session;
        let winningNumber: number;

        if (endBalance == undefined || gameMode == undefined)
            return res.status(500).send({ message: 'No session' });
        if (betInfo == undefined)
            return res.status(500).send({ message: 'No bet info' });

        // Check balance
        if (!this.rouletteService.checkBalance(betInfo, endBalance))
            return res.status(404).send({ message: 'No enough balance' });

        // Generate random winning number
        if (gameMode == 'normal') {
            if (body.winningNumber != undefined)
                return res.status(500).send({ message: 'Found winningNumber' });
            winningNumber = randomInt(37);
        }
        else {
            if (body.winningNumber != undefined)
                winningNumber = body.winningNumber;
            else
                winningNumber = randomInt(37);
        }

        let spinResult = this.rouletteService.spin(betInfo, endBalance, winningNumber);

        // Determine win sum
        // Update balance
        // return new balance
        request.session.endBalance = spinResult.endBalance;

        return res.status(200).json(spinResult);
    }

    @Delete('/end')
    end(@Req() request: Request, @Res() res: Response) {

        const { startBalance, endBalance } = request.session;

        if (!startBalance || !endBalance)
            return res.status(500).json({ message: 'No session' });

        request.session.destroy((err) => { });
        return res.status(200).json({ startBalance, endBalance });
    }
}
