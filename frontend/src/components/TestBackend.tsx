import { useState } from "react"

type PredictionResult = {
    label_id: number
    label: string
    scores: {
        Positive: number
        Notr: number
        Negative: number
    }
}

const BACKEND_URL = "http://127.0.0.1:8000/predict"

export const TestBackend = () => {
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [result, setResult] = useState<PredictionResult | null>(null)

    async function handleSend() {
        if (!text.trim()) {
            setError("Lütfen bir cümle yaz.")
            setResult(null)
            return
        }

        setError("")
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            })

            if (!res.ok) {
                throw new Error("Backend isteği başarısız oldu")
            }

            const data = await res.json()
            setResult(data)
        } catch (e: any) {
            setError(e.message || "Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 items-center justify-center p-8 w-full">
            <h1 className="text-3xl font-semibold">Backend Test</h1>

            <div className="flex flex-col gap-4 w-full max-w-xl">
                <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={4}
                    placeholder="Modelin yorumlamasını istediğin cümleyi yaz..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {loading ? "Gönderiliyor..." : "Gönder ve Tahmin Al"}
                </button>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                {result && (
                    <div className="mt-4 rounded-md border p-4 space-y-3">
                        <p className="text-lg font-semibold">
                            Sonuç: {result.label} (id: {result.label_id})
                        </p>
                        <div className="text-sm space-y-1">
                            <p>Positive: {result.scores.Positive.toFixed(4)}</p>
                            <p>Notr: {result.scores.Notr.toFixed(4)}</p>
                            <p>Negative: {result.scores.Negative.toFixed(4)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
