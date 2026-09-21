const form = document.querySelector<HTMLFormElement>('.filters');
const list = document.querySelector<HTMLElement>('#timeline-list');
const rows = Array.from(document.querySelectorAll<HTMLElement>('.event-row'));
const keys = ['q', 'category', 'year', 'org', 'sort'];
if (form && list) {
  const controls = Object.fromEntries(keys.map((key) => [key, form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement]));
  const initial = new URLSearchParams(location.search);
  for (const key of keys) {
    const value = initial.get(key);
    if (value && controls[key]) controls[key].value = value;
  }
  const apply = () => {
    const values = Object.fromEntries(keys.map((key) => [key, controls[key].value]));
    const sorted = rows.toSorted((a, b) => (a.dataset.date ?? '').localeCompare(b.dataset.date ?? '') * (values.sort === 'asc' ? 1 : -1));
    const visible = sorted.filter((row) => (!values.q || row.dataset.search?.includes(values.q.toLowerCase().trim()))
      && (!values.category || row.dataset.category === values.category)
      && (!values.year || row.dataset.date?.startsWith(values.year))
      && (!values.org || JSON.parse(row.dataset.org ?? '[]').includes(values.org)));
    for (const row of sorted) row.hidden = !visible.includes(row);
    list.replaceChildren(...sorted);
    const count = document.getElementById('result-count');
    if (count) count.textContent = String(visible.length);
    const empty = document.getElementById('no-results');
    if (empty) empty.hidden = visible.length > 0 || rows.length === 0;
    const query = new URLSearchParams(Object.entries(values).filter(([key, value]) => value && !(key === 'sort' && value === 'desc')));
    history.replaceState(null, '', `${location.pathname}${query.size ? `?${query}` : ''}${location.hash}`);
  };
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(apply));
  apply();
}
