import { BarChart } from '@mui/x-charts/BarChart';

interface StocklyBarChartProps {
    titulo: string
    labels?: string[]
    values?: number[]
}

export default function StocklyBarChart({ titulo, labels = ['A', 'B', 'C'], values = [2, 5, 3] }: StocklyBarChartProps) {
    return (
        <div className='grid'>
            <div className='mx-auto'>
                <h2>{titulo}</h2>
            </div>

            <div>
                <BarChart
                    xAxis={[
                        {
                            id: 'barCategories',
                            data: labels,
                        },
                    ]}
                    series={[
                        {
                            data: values,
                        },
                    ]}
                    height={300}
                />
            </div>
        </div>
    )
}
