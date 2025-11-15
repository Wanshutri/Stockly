import * as React from 'react';
import { NumberField as BaseNumberField } from '@base-ui-components/react/number-field';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * Placeholder para SSR (mantengo como antes).
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
    return null;
}
SSRInitialFilled.muiName = 'Input';

type Props = BaseNumberField.Root.Props & {
    label?: React.ReactNode;
    error?: string;
    // permitimos step y min por conveniencia
    step?: number;
    min?: number;

    // <-- añado explícitamente los props usados en modo "controlled"
    value?: number | string | null;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function NumberField({
    id: idProp,
    label,
    error = "",
    step = 1,
    min,
    ...other
}: Props) {
    let id = React.useId();
    if (idProp) id = idProp;

    // detectamos modo controlled: el padre pasó value y onChange
    const isControlled = Object.prototype.hasOwnProperty.call(other, 'value')
        && typeof (other as any).onChange === 'function';

    // helper para crear un ChangeEvent-like para el onChange del padre
    const makeChangeEvent = (value: string) =>
        ({ target: { value } } as unknown as React.ChangeEvent<HTMLInputElement>);

    if (isControlled) {
        // props.value puede ser número o "" según tu uso
        const controlledValue = (other as any).value;
        const controlledOnChange = (other as any).onChange as (e: React.ChangeEvent<HTMLInputElement>) => void;

        const increase = () => {
            const base = controlledValue === "" || controlledValue === null ? 0 : Number(controlledValue);
            const nv = base + (step ?? 1);
            if (typeof min === 'number' && nv < min) return;
            controlledOnChange(makeChangeEvent(String(nv)));
        };

        const decrease = () => {
            const base = controlledValue === "" || controlledValue === null ? 0 : Number(controlledValue);
            const nv = base - (step ?? 1);
            if (typeof min === 'number' && nv < min) return;
            controlledOnChange(makeChangeEvent(String(nv)));
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                increase();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                decrease();
            }
            // si el usuario necesita otro comportamiento, no lo interceptamos
        };

        return (
            <FormControl
                fullWidth
                disabled={(other as any).disabled}
                required={(other as any).required}
                error={!!error}
                variant="outlined"
            >
                <InputLabel htmlFor={id}>{label}</InputLabel>

                <OutlinedInput
                    id={id}
                    label={label}
                    inputProps={{
                        inputMode: 'numeric',
                    }}
                    value={controlledValue === null ? '' : String(controlledValue)}
                    onChange={controlledOnChange}
                    onKeyDown={handleKeyDown}
                    // no uso inputRef de BaseNumberField cuando estamos en modo controlled
                    endAdornment={
                        <InputAdornment
                            position="end"
                            sx={{
                                flexDirection: 'column',
                                maxHeight: 'unset',
                                alignSelf: 'stretch',
                                borderLeft: '1px solid',
                                borderColor: 'divider',
                                ml: 0,
                                '& button': {
                                    py: 0,
                                    flex: 1,
                                    borderRadius: 0.5,
                                },
                            }}
                        >
                            <IconButton aria-label="Increase" onClick={increase} size="small">
                                <KeyboardArrowUpIcon sx={{ transform: 'translateY(2px)' }} />
                            </IconButton>

                            <IconButton aria-label="Decrease" onClick={decrease} size="small">
                                <KeyboardArrowDownIcon sx={{ transform: 'translateY(-2px)' }} />
                            </IconButton>
                        </InputAdornment>
                    }
                    sx={{ pr: 0 }}
                />

                <FormHelperText sx={{ ml: 0, '&:empty': { mt: 0 } }}>
                    {error || ""}
                </FormHelperText>
            </FormControl>
        );
    }

    // Modo "uncontrolled" / comportamiento original: delegamos a BaseNumberField
    return (
        <BaseNumberField.Root
            allowWheelScrub
            {...other}
            render={(props, state) => (
                <FormControl
                    fullWidth={true}
                    ref={props.ref}
                    disabled={state.disabled}
                    required={state.required}
                    error={error ? true : false}
                    variant="outlined"
                >
                    {props.children}
                </FormControl>
            )}
        >
            <SSRInitialFilled {...other} />
            <InputLabel htmlFor={id}>{label}</InputLabel>

            <BaseNumberField.Input
                id={id}
                render={(props, state) => (
                    <OutlinedInput
                        fullWidth={true}
                        label={label}
                        inputRef={props.ref}
                        value={state.inputValue}
                        onBlur={props.onBlur}
                        onChange={props.onChange}
                        onKeyUp={props.onKeyUp}
                        onKeyDown={props.onKeyDown}
                        onFocus={props.onFocus}
                        slotProps={{
                            input: props,
                        }}
                        endAdornment={
                            <InputAdornment
                                position="end"
                                sx={{
                                    flexDirection: 'column',
                                    maxHeight: 'unset',
                                    alignSelf: 'stretch',
                                    borderLeft: '1px solid',
                                    borderColor: 'divider',
                                    ml: 0,
                                    '& button': {
                                        py: 0,
                                        flex: 1,
                                        borderRadius: 0.5,
                                    },
                                }}
                            >
                                <BaseNumberField.Increment
                                    render={<IconButton aria-label="Increase" />}
                                >
                                    <KeyboardArrowUpIcon sx={{ transform: 'translateY(2px)' }} />
                                </BaseNumberField.Increment>

                                <BaseNumberField.Decrement
                                    render={<IconButton aria-label="Decrease" />}
                                >
                                    <KeyboardArrowDownIcon sx={{ transform: 'translateY(-2px)' }} />
                                </BaseNumberField.Decrement>
                            </InputAdornment>
                        }
                        sx={{ pr: 0 }}
                    />
                )}
            />

            <FormHelperText sx={{ ml: 0, '&:empty': { mt: 0 } }}>
                {error ? error : ""}
            </FormHelperText>
        </BaseNumberField.Root>
    );
}
