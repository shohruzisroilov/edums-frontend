/**
 * Excel / CSV fayliga eksport qilish yordamchisi.
 * UTF-8 BOM (\uFEFF) bilan saqlanadi — Excel kirill va o'zbekcha harflarni
 * (Ў, Қ, Ғ, Ҳ) to'g'ri o'qiydi.
 */
export function exportToCsv(
    filename: string,
    headers: string[],
    rows: (string | number | boolean | null | undefined)[][],
) {
    const escapeCsv = (val: string | number | boolean | null | undefined): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const headerLine = headers.map(escapeCsv).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsv).join(','));
    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
