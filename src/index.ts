import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.type === "payment" && body.data?.id) {
        try {
            const paymentId = body.data.id;
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            });

            const payment = response.data;
            if (payment.status === "approved") {
                console.log(`✅ Pagamento aprovado de R$ ${payment.transaction_amount}`);
                // Aqui você pode salvar no banco, enviar notificação, etc.
            }
        } catch (err) {
            console.error("Erro ao consultar pagamento:", err);
        }
    }

    res.status(200).json({ status: "received" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Webhook rodando na porta ${port}`);
});
