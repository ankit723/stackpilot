import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {  
    message: string;
}

export const FormError = ({ message }: FormErrorProps) => {
    if (!message) return null;
    return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <p className="text-sm">{message}</p>
        </div>
    )
}