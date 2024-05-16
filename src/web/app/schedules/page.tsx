import React from "react";
import "../globals.css";
import Sidebar from "@/components/sidebar";
import Schedule from "@/components/schedule";
import prisma from "../client"
import AddScheduleForm from "@/components/addScheduleForm";

const Schedules = async () => {
    const schedules = await prisma.schedule.findMany();

    return (
        <>
            <h1 className="text-center">Schedules</h1>
            <Sidebar />
            <AddScheduleForm />
            <div className="hyperloop-grid">
                {schedules.map((s) => <Schedule key={s.schedule_id} {...s} />)};
            </div>
        </>
    );
};

export default Schedules;

export const dynamic = 'force-dynamic';