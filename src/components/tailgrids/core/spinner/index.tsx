import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { DefaultSpinner } from './default';

const spinnerStyles = cva('animate-spin', {
    variants: {
        size: {
            sm: 'size-5',
            md: 'size-7',
            lg: 'size-9',
            xl: 'size-10',
            xxl: 'size-12',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type PropsType = {
    className?: string;
} & VariantProps<typeof spinnerStyles>;

export function Spinner({ className, size = 'md' }: PropsType) {
    return (
        <DefaultSpinner
            className={cn(spinnerStyles({ size }), className)}
            percentage={50}
        />
    );
}
