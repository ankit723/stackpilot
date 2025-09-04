"use client";
import { CardWrapper } from "./card-wrapper";
import {BeatLoader} from 'react-spinners'
import { useSearchParams } from "next/navigation";
import { apiRoutePrefix } from "@/routes";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/app/actions/auth/new-verification";
import {FormError} from "@/app/components/form-error";
import {FormSuccess} from "@/app/components/form-success";


export const NewVerificationForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = useCallback(async () => {
        if(error || success) return;
        
        if(!token) {
            setError("Invalid token!");
            return;
        };

        const {error: newError, success: newSuccess} = await newVerification(token);
        console.log(newError, newSuccess);

        if(newError) {
            setError(newError);
        }

        if(newSuccess) {
            setSuccess(newSuccess);
        }

    }, [token, error, success]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <CardWrapper headerLabel="Confirm your email" backButtonLabel="Back to login" backButtonHref="/auth/login">
            <div className="flex items-center justify-center w-full">
                {!error && !success && <BeatLoader color="#000" size={20} />}
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
            </div>
        </CardWrapper>
    );
};