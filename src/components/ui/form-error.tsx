/** Forma ostidagi xato xabari — kirish, ro'yxatdan o'tish va parolni tiklash sahifalarida. */
export function FormError({ message }: { message: string }) {
    return (
        <div
            role='alert'
            className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
        >
            {message}
        </div>
    );
}
