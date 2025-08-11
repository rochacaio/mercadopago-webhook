import {json, Request, Response} from "express";
import { ReceivePaymentService } from "../services/ReceivePaymentService";

class WebHookController{
    async handle(request: Request,response: Response){
        const teste = request.body;
        const receivePaymentService = new ReceivePaymentService();

        const get_payment = await receivePaymentService.index(teste);

        return response.json(get_payment);
    }

    async createPix(request: Request,response: Response) {
        try {

            const { valor } = request.body;

            const receivePaymentService = new ReceivePaymentService();

            const createdPayment = await receivePaymentService.createPayment(valor);

            return response.json(createdPayment);
        } catch (err: any) {
            console.error(err?.response?.data || err.message);
            return response.status(500).json({ error: "Falha ao criar PIX" });
        }
    }

    async saveUser(request: Request,response: Response) {
            const data = request.body;

        const receivePaymentService = new ReceivePaymentService();

        const createdUser = await receivePaymentService.createUser(data);

        return response.json(createdUser);
    }

}

export { WebHookController };