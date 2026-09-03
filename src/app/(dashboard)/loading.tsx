import { Spinner } from '@/components/tailgrids/core/spinner';

export default function Loading() {
    return (
        <div className='flex min-h-64 items-center justify-center'>
            <Spinner />
        </div>
    );
}
