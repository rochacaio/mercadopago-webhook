import axios from "axios";
import {pool} from "../db";
type messageProps = {
    message: string,
    users: number[],
}

class ReceivePaymentService {

    async index(data: object): Promise<{ message: string, data?: object }> {
        // @ts-ignore
        if (data.type === "payment" && data?.id) {
            // @ts-ignore
            const paymentId = data.data.id;
            try {
                const response = await axios.get(`${process.env.MP_URL}payments/${paymentId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            });

            const payment = response.data;
            const value = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(payment.transaction_amount);

                const users = await this.getUsersToNotificate();

                if(users.length > 0 && payment.status === 'approved') {
                    await this.sendTelegramMessage({
                        message: `Pagamento no valor de ${value} recebido`,
                        users,
                    })
                }

                return {message: "mensagem enviada!", data: payment}
            } catch (error) {
                console.log('Erro ao capturar pagamento:', error);
            }
        }

        return { message: "mensagem enviada!" };
    }

    async getUsersToNotificate(): Promise<number[]> {
        try {
            const { rows } = await pool.query(`SELECT * FROM telegram_users ORDER BY register_date DESC`);

            const userIds: number[] = [];

            if (rows.length > 0) {
                rows.forEach((update: any) => {
                    const userId = update.chat_id;
                    if (userId && !userIds.includes(userId)) {
                        userIds.push(userId);
                    }
                });
            } else {
                console.log('Nenhuma interação encontrada ainda.');
            }
            return userIds;

        } catch (error) {
            // @ts-ignore
            return error.message;
        }
    }

    async sendTelegramMessage(data: messageProps): Promise<void> {
        const telegramApiUrl = `${process.env.TELEGRAM_URL}${process.env.TELEGRAM_AUTH_TOKEN}/sendMessage`;

        for (const userId of data.users) {
            // if([8069348563].includes(userId)) continue;
            const params = {
                chat_id: userId,
                text: data.message,
            };

            try {
                await axios.post(telegramApiUrl, params);
                console.log(`Mensagem enviada para o usuário ${userId}`);
            } catch (error) {
                console.error('Erro ao enviar mensagem para o Telegram:', error);
            }
        }
    }

    async createPayment(value: number): Promise<Object> {
        const resp = await axios.post(
            `https://api.mercadopago.com/v1/payments`,
            {
                transaction_amount: Number(value),
                description: "Pagamento PIX",
                payment_method_id: "pix",
                external_reference: `new-pix-${Date.now()}`,
                notification_url: process.env.WEBHOOK_URL,
                installments: 1,
                payer: {
                    email: "minerocoins@example.com",
                    first_name: "Mineiro",
                    last_name: "Coins",
                    identification: {
                        type: "CPF",
                        number: "12345678909"
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': crypto.randomUUID(),
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
                },
            }
        );

        const payment = resp.data;
        const qrBase64 = payment.point_of_interaction.transaction_data.qr_code_base64;
        const copiaECola = payment.point_of_interaction.transaction_data.qr_code;
        const paymentId = payment.id;

        return { paymentId, qrBase64, copiaECola, status: payment.status };
    }

    async createUser(data: object): Promise<Object> {
        // @ts-ignore
        const message = data.message;

        if (message?.chat?.id) {
            console.log("Mensagem recebida de:", message.chat.id);
            console.log("Texto:", message.text);

            const chatId = String(message.chat.id);
            const name = message.chat.first_name
                ? `${message.chat.first_name} ${message.chat.last_name || ""}`.trim()
                : null;
            const phoneNumber = message.contact?.phone_number || null;

            await pool.query(
                `INSERT INTO telegram_users (chat_id, name, phone_number) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (chat_id) DO UPDATE SET 
       name = EXCLUDED.name,
       phone_number = EXCLUDED.phone_number`,
                [chatId, name || null, phoneNumber || null]
            );
        }

        return {ok: 200, message: "usuário criado com sucesso!"};
    }

}

export { ReceivePaymentService };