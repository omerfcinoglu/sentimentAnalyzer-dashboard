import { columns, type Payment } from './columns'
import { DataTable } from './data-table'

function getData(): Payment[] {
    // Fetch data from your API here.
    return [
        {
            id: "728ed52f",
            amount: 100,
            status: "pending",
            email: "m@example.com",
        },
        // ...
    ]
}

export const AnalysisTable = () => {
    const data = getData()

    return (
        <div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
