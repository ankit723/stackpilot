import { CheckCircleIcon } from "lucide-react";

interface FormSuccessProps {  
    message: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
    if (!message) return null;
    return (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            <p className="text-sm">{message}</p>
        </div>
    )
}