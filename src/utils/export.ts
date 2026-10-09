/**
 * Windows va Excel uchun to'liq mos .xlsx faylga eksport qilish yordamchisi.
 *
 * Xususiyatlari:
 * - Haqiqiy OpenXML (.xlsx) formati — Windows Excel uni bevosita, hech qanday import oynasisiz ochadi.
 * - Ustun kengliklarini avtomatik hisoblash va moslash.
 * - Matnli kataklar (telefon raqamlar `+998...`, kodlar) to'g'ri matn sifatida saqlanadi,
 *   Excel ularni formulaga yoki eksponensial songa (9.98E+11) aylantirib yubormaydi.
 * - Windows fayl nomlaridagi noqonuniy belgilar (`/ \ : * ? " < > |`) avtomatik tozalanadi.
 */
export async function exportToExcel(
    filename: string,
    sheetNameOrHeaders: string | string[],
    headersOrRows?:
        | string[]
        | (string | number | boolean | null | undefined)[][],
    maybeRows?: (string | number | boolean | null | undefined)[][],
): Promise<void> {
    const XLSX = await import('xlsx');

    let sheetName = 'Sheet1';
    let headers: string[] = [];
    let rows: (string | number | boolean | null | undefined)[][] = [];

    if (Array.isArray(sheetNameOrHeaders)) {
        headers = sheetNameOrHeaders;
        rows =
            (headersOrRows as (
                | string
                | number
                | boolean
                | null
                | undefined
            )[][]) || [];
    } else {
        sheetName = sheetNameOrHeaders || 'Sheet1';
        headers = (headersOrRows as string[]) || [];
        rows = maybeRows || [];
    }

    // Har bir qiymatni to'g'ri Excel formatiga moslashtirish
    const sanitizeCell = (
        val: string | number | boolean | null | undefined,
    ) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'number' || typeof val === 'boolean') return val;
        return String(val);
    };

    const formattedData = [
        headers,
        ...rows.map((row) => row.map(sanitizeCell)),
    ];

    const ws = XLSX.utils.aoa_to_sheet(formattedData);

    // Telefon raqamlari yoki matnlar string sifatida saqlanishini kafolatlash
    for (let r = 0; r < formattedData.length; r++) {
        for (let c = 0; c < headers.length; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c });
            const cell = ws[cellAddress];
            if (cell && typeof cell.v === 'string') {
                cell.t = 's';
            }
        }
    }

    // Ustun kengliklarini avtomatik hisoblash
    const colWidths = headers.map((header, colIndex) => {
        let maxLen = header.length;
        for (const row of rows) {
            const cellVal = row[colIndex];
            if (cellVal !== null && cellVal !== undefined) {
                const len = String(cellVal).length;
                if (len > maxLen) maxLen = len;
            }
        }
        return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
    });
    ws['!cols'] = colWidths;

    const cleanSheetName = (sheetName || 'Sheet1')
        .replace(/[/\\?*[\]:]/g, '_')
        .slice(0, 31);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

    const cleanFilename = (filename || 'export')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .trim();

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cleanFilename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Windows va Excel foydalanuvchilari uchun standart eksport funksiyasi.
 * CSV o'rniga zamonaviy va xavfsiz .xlsx formatida fayl yaratadi.
 */
export function exportToCsv(
    filename: string,
    headers: string[],
    rows: (string | number | boolean | null | undefined)[][],
) {
    void exportToExcel(filename, headers, rows);
}
