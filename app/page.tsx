"use client";

import { useState, useEffect } from "react";

export default function Home() {
    const [valor, setValor] = useState("");
    const [resposta, setResposta] = useState<any>(null);
    const [link, setLink] = useState<string>("");
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        document.title = "Gerar Pagamento PIX";
    }, []);

    async function criarPix(e: React.FormEvent) {
        e.preventDefault();
        setResposta(null);
        const r = await fetch("/api/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor }),
        });
        const data = await r.json();
        setResposta(data);
        setCopiado(false);
    }

    async function copiarCopiaECola() {
        if (!resposta?.copiaECola) return;
        try {
            await navigator.clipboard.writeText(resposta.copiaECola);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
        } catch {
            // fallback invisível; poderia selecionar e copiar via execCommand se precisar
            setCopiado(false);
        }
    }

    return (
        <main className="page">
            <section className="card">
                <header className="cardHeader">
                    <h1>Gerar Pagamento</h1>
                    <p>
                        Informe o valor e gere o QR Code PIX. Copie o código “copia e cola”
                        com um clique.
                    </p>
                </header>

                <form onSubmit={criarPix} className="form">
                    <label className="label">
                        <span>Valor (R$)</span>
                        <input
                            type="number"
                            step="0.01"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="Ex: 49.90"
                            required
                            className="input"
                        />
                    </label>

                    <div className="actions">
                        <button type="submit" className="btnPrimary">
                            Gerar Pagamento
                        </button>
                    </div>
                </form>

                {resposta?.qrBase64 && (
                    <section className="result">
                        <h3>QR Code PIX</h3>
                        <img
                            className="qr"
                            src={`data:image/png;base64,${resposta.qrBase64}`}
                            alt="QR PIX"
                        />

                        {resposta.copiaECola && (
                            <div className="copyBox">
                                <label className="copyLabel">Copia e Cola</label>

                                <div className="copyRow">
                  <textarea
                      readOnly
                      rows={4}
                      value={resposta.copiaECola}
                      className="textarea"
                  />
                                    <button
                                        type="button"
                                        onClick={copiarCopiaECola}
                                        className={`btnCopyIcon ${copiado ? "copiado" : ""}`}
                                        aria-label="Copiar chave PIX"
                                        title="Copiar chave PIX"
                                    >
                                        <img
                                            src="/icons/copy-icon.svg"
                                            alt="Copiar"
                                            className="iconCopy"
                                        />
                                    </button>

                                </div>
                            </div>
                        )}
                    </section>
                )}

                {link && (
                    <section className="result">
                        <h3>Link de pagamento</h3>
                        <a href={link} target="_blank" rel="noreferrer" className="link">
                            {link}
                        </a>
                    </section>
                )}
            </section>

            {/* RESET GLOBAL pra remover a “borda branca” da página */}
            <style jsx global>{`
                html,
                body,
                #__next {
                    height: 100%;
                }
                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #0b2a24;
                }
            `}</style>

            <style jsx>{`
                .btnCopyIcon {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.15s ease;
                }

                .btnCopyIcon:hover {
                    transform: scale(1.1);
                }

                .iconCopy {
                    width: 28px;
                    height: 28px;
                    filter: invert(67%) sepia(16%) saturate(745%) hue-rotate(291deg)
                    brightness(90%) contrast(85%);
                }

                .copiado .iconCopy {
                    filter: invert(48%) sepia(88%) saturate(353%) hue-rotate(94deg)
                    brightness(95%) contrast(90%);
                }

                .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: radial-gradient(
              1200px 600px at 20% 30%,
              #063e33 0%,
              rgba(6, 62, 51, 0) 60%
            ),
            radial-gradient(
              1200px 700px at 80% 10%,
              #0a5c48 0%,
              rgba(10, 92, 72, 0) 55%
            ),
            #0b2a24;
          color: #eaf5f1;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, "Helvetica Neue", Arial;
        }

        .card {
          width: 100%;
          max-width: 900px;
          border-radius: 20px;
          padding: 28px;
          background: rgba(16, 32, 30, 0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
        }

        .cardHeader h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: 0.2px;
        }

        .cardHeader p {
          margin: 0 0 24px;
          color: #cfe7e0;
          font-size: 18px;
        }

        .form {
          display: grid;
          gap: 16px;
        }

        .label span {
          display: block;
          margin-bottom: 8px;
          color: #d8efe8;
          font-weight: 600;
          font-size: 18px;
        }

        .input {
          width: 80%;
          padding: 18px 20px;
          font-size: 18px;
          border-radius: 14px;
          color: #eaf5f1;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.03)
          );
          border: 1px solid rgba(255, 255, 255, 0.14);
          outline: none;
        }
        .input::placeholder {
          color: #9fc1b8;
        }

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btnPrimary {
          appearance: none;
          border: none;
          cursor: pointer;
          padding: 14px 22px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          color: #0f2a23;
          background: #10b981; /* verde do botão */
          box-shadow: 0 8px 18px rgba(16, 185, 129, 0.35);
          transition: transform 0.06s ease, box-shadow 0.2s ease;
        }
        .btnPrimary:active {
          transform: translateY(1px);
        }

        .result {
          margin-top: 28px;
        }
        .result h3 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #eaf5f1;
        }

        .qr {
          width: 200px;
          height: 200px;
          border-radius: 12px;
          background: #0e201c;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .copyBox {
          margin-top: 16px;
        }
        .copyLabel {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #d8efe8;
        }

        .copyRow {
          display: flex;
          gap: 10px;
          align-items: stretch;
          width: 100%;
          max-width: 900px;
        }

        .textarea {
          flex: 1;
          min-height: 110px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: #eaf5f1;
          resize: vertical;
        }

        .btnCopy {
          white-space: nowrap;
          padding: 0 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: #eaf5f1;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btnCopy:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .link {
          word-break: break-all;
          color: #9ae6c9;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .input {
            width: 100%;
          }
          .copyRow {
            flex-direction: column;
          }
          .btnCopy {
            height: 44px;
          }
        }
      `}</style>
        </main>
    );
}
