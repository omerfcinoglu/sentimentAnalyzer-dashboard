import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { isValidYoutubeUrl } from "@/lib/validators"

export const Dashboard = () => {
    const [value, setValue] = useState("")
    const [error, setError] = useState(false)

    const handleAnalyze = () => {
        if (!isValidYoutubeUrl(value)) {
            setError(true)
            return
        }
        setError(false)
        console.log("Valid YouTube URL:", value)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue(val)
        if (error) setError(false)
    }

    return (
        <div className="flex flex-row gap-4 p-4 max-w-3xl mx-auto">
            <Input
                placeholder="paste youtube video link to analyze"
                value={value}
                onChange={handleInputChange}
                aria-invalid={error}
            />
            <Button variant="default" onClick={handleAnalyze}>
                Analyze
            </Button>
        </div>
    )
}
