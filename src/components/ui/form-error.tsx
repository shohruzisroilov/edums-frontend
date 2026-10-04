/** Forma ostidagi xato xabari — kirish, ro'yxatdan o'tish va parolni tiklash sahifalarida. */
export function FormError({ message }: { message: string }) {
    return (
        <div
            role='alert'
            className='border-alert-danger-border bg-alert-danger-background text-alert-danger-title rounded-lg border px-4 py-2.5 text-sm'
        >
            {message}
        </div>
    );
}
