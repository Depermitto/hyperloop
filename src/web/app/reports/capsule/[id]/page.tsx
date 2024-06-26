"use client";
import React from "react";
import "@/app/globals.css";
import ReportTopBar from "@/components/reportTopBar";
import CapsuleRoutes from "@/components/capsuleRoutes";
import CapsuleRepairs from "@/components/capsuleRepairs";
import prisma from "@/client";

const GenerateCapsuleReport = ({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { [key: string]: string }
}) => {
    const [name, setName] = React.useState({producer: "", model: ""});
    React.useEffect(() => {
        fetch(`/api/capsules/getCapsule?id=${params.id}`).then((response) => response.json()).then((data) => {
            setName({producer: data.data.producer, model: data.data.model});
        });
    }, []);
    return (
        <>
            <div className="max-w-2xl mx-auto">
                <ReportTopBar type="capsule" target={name!.producer+" "+name!.model+" (ID: "+params.id+")"}  />
                <CapsuleRoutes id={params.id} from={searchParams.from} to={searchParams.to}/>
                <CapsuleRepairs id={params.id} from={searchParams.from} to={searchParams.to}/>
            </div>
        </>
    );
};

export default GenerateCapsuleReport;

export const dynamic = 'force-dynamic';