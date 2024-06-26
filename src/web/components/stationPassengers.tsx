"use client";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import React from "react";

const getTableContent = (data: any) => {
    var rows = [];
    for (let i = 0; i < data.length; i++) {
        const log_date = new Date(data[i].date);
        rows.push(
            <TableRow key={log_date.toString()}>
                <TableCell>{log_date.toLocaleDateString("pl-PL", {timeZone: "UTC"})}</TableCell>
                <TableCell>{data[i]._sum.passengers_served}</TableCell>
            </TableRow>
        );
    }
    return rows;
}

const StationPassengers = ({
    id,
    from,
    to
}: {
    id: string;
    from: string;
    to: string;
}) => {
    const [passengers, setPassengers] = React.useState({data: []});
    const [tableContent, setTableContent] = React.useState<any>([]);
    React.useEffect(() => {
        fetch(`/api/reports/getStationPassengers?id=${id}&from=${from}&to=${to}`).then((response) => response.json()).then((data) => {
            setPassengers(data);
        });
    }, []);
    React.useEffect(() => {
        setTableContent(getTableContent(passengers.data));
    }, [passengers]);
    return (
        <div>
            <h3>Passengers</h3>
            <Table>
                <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Number of passengers</TableColumn>
                </TableHeader>
                <TableBody>
                    {tableContent}
                </TableBody>
            </Table>
        </div>
    )
};

export default StationPassengers;

export const dynamic = 'force-dynamic';