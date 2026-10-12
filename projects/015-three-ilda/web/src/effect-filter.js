const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim();

export function filterEffects(catalog, query = '', origin = 'all') {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return catalog.filter(entry => {
    const category = entry.origin === 'upstream' ? 'upstream' : 'original';
    const text = normalize(`${entry.name} ${entry.id} ${entry.en ?? ''}`);
    return (origin === 'all' || origin === category) && words.every(word => text.includes(word));
  });
}
