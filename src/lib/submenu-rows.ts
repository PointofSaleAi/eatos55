/** Fill two fitted rows, then keep every remaining entry in one scrolling row. */
export function submenuRows(widths: readonly number[], availableWidth: number, gap: number): number[][] {
  if (!widths.length) return [];
  const rows: number[][] = [[]];
  let used = 0;
  widths.forEach((width, index) => {
    let row = rows[rows.length - 1];
    if (!row) return;
    if (row.length && used + gap + width > availableWidth && rows.length < 3) {
      row = [];
      rows.push(row);
      used = 0;
    }
    used += (row.length ? gap : 0) + width;
    row.push(index);
  });
  return rows;
}