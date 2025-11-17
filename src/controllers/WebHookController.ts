import { Request, Response } from "express";
import { ReceivePaymentService } from "../services/ReceivePaymentService";
import AbacatePay from "abacatepay-nodejs-sdk";
import {
    CreateCustomerData,
    CreatePixQrCodeData,
} from "abacatepay-nodejs-sdk/dist/types";

class WebHookController {
    async handle(request: Request, response: Response) {
        const teste = request.body;
        const receivePaymentService = new ReceivePaymentService();

        const get_payment = await receivePaymentService.index(teste);

        return response.json(get_payment);
    }

    async createPix(request: Request, response: Response) {
        try {
            const { valor } = request.body;

            const valorNumber = Number(valor);

            if (Number.isNaN(valorNumber) || valorNumber <= 0) {
                return response.status(400).json({ error: "Valor inválido" });
            }

            // ATÉ 80 → MERCADO PAGO (fluxo antigo)
            if (valorNumber <= 80) {
                const receivePaymentService = new ReceivePaymentService();

                const createdPayment = await receivePaymentService.createPayment(
                    valorNumber
                );

                return response.json({
                    provider: "mercadopago",
                    ...createdPayment,
                });
            }

            // ACIMA DE 80 → ABACATE PAY
            const abacatePay = AbacatePay(
                process.env.ABACATEPAY_API_KEY || "abc_dev_yh6gyJaxbQP1qdxrjtRZMa0r"
            );

            const customer: CreateCustomerData = {
                name: "Thiago de Sousa Gomes Pimenta",
                email: "tsgpmarketing@gmail.com",
                taxId: "02211353673",
                cellphone: "35991625015",
            };

            const data: CreatePixQrCodeData = {
                amount: Math.round(valorNumber * 100), // VALOR EM CENTAVOS!
                description: "Pagamento acima de 80",
                customer,
                expiresIn: 3600
            };

            type AbacatePixResponse = {
                error: string | null;
                data?: {
                    id: string;
                    status: string;
                    brCode: string;
                    brCodeBase64: string;
                    amount: number;
                    devMode: boolean;
                    customerId: string;
                    description: string;
                    createdAt: string;
                    updatedAt: string;
                    expiresAt: string;
                };
            };

            const pixAbacate = (await abacatePay.pixQrCode.create(data)) as AbacatePixResponse;

            console.dir(pixAbacate, { depth: null });

            if (pixAbacate.error || !pixAbacate.data) {
                return response.status(400).json({
                    provider: "abacatepay",
                    error: pixAbacate.error ?? "Erro ao criar cobrança PIX",
                });
            }

            const pixData = pixAbacate.data;

            return response.json({
                provider: "abacatepay",
                paymentId: pixData.id,
                status: pixData.status,
                qrBase64: pixData.brCodeBase64,
                copiaECola: pixData.brCode,
                amount: pixData.amount,
                devMode: pixData.devMode,
            });
        } catch (err: any) {
            console.error("Erro ao criar PIX AbacatePay:");
            console.error(err?.response?.data || err.message || err);
            return response.status(500).json({ error: "Falha ao criar PIX" });
        }
    }

    async saveUser(request: Request, response: Response) {
        const data = request.body;

        const receivePaymentService = new ReceivePaymentService();

        const createdUser = await receivePaymentService.createUser(data);

        return response.json(createdUser);
    }

}

export { WebHookController };
