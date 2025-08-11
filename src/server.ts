// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import next from "next";

import { router } from "./routes";
import { initDb } from "./initDb";

dotenv.config();

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

(async () => {
    try {
        // Prepara o Next primeiro
        await nextApp.prepare();

        // Sobe o Express
        const app = express();

        app.use(cors());
        app.use(express.json());

        // 🚩 Monte suas APIs sob /api para não colidir com rotas do Next
        app.use("/api", router);

        // Middleware de erro só para as rotas da API
        app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
            if (err instanceof Error) {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ status: "Error", message: "Internal server error" });
        });

        // Tudo que não é /api vai para o Next (páginas, assets, etc.)
        app.all("*", (req, res) => handle(req, res));

        await initDb();
        console.log("✅ Banco de dados pronto");

        app.listen(port, () => {
            console.log(`🚀 Next + Express rodando em http://localhost:${port}`);
        });
    } catch (err) {
        console.error("❌ Falha ao iniciar o servidor:", err);
        process.exit(1);
    }
})();
