import { Header } from "./header"
import { BackButton } from "./back-button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CardWrapper } from "./card-wrapper"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export const ErrorCard = () => {
    return (
        <CardWrapper headerLabel="Oops! Something went wrong" backButtonLabel="Back to login" backButtonHref="/auth/login">
            <div className="w-full flex flex-col items-center justify-center gap-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                <p className="text-sm text-gray-500">
                    We are unable to process your request at the moment. Please try again later.
                </p>
            </div>
        </CardWrapper>
    )
}