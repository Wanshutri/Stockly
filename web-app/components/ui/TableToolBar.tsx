import { Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger, ExportCsv, ExportPrint } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { useRef, useState, cloneElement, isValidElement } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenPopUp from '../forms/DeleteConfirmUser';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BodegaNewItemButton from './bodega/BodegaNewItemButton';

interface TableToolbarProps {
    rowsSelected: any[];
    handleUpdate: () => void;
    title: string;
    formulario?: React.ReactNode;
    url: string;
    deletionKey: string;
}

export default function TableToolbar({
    rowsSelected,
    handleUpdate,
    title,
    formulario,
    url,
    deletionKey
}: TableToolbarProps) {
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuTriggerRef = useRef<HTMLButtonElement>(null);

    // Si se recibió un formulario (React element), lo clonamos e inyectamos onSuccess
    let formularioConOnSuccess: React.ReactNode = formulario;
    if (isValidElement(formulario)) {
        formularioConOnSuccess = cloneElement(formulario as React.ReactElement<any>, {
            item: undefined, // for new item creation ensure item is undefined
            onSuccess: () => {
                handleUpdate();
            }
        });
    }

    return (
        <Toolbar>
            <div className='mr-auto ml-2'>
                <BodegaNewItemButton title={title} children={formularioConOnSuccess}></BodegaNewItemButton>
            </div>
            <Tooltip title="Borrar">
                <span>
                    <ToolbarButton
                        ref={exportMenuTriggerRef}
                        id="export-menu-trigger"
                        aria-controls="export-menu"
                        aria-haspopup="true"
                        disabled={rowsSelected.length === 0}
                        aria-expanded={exportMenuOpen ? 'true' : undefined}
                        onClick={() => OpenPopUp(rowsSelected, url, title, deletionKey, handleUpdate)}
                    >
                        <DeleteIcon fontSize='small' color={rowsSelected.length === 0 ? 'disabled' : 'error'}></DeleteIcon>
                    </ToolbarButton>
                </span>
            </Tooltip>
            <Tooltip title="Columnas">
                <ColumnsPanelTrigger render={<ToolbarButton />}>
                    <ViewColumnIcon fontSize="small" />
                </ColumnsPanelTrigger>
            </Tooltip>

            <Tooltip title="Filtrar">
                <FilterPanelTrigger
                    render={(props, state) => (
                        <ToolbarButton {...props} color="default">
                            <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                <FilterListIcon fontSize="small" />
                            </Badge>
                        </ToolbarButton>
                    )}
                />
            </Tooltip>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Exportar">
                <ToolbarButton
                    ref={exportMenuTriggerRef}
                    id="export-menu-trigger"
                    aria-controls="export-menu"
                    aria-haspopup="true"
                    aria-expanded={exportMenuOpen ? 'true' : undefined}
                    onClick={() => setExportMenuOpen(true)}
                >
                    <FileDownloadIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
            <Tooltip title="Actualizar">
                <ToolbarButton
                    onClick={() => handleUpdate()}>
                    <RestartAltIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
            <Menu
                id="export-menu" anchorEl={exportMenuTriggerRef.current} open={exportMenuOpen} onClose={() => setExportMenuOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        'aria-labelledby': 'export-menu-trigger',
                    },
                }}>
                <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
                    Imprimir
                </ExportPrint>
                <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
                    Descargar CSV
                </ExportCsv>
            </Menu>
        </Toolbar>
    );
}
