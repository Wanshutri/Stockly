import InventoryIcon from '@mui/icons-material/Inventory';

export default function HomeStock() {
    return (
        <div className="shadow-md p-5 w-full rounded-xl bg-white hover:bg-gray-100 hover:shadow-lg transition-[background-color,box-shadow] duration-300">
            <div className="grid grid-cols-[30%_1fr] grid-rows-3 gap-0">

                {/* div1: ocupa todas las filas de la primera columna */}
                <div className="col-span-1 row-span-3 flex flex-col items-center justify-center p-4">
                    <div className='bg-blue-200 p-3 rounded-full'>
                        <InventoryIcon fontSize='large' color='primary'></InventoryIcon>
                    </div>
                </div>

                {/* div2: fila 1, columna 2 */}
                <div className="col-start-2 row-start-1">
                    <h3 className='text-md font-semibold text-gray-500 '>Stock</h3>
                </div>

                {/* div3: fila 2, columna 2 */}
                <div className="col-start-2 row-start-2">
                    <h4 className='text-2xl font-bold'>
                        3 Productos
                    </h4>
                </div>
                {/* div4: fila 3, columna 2 */}
                <div className="col-start-2 row-start-3">
                    <p className='text-sm text-red-600 font-medium'>Requieren Reposicion</p>
                </div>

            </div>
        </div>
    )
}
