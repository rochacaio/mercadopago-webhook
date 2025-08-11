import { Router } from "express";
// @ts-ignore
import { WebHookController } from "./controllers/WebHookController";
import {pool} from "./db";


const router = Router();

const webHookController = new WebHookController();

router.post('/receive-payment',webHookController.handle)
router.get('/receive-payment', (_req, res) => res.status(200).send('ok'));

router.post('/create-payment',webHookController.createPix)
router.post("/saveContact", webHookController.saveUser);
router.get("/telegram-users", async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM telegram_users ORDER BY register_date DESC`);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar usuários:", (err as Error).message);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});


export { router }